package in.neupanepralad.esports.scoring.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PlacementScoringRuleRequest(
        @Min(1) int placement,
        @NotNull BigDecimal points
) {
}
