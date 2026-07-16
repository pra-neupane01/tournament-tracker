package in.neupanepralad.esports.team.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.organization.model.Organization;
import in.neupanepralad.esports.user.model.User;
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
        name = "teams",
        uniqueConstraints = @UniqueConstraint(columnNames = {"game_id", "name"})
)
@Getter
@Setter
public class Team extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 20)
    private String shortName;

    @Column(length = 255)
    private String logoUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manager_id", nullable = false)
    private User manager;
}
