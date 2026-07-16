package in.neupanepralad.esports.file.dto;

import in.neupanepralad.esports.file.model.FileCategory;
import in.neupanepralad.esports.file.model.StoredFile;

import java.time.LocalDateTime;
import java.util.UUID;

public record StoredFileResponse(
        UUID id,
        UUID tournamentId,
        FileCategory category,
        String originalName,
        String contentType,
        long sizeBytes,
        String sha256,
        boolean privateFile,
        LocalDateTime createdAt
) {
    public static StoredFileResponse from(StoredFile file) {
        return new StoredFileResponse(
                file.getId(),
                file.getTournament() == null ? null : file.getTournament().getId(),
                file.getCategory(),
                file.getOriginalName(),
                file.getContentType(),
                file.getSizeBytes(),
                file.getSha256(),
                file.isPrivateFile(),
                file.getCreatedAt()
        );
    }
}
