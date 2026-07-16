package in.neupanepralad.esports.auth.repository;

import in.neupanepralad.esports.auth.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);

    void deleteAllByExpiresAtBefore(LocalDateTime cutoff);
}
