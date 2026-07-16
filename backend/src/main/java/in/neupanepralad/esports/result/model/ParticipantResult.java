package in.neupanepralad.esports.result.model;

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

import java.math.BigDecimal;

@Entity
@Table(
        name = "participant_results",
        uniqueConstraints = @UniqueConstraint(columnNames = {"submission_id", "registration_id"})
)
@Getter
@Setter
public class ParticipantResult extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private ResultSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id", nullable = false)
    private TournamentRegistration registration;

    @Column(nullable = false)
    private int placement;

    @Column(nullable = false, precision = 14, scale = 4)
    private BigDecimal totalPoints;
}
