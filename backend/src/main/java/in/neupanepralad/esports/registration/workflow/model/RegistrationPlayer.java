package in.neupanepralad.esports.registration.workflow.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.team.model.RosterRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "registration_players",
        uniqueConstraints = @UniqueConstraint(columnNames = {"registration_id", "user_id"})
)
@Getter
@Setter
public class RegistrationPlayer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id", nullable = false)
    private TournamentRegistration registration;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, length = 100)
    private String playerUid;

    @Column(nullable = false, length = 100)
    private String inGameName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RosterRole rosterRole;
}
