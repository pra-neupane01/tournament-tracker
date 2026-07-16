package in.neupanepralad.esports.match.dto;

import in.neupanepralad.esports.match.model.CheckInStatus;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CheckInStatusRequest(
        @NotNull UUID registrationId,
        @NotNull CheckInStatus status
) {
}
