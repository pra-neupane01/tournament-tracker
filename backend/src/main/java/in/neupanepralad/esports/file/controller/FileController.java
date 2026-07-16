package in.neupanepralad.esports.file.controller;

import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.file.dto.StoredFileResponse;
import in.neupanepralad.esports.file.model.FileCategory;
import in.neupanepralad.esports.file.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping(path = "/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public APIResponse<StoredFileResponse> upload(
            Authentication authentication,
            @RequestParam(required = false) UUID tournamentId,
            @RequestParam(defaultValue = "OTHER") FileCategory category,
            @RequestParam(defaultValue = "true") boolean privateFile,
            @RequestPart("file") MultipartFile file
    ) {
        return APIResponse.success(
                "File uploaded",
                fileStorageService.upload(
                        userId(authentication),
                        tournamentId,
                        category,
                        privateFile,
                        file
                )
        );
    }

    @GetMapping("/files/{fileId}")
    public ResponseEntity<byte[]> download(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {
        var download = fileStorageService.download(fileId, userId(authentication));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(download.filename(), StandardCharsets.UTF_8)
                                .build()
                                .toString()
                )
                .body(download.content());
    }

    @DeleteMapping("/files/{fileId}")
    public APIResponse<Void> delete(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {
        fileStorageService.delete(fileId, userId(authentication));
        return APIResponse.success("File deleted");
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
