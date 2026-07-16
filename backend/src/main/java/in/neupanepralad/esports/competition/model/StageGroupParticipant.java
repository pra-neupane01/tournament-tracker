package in.neupanepralad.esports.competition.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
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

@Entity
@Table(
        name = "stage_group_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"group_id", "registration_id"})
)
@Getter
@Setter
public class StageGroupParticipant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private StageGroup group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id", nullable = false)
    private TournamentRegistration registration;

    @Column(nullable = false)
    private int seed;
}
