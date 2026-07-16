package in.neupanepralad.esports.certificate.repository;

import in.neupanepralad.esports.certificate.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findByVerificationCode(String verificationCode);

    List<Certificate> findAllByRecipientIdOrderByIssuedAtDesc(UUID recipientId);

    List<Certificate> findAllByTournamentIdOrderByIssuedAtDesc(UUID tournamentId);
}
