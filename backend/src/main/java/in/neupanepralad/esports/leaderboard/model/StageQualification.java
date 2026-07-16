package in.neupanepralad.esports.leaderboard.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.competition.model.StageGroup;
import in.neupanepralad.esports.competition.model.TournamentStage;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "stage_qualifications",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"from_stage_id", "registration_id"}
        )
)
@Getter
@Setter
public class StageQualification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "from_stage_id", nullable = false)
    private TournamentStage fromStage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_stage_id", nullable = false)
    private TournamentStage toStage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_group_id")
    private StageGroup sourceGroup;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id", nullable = false)
    private TournamentRegistration registration;

    @Column(nullable = false)
    private int sourceRank;

    @Column(nullable = false)
    private boolean manual;

    @Column(nullable = false)
    private LocalDateTime qualifiedAt;
}
