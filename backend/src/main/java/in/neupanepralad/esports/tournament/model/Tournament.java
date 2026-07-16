package in.neupanepralad.esports.tournament.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.organization.model.Organization;
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
@Table(name = "tournaments")
@Getter
@Setter
public class Tournament extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Column(length = 5000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TournamentFormat format;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TournamentStatus status = TournamentStatus.DRAFT;

    @Column(nullable = false, length = 60)
    private String timeZone;

    private LocalDateTime registrationOpensAt;

    private LocalDateTime registrationClosesAt;

    @Column(nullable = false)
    private LocalDateTime startsAt;

    private LocalDateTime endsAt;

    @Column(nullable = false)
    private int minimumTeams;

    @Column(nullable = false)
    private int maximumTeams;

    @Column(nullable = false)
    private int minimumRosterSize;

    @Column(nullable = false)
    private int maximumRosterSize;

    @Column(nullable = false)
    private boolean allowSubstitutes;

    @Column(nullable = false)
    private boolean publicVisible = true;
}
