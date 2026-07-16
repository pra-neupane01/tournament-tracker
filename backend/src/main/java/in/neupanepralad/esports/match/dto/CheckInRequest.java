package in.neupanepralad.esports.match.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CheckInRequest(@NotNull UUID registrationId) {
}
