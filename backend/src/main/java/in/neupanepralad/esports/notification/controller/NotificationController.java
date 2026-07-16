package in.neupanepralad.esports.notification.controller;

import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.notification.dto.AnnouncementRequest;
import in.neupanepralad.esports.notification.dto.NotificationResponse;
import in.neupanepralad.esports.notification.dto.UnreadCountResponse;
import in.neupanepralad.esports.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/notifications")
    public APIResponse<PagedResponse<NotificationResponse>> list(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return APIResponse.success(
                "Notifications retrieved",
                notificationService.list(userId(authentication), page, size)
        );
    }

    @GetMapping("/notifications/unread-count")
    public APIResponse<UnreadCountResponse> unreadCount(Authentication authentication) {
        return APIResponse.success(
                "Unread count retrieved",
                notificationService.unreadCount(userId(authentication))
        );
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public APIResponse<NotificationResponse> markRead(
            @PathVariable UUID notificationId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Notification marked as read",
                notificationService.markRead(notificationId, userId(authentication))
        );
    }

    @PostMapping("/notifications/read-all")
    public APIResponse<Void> markAllRead(Authentication authentication) {
        notificationService.markAllRead(userId(authentication));
        return APIResponse.success("All notifications marked as read");
    }

    @PostMapping("/tournaments/{tournamentId}/announcements")
    public APIResponse<Void> announce(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @Valid @RequestBody AnnouncementRequest request
    ) {
        notificationService.announce(
                tournamentId,
                userId(authentication),
                request.title(),
                request.message()
        );
        return APIResponse.success("Announcement sent");
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
