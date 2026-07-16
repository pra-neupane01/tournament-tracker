package in.neupanepralad.esports.governance.dto;

import in.neupanepralad.esports.governance.model.PenaltyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record PenaltyRequest(
        @NotNull UUID registrationId,
        UUID fixtureId,
        @NotNull PenaltyType type,
        @NotNull @PositiveOrZero BigDecimal pointsDeducted,
        @NotBlank @Size(max = 2000) String reason
) {
}
