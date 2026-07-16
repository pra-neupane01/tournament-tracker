package in.neupanepralad.esports.team.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.user.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "team_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"team_id", "user_id"}),
                @UniqueConstraint(columnNames = {"team_id", "player_uid"})
        }
)
@Getter
@Setter
public class TeamMember extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "player_uid", nullable = false, length = 100)
    private String playerUid;

    @Column(nullable = false, length = 100)
    private String inGameName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RosterRole role;

    @Column(nullable = false)
    private boolean active = true;
}
