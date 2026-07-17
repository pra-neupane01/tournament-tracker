package in.neupanepralad.esports.auth.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification_tokens")
@Getter @Setter
public class EmailVerificationToken extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, unique = true, length = 128)
    private String tokenHash;
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    private LocalDateTime verifiedAt;
}
