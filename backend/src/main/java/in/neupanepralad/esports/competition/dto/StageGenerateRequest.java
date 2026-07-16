package in.neupanepralad.esports.competition.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record StageGenerateRequest(@Min(1) @Max(100) int groupCount) {
}
