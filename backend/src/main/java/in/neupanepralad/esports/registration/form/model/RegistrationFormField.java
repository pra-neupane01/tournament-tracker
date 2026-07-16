package in.neupanepralad.esports.registration.form.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.tournament.model.Tournament;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "registration_form_fields",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tournament_id", "field_key"})
)
@Getter
@Setter
public class RegistrationFormField extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(name = "field_key", nullable = false, length = 80)
    private String fieldKey;

    @Column(nullable = false, length = 160)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FormFieldType type;

    @Column(length = 500)
    private String helpText;

    @Column(length = 255)
    private String placeholder;

    @Column(nullable = false)
    private boolean required;

    @Column(length = 500)
    private String validationPattern;

    private Integer minimumLength;

    private Integer maximumLength;

    @Column(nullable = false)
    private int sortOrder;

    @ElementCollection
    @CollectionTable(
            name = "registration_form_field_options",
            joinColumns = @JoinColumn(name = "field_id")
    )
    @OrderColumn(name = "option_order")
    @Column(name = "option_value", nullable = false, length = 255)
    private List<String> options = new ArrayList<>();
}
