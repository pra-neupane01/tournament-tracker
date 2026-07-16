package in.neupanepralad.esports.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnnouncementRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 3000) String message
) {
}
