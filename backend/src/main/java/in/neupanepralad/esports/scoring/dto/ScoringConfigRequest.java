package in.neupanepralad.esports.scoring.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ScoringConfigRequest(
        @NotNull @Size(max = 100) List<@Valid MetricScoringRuleRequest> metricRules,
        @NotNull @Size(max = 1000) List<@Valid PlacementScoringRuleRequest> placementRules
) {
}
