package in.neupanepralad.esports.match.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.competition.model.Fixture;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "match_rooms")
@Getter
@Setter
public class MatchRoom extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fixture_id", nullable = false, unique = true)
    private Fixture fixture;

    @Column(nullable = false, length = 120)
    private String roomCode;

    @Column(length = 1000)
    private String encryptedPassword;

    @Column(length = 120)
    private String serverName;

    @Column(length = 2000)
    private String instructions;
}
