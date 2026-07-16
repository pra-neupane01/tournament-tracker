package in.neupanepralad.esports.certificate.dto;

import in.neupanepralad.esports.certificate.model.CertificateType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CertificateIssueRequest(
        @NotNull UUID recipientId,
        UUID registrationId,
        @NotNull CertificateType type,
        @NotBlank @Size(max = 180) String title
) {
}
