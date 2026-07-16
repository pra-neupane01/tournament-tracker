package in.neupanepralad.esports.notification.repository;

import in.neupanepralad.esports.notification.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findAllByUserId(UUID userId, Pageable pageable);

    long countByUserIdAndReadFalse(UUID userId);

    @Modifying
    @Query("""
            UPDATE Notification notification
            SET notification.read = true, notification.readAt = :readAt
            WHERE notification.user.id = :userId AND notification.read = false
            """)
    void markAllRead(@Param("userId") UUID userId, @Param("readAt") LocalDateTime readAt);
}
