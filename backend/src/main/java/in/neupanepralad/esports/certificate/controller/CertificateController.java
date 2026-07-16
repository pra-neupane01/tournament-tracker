package in.neupanepralad.esports.certificate.controller;

import in.neupanepralad.esports.certificate.dto.CertificateIssueRequest;
import in.neupanepralad.esports.certificate.dto.CertificateResponse;
import in.neupanepralad.esports.certificate.service.CertificateService;
import in.neupanepralad.esports.common.response.APIResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping("/tournaments/{tournamentId}/certificates")
    public APIResponse<CertificateResponse> issue(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @Valid @RequestBody CertificateIssueRequest request
    ) {
        return APIResponse.success(
                "Certificate issued",
                certificateService.issue(
                        tournamentId,
                        userId(authentication),
                        request
                )
        );
    }

    @GetMapping("/tournaments/{tournamentId}/certificates")
    public APIResponse<List<CertificateResponse>> tournamentCertificates(
            @PathVariable UUID tournamentId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Certificates retrieved",
                certificateService.tournamentCertificates(
                        tournamentId,
                        userId(authentication)
                )
        );
    }

    @GetMapping("/certificates/mine")
    public APIResponse<List<CertificateResponse>> mine(Authentication authentication) {
        return APIResponse.success(
                "Certificates retrieved",
                certificateService.myCertificates(userId(authentication))
        );
    }

    @GetMapping("/certificates/verify/{verificationCode}")
    public APIResponse<CertificateResponse> verify(
            @PathVariable String verificationCode
    ) {
        return APIResponse.success(
                "Certificate verified",
                certificateService.verify(verificationCode)
        );
    }

    @GetMapping("/certificates/{certificateId}/download")
    public ResponseEntity<byte[]> download(
            @PathVariable UUID certificateId,
            Authentication authentication
    ) {
        var download = certificateService.download(
                certificateId,
                userId(authentication)
        );
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(download.filename(), StandardCharsets.UTF_8)
                                .build()
                                .toString()
                )
                .body(download.content());
    }

    @PostMapping("/certificates/{certificateId}/revoke")
    public APIResponse<CertificateResponse> revoke(
            @PathVariable UUID certificateId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Certificate revoked",
                certificateService.revoke(certificateId, userId(authentication))
        );
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
