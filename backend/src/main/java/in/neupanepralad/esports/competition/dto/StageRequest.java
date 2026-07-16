package in.neupanepralad.esports.competition.dto;

import in.neupanepralad.esports.competition.model.StageStatus;
import in.neupanepralad.esports.competition.model.StageType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StageRequest(
        @NotBlank @Size(max = 160) String name,
        @NotNull StageType type,
        @NotNull StageStatus status,
        @Min(1) int sequenceNumber,
        @Min(1) @Max(99) int bestOf,
        @Min(0) @Max(1000) int qualifiersPerGroup
) {
}
