package in.neupanepralad.esports.scoring.dto;

import java.util.List;

public record ScoringConfigResponse(
        List<MetricScoringRuleRequest> metricRules,
        List<PlacementScoringRuleRequest> placementRules
) {
}
