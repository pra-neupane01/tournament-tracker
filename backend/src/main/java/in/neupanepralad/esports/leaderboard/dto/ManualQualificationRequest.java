package in.neupanepralad.esports.leaderboard.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record ManualQualificationRequest(
        @NotNull UUID toStageId,
        @NotEmpty @Size(max = 1000) List<UUID> registrationIds
) {
}
