package in.neupanepralad.esports.competition.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
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
@Table(name = "fixtures")
@Getter
@Setter
public class Fixture extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stage_id", nullable = false)
    private TournamentStage stage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private StageGroup group;

    @Column(nullable = false)
    private int roundNumber;

    @Column(nullable = false)
    private int matchNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FixtureStatus status = FixtureStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_registration_id")
    private TournamentRegistration winner;

    private LocalDateTime scheduledAt;

    @Column(nullable = false)
    private int durationMinutes = 60;

    private LocalDateTime checkInOpensAt;

    private LocalDateTime checkInClosesAt;

    @Column(length = 255)
    private String venue;

    @Column(length = 500)
    private String streamUrl;
}
