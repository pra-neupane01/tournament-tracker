package in.neupanepralad.esports.game.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "games")
@Getter
@Setter
public class Game extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GamePlatform platform;

    @Column(nullable = false)
    private int teamSize;

    @Column(nullable = false)
    private int substituteLimit;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private boolean active = true;
}
