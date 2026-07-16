package in.neupanepralad.esports.certificate.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.user.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Getter
@Setter
public class Certificate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private TournamentRegistration registration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CertificateType type;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, unique = true, length = 80)
    private String serialNumber;

    @Column(nullable = false, unique = true, length = 100)
    private String verificationCode;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "issued_by", nullable = false)
    private User issuedBy;

    @Column(nullable = false)
    private boolean revoked;

    private LocalDateTime revokedAt;
}
