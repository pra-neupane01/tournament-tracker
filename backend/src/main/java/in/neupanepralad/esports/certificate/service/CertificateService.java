package in.neupanepralad.esports.certificate.service;

import in.neupanepralad.esports.certificate.dto.CertificateIssueRequest;
import in.neupanepralad.esports.certificate.dto.CertificateResponse;
import in.neupanepralad.esports.certificate.model.Certificate;
import in.neupanepralad.esports.certificate.repository.CertificateRepository;
import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ForbiddenException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final TournamentAccessService tournamentAccessService;
    private final CertificatePdfRenderer pdfRenderer;

    @Transactional
    public CertificateResponse issue(
            UUID tournamentId,
            UUID actorId,
            CertificateIssueRequest request
    ) {
        Tournament tournament = tournamentAccessService.requireManager(tournamentId, actorId);
        User recipient = requireUser(request.recipientId());
        TournamentRegistration registration = null;
        if (request.registrationId() != null) {
            registration = registrationRepository.findById(request.registrationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
            if (!registration.getTournament().getId().equals(tournamentId)) {
                throw new BadRequestException("Registration is not part of this tournament");
            }
        }
        Certificate certificate = new Certificate();
        certificate.setTournament(tournament);
        certificate.setRecipient(recipient);
        certificate.setRegistration(registration);
        certificate.setType(request.type());
        certificate.setTitle(request.title().trim());
        certificate.setSerialNumber(
                "CERT-" + LocalDateTime.now(ZoneOffset.UTC).getYear() + "-"
                        + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
        );
        certificate.setVerificationCode(randomCode());
        certificate.setIssuedAt(LocalDateTime.now(ZoneOffset.UTC));
        certificate.setIssuedBy(requireUser(actorId));
        return CertificateResponse.from(certificateRepository.save(certificate));
    }

    @Transactional(readOnly = true)
    public CertificateResponse verify(String verificationCode) {
        return CertificateResponse.from(
                certificateRepository.findByVerificationCode(verificationCode)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Certificate not found"
                        ))
        );
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> myCertificates(UUID userId) {
        return certificateRepository.findAllByRecipientIdOrderByIssuedAtDesc(userId)
                .stream().map(CertificateResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> tournamentCertificates(
            UUID tournamentId,
            UUID actorId
    ) {
        tournamentAccessService.requireManager(tournamentId, actorId);
        return certificateRepository.findAllByTournamentIdOrderByIssuedAtDesc(tournamentId)
                .stream().map(CertificateResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CertificateDownload download(UUID certificateId, UUID actorId) {
        Certificate certificate = requireCertificate(certificateId);
        if (!certificate.getRecipient().getId().equals(actorId)) {
            try {
                tournamentAccessService.requireManager(
                        certificate.getTournament().getId(),
                        actorId
                );
            } catch (ForbiddenException exception) {
                throw new ForbiddenException("Certificate access is restricted");
            }
        }
        return new CertificateDownload(
                certificate.getSerialNumber() + ".pdf",
                pdfRenderer.render(certificate)
        );
    }

    @Transactional
    public CertificateResponse revoke(UUID certificateId, UUID actorId) {
        Certificate certificate = requireCertificate(certificateId);
        tournamentAccessService.requireManager(
                certificate.getTournament().getId(),
                actorId
        );
        certificate.setRevoked(true);
        certificate.setRevokedAt(LocalDateTime.now(ZoneOffset.UTC));
        return CertificateResponse.from(certificate);
    }

    private Certificate requireCertificate(UUID certificateId) {
        return certificateRepository.findById(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String randomCode() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public record CertificateDownload(String filename, byte[] content) {
    }
}
