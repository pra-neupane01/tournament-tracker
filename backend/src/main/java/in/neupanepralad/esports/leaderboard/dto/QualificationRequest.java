package in.neupanepralad.esports.leaderboard.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record QualificationRequest(
        @NotNull UUID toStageId,
        @Min(1) int qualifierCount,
        boolean perGroup
) {
}
