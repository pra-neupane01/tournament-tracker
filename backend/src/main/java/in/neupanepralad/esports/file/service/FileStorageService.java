package in.neupanepralad.esports.file.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ForbiddenException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.file.dto.StoredFileResponse;
import in.neupanepralad.esports.file.model.FileCategory;
import in.neupanepralad.esports.file.model.StoredFile;
import in.neupanepralad.esports.file.repository.StoredFileRepository;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final StoredFileRepository fileRepository;
    private final UserRepository userRepository;
    private final TournamentAccessService tournamentAccessService;

    @Value("${app.files.storage-path:./data/uploads}")
    private String storagePath;

    @Transactional
    public StoredFileResponse upload(
            UUID actorId,
            UUID tournamentId,
            FileCategory category,
            boolean privateFile,
            MultipartFile multipartFile
    ) {
        if (multipartFile.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        User owner = requireUser(actorId);
        Tournament tournament = null;
        if (tournamentId != null) {
            tournament = tournamentAccessService.requireManager(tournamentId, actorId);
        }
        String originalName = sanitizeName(multipartFile.getOriginalFilename());
        String extension = extension(originalName);
        LocalDate today = LocalDate.now();
        String storageKey = "%d/%02d/%s%s".formatted(
                today.getYear(),
                today.getMonthValue(),
                UUID.randomUUID(),
                extension
        );
        Path root = Path.of(storagePath).toAbsolutePath().normalize();
        Path destination = root.resolve(storageKey).normalize();
        if (!destination.startsWith(root)) {
            throw new BadRequestException("Invalid file path");
        }
        try {
            Files.createDirectories(destination.getParent());
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] content = multipartFile.getBytes();
            Files.copy(
                    new java.io.ByteArrayInputStream(content),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );
            StoredFile storedFile = new StoredFile();
            storedFile.setOwner(owner);
            storedFile.setTournament(tournament);
            storedFile.setCategory(category);
            storedFile.setOriginalName(originalName);
            storedFile.setStorageKey(storageKey.replace('\\', '/'));
            storedFile.setContentType(multipartFile.getContentType() == null
                    ? "application/octet-stream"
                    : multipartFile.getContentType());
            storedFile.setSizeBytes(content.length);
            storedFile.setSha256(HexFormat.of().formatHex(digest.digest(content)));
            storedFile.setPrivateFile(privateFile);
            return StoredFileResponse.from(fileRepository.save(storedFile));
        } catch (Exception exception) {
            try {
                Files.deleteIfExists(destination);
            } catch (IOException ignored) {
                // Preserve the original storage exception.
            }
            throw new IllegalStateException("Unable to store file", exception);
        }
    }

    @Transactional(readOnly = true)
    public FileDownload download(UUID fileId, UUID actorId) {
        StoredFile file = requireFile(fileId);
        requireAccess(file, actorId);
        Path root = Path.of(storagePath).toAbsolutePath().normalize();
        Path path = root.resolve(file.getStorageKey()).normalize();
        if (!path.startsWith(root) || !Files.exists(path)) {
            throw new ResourceNotFoundException("Stored file content not found");
        }
        try {
            return new FileDownload(
                    file.getOriginalName(),
                    file.getContentType(),
                    Files.readAllBytes(path)
            );
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to read stored file", exception);
        }
    }

    @Transactional
    public void delete(UUID fileId, UUID actorId) {
        StoredFile file = requireFile(fileId);
        requireAccess(file, actorId);
        Path root = Path.of(storagePath).toAbsolutePath().normalize();
        Path path = root.resolve(file.getStorageKey()).normalize();
        try {
            if (path.startsWith(root)) {
                Files.deleteIfExists(path);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to delete stored file", exception);
        }
        fileRepository.delete(file);
    }

    private void requireAccess(StoredFile file, UUID actorId) {
        if (!file.isPrivateFile() || file.getOwner().getId().equals(actorId)) {
            return;
        }
        if (file.getTournament() != null) {
            try {
                tournamentAccessService.requireManager(file.getTournament().getId(), actorId);
                return;
            } catch (ForbiddenException ignored) {
                // Fall through to the file-specific error.
            }
        }
        throw new ForbiddenException("File access is restricted");
    }

    private StoredFile requireFile(UUID fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String sanitizeName(String filename) {
        String name = filename == null ? "file" : Path.of(filename).getFileName().toString();
        name = name.replaceAll("[\\r\\n]", "_").trim();
        return name.isBlank() ? "file" : name;
    }

    private String extension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0 || filename.length() - index > 12) {
            return "";
        }
        return filename.substring(index).replaceAll("[^A-Za-z0-9.]", "");
    }

    public record FileDownload(String filename, String contentType, byte[] content) {
    }
}
