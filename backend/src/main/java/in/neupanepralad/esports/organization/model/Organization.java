package in.neupanepralad.esports.organization.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "organizations")
@Getter
@Setter
public class Organization extends BaseEntity {

    @Column(nullable = false, length = 160)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private OrganizationType type;

    @Column(length = 2000)
    private String description;

    @Column(length = 255)
    private String website;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String city;

    @Column(nullable = false)
    private boolean verified;
}
