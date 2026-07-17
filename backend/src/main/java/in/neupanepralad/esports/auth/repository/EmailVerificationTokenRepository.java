package in.neupanepralad.esports.auth.repository;

import in.neupanepralad.esports.auth.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    Optional<EmailVerificationToken> findByTokenHashAndVerifiedAtIsNull(String tokenHash);
    void deleteByUserId(UUID userId);
}
