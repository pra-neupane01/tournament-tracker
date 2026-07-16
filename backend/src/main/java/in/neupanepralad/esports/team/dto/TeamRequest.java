package in.neupanepralad.esports.team.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record TeamRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 20) String shortName,
        @Size(max = 255) String logoUrl,
        @NotNull UUID gameId,
        UUID organizationId
) {
}
