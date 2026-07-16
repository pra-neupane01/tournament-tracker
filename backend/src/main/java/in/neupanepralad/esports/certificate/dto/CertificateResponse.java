package in.neupanepralad.esports.certificate.dto;

import in.neupanepralad.esports.certificate.model.Certificate;
import in.neupanepralad.esports.certificate.model.CertificateType;

import java.time.LocalDateTime;
import java.util.UUID;

public record CertificateResponse(
        UUID id,
        UUID tournamentId,
        String tournamentName,
        UUID recipientId,
        String recipientName,
        CertificateType type,
        String title,
        String serialNumber,
        String verificationCode,
        LocalDateTime issuedAt,
        boolean revoked
) {
    public static CertificateResponse from(Certificate certificate) {
        return new CertificateResponse(
                certificate.getId(),
                certificate.getTournament().getId(),
                certificate.getTournament().getName(),
                certificate.getRecipient().getId(),
                certificate.getRecipient().getFullName(),
                certificate.getType(),
                certificate.getTitle(),
                certificate.getSerialNumber(),
                certificate.getVerificationCode(),
                certificate.getIssuedAt(),
                certificate.isRevoked()
        );
    }
}
