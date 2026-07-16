package in.neupanepralad.esports.notification;

import in.neupanepralad.esports.notification.model.NotificationType;
import in.neupanepralad.esports.notification.repository.NotificationRepository;
import in.neupanepralad.esports.notification.service.NotificationService;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class NotificationServiceTests {

    @Autowired NotificationService notificationService;
    @Autowired NotificationRepository notificationRepository;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void notificationsPersistAndCanBeMarkedRead() {
        User user = new User();
        user.setFullName("Notification User");
        user.setEmail("notification-user@example.com");
        user.setPasswordHash(passwordEncoder.encode("secure-pass-123"));
        userRepository.save(user);

        var created = notificationService.send(
                user,
                NotificationType.SYSTEM,
                "Welcome",
                "Your account is ready.",
                "/dashboard"
        );

        assertThat(notificationService.unreadCount(user.getId()).unreadCount()).isEqualTo(1);
        assertThat(notificationService.markRead(created.id(), user.getId()).read()).isTrue();
    }
}
