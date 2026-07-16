package in.neupanepralad.esports.notification.model;

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
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 3000)
    private String message;

    @Column(length = 500)
    private String link;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    private LocalDateTime readAt;
}
