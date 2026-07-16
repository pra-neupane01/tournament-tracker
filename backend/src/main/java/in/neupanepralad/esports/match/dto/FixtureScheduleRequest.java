package in.neupanepralad.esports.match.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record FixtureScheduleRequest(
        @NotNull LocalDateTime scheduledAt,
        @Min(1) int durationMinutes,
        LocalDateTime checkInOpensAt,
        LocalDateTime checkInClosesAt,
        @Size(max = 255) String venue,
        @Size(max = 500) String streamUrl
) {
}
