package in.neupanepralad.esports.result.model;

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

import java.math.BigDecimal;

@Entity
@Table(
        name = "result_metrics",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"participant_result_id", "metric_key"}
        )
)
@Getter
@Setter
public class ResultMetric extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_result_id", nullable = false)
    private ParticipantResult participantResult;

    @Column(name = "metric_key", nullable = false, length = 80)
    private String metricKey;

    @Column(nullable = false, precision = 14, scale = 4)
    private BigDecimal metricValue;

    @Column(nullable = false, precision = 14, scale = 4)
    private BigDecimal awardedPoints;
}
