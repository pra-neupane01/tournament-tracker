package in.neupanepralad.esports.competition.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
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
        name = "stage_groups",
        uniqueConstraints = @UniqueConstraint(columnNames = {"stage_id", "group_number"})
)
@Getter
@Setter
public class StageGroup extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stage_id", nullable = false)
    private TournamentStage stage;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(name = "group_number", nullable = false)
    private int groupNumber;
}
