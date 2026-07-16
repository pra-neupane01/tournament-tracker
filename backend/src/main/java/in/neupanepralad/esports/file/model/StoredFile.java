package in.neupanepralad.esports.file.model;

import in.neupanepralad.esports.common.entity.BaseEntity;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.user.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "stored_files")
@Getter
@Setter
public class StoredFile extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FileCategory category;

    @Column(nullable = false, length = 255)
    private String originalName;

    @Column(nullable = false, unique = true, length = 500)
    private String storageKey;

    @Column(nullable = false, length = 150)
    private String contentType;

    @Column(nullable = false)
    private long sizeBytes;

    @Column(nullable = false, length = 64)
    private String sha256;

    @Column(name = "is_private", nullable = false)
    private boolean privateFile = true;
}
