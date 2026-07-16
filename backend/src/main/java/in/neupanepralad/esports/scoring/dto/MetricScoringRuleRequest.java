package in.neupanepralad.esports.scoring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record MetricScoringRuleRequest(
        @NotBlank @Size(max = 80)
        @Pattern(regexp = "^[a-z][a-z0-9_]*$") String metricKey,
        @NotBlank @Size(max = 120) String label,
        @NotNull BigDecimal pointsPerUnit,
        int sortOrder
) {
}
