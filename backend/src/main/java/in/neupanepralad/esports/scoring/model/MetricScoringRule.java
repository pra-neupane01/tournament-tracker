package in.neupanepralad.esports.scoring.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.competition.model.TournamentStage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
        name = "metric_scoring_rules",
        uniqueConstraints = @UniqueConstraint(columnNames = {"stage_id", "metric_key"})
)
@Getter
@Setter
public class MetricScoringRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stage_id", nullable = false)
    private TournamentStage stage;

    @Column(name = "metric_key", nullable = false, length = 80)
    private String metricKey;

    @Column(nullable = false, length = 120)
    private String label;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal pointsPerUnit;

    @Column(nullable = false)
    private int sortOrder;
}
