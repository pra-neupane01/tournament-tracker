package in.neupanepralad.esports.result.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record ParticipantResultRequest(
        @NotNull UUID registrationId,
        @Min(1) int placement,
        @NotNull @Size(max = 100) Map<String, @NotNull BigDecimal> metrics
) {
}
