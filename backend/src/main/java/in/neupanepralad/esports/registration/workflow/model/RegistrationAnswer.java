package in.neupanepralad.esports.registration.workflow.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "registration_answers")
@Getter
@Setter
public class RegistrationAnswer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id", nullable = false)
    private TournamentRegistration registration;

    @Column(nullable = false, length = 80)
    private String fieldKey;

    @Column(nullable = false, length = 160)
    private String fieldLabel;

    @Column(name = "answer_value", nullable = false, length = 10000)
    private String value;

    @Column(nullable = false)
    private int valueOrder;
}
