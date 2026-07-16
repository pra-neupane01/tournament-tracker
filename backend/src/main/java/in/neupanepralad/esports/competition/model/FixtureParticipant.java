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
        name = "fixture_participants",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"fixture_id", "registration_id"}),
                @UniqueConstraint(columnNames = {"fixture_id", "slot_number"})
        }
)
@Getter
@Setter
public class FixtureParticipant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fixture_id", nullable = false)
    private Fixture fixture;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id", nullable = false)
    private TournamentRegistration registration;

    @Column(nullable = false)
    private int slotNumber;

    @Column(nullable = false)
    private int seed;
}
