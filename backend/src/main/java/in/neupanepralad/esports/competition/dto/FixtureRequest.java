package in.neupanepralad.esports.competition.dto;

import in.neupanepralad.esports.competition.model.FixtureStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record FixtureRequest(
        UUID groupId,
        @Min(1) int roundNumber,
        @Min(1) int matchNumber,
        @NotNull FixtureStatus status,
        @NotEmpty @Size(max = 100) List<UUID> participantRegistrationIds,
        UUID winnerRegistrationId
) {
}
