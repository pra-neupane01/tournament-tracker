package in.neupanepralad.esports.notification.service;

import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.notification.dto.NotificationResponse;
import in.neupanepralad.esports.notification.dto.UnreadCountResponse;
import in.neupanepralad.esports.notification.model.Notification;
import in.neupanepralad.esports.notification.model.NotificationType;
import in.neupanepralad.esports.notification.repository.NotificationRepository;
import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import in.neupanepralad.esports.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final TournamentAccessService tournamentAccessService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public NotificationResponse send(
            User user,
            NotificationType type,
            String title,
            String message,
            String link
    ) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        NotificationResponse response = NotificationResponse.from(
                notificationRepository.save(notification)
        );
        messagingTemplate.convertAndSendToUser(
                user.getId().toString(),
                "/queue/notifications",
                response
        );
        return response;
    }

    @Transactional
    public void announce(
            UUID tournamentId,
            UUID actorId,
            String title,
            String message
    ) {
        Tournament tournament = tournamentAccessService.requireManager(
                tournamentId,
                actorId
        );
        Set<User> recipients = new LinkedHashSet<>();
        registrationRepository
                .findAllByTournamentIdAndStatusOrderBySubmittedAtAsc(
                        tournamentId,
                        RegistrationStatus.APPROVED
                )
                .forEach(registration -> recipients.add(registration.getSubmittedBy()));
        recipients.forEach(user -> send(
                user,
                NotificationType.ANNOUNCEMENT,
                title,
                message,
                "/tournaments/" + tournamentId
        ));
        messagingTemplate.convertAndSend(
                "/topic/tournaments/" + tournamentId,
                new TournamentAnnouncement(tournamentId, tournament.getName(), title, message)
        );
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> list(UUID userId, int page, int size) {
        return PagedResponse.of(
                notificationRepository.findAllByUserId(
                                userId,
                                PageRequest.of(
                                        Math.max(0, page),
                                        Math.min(Math.max(size, 1), 100),
                                        Sort.by(Sort.Direction.DESC, "createdAt")
                                )
                        )
                        .map(NotificationResponse::from)
        );
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount(UUID userId) {
        return new UnreadCountResponse(
                notificationRepository.countByUserIdAndReadFalse(userId)
        );
    }

    @Transactional
    public NotificationResponse markRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now(ZoneOffset.UTC));
        }
        return NotificationResponse.from(notification);
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllRead(userId, LocalDateTime.now(ZoneOffset.UTC));
    }

    public record TournamentAnnouncement(
            UUID tournamentId,
            String tournamentName,
            String title,
            String message
    ) {
    }
}
