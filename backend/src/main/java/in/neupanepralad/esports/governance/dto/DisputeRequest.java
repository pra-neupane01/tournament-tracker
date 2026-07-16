package in.neupanepralad.esports.governance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record DisputeRequest(
        @NotNull UUID registrationId,
        UUID resultSubmissionId,
        @NotBlank @Size(max = 120) String category,
        @NotBlank @Size(max = 5000) String description
) {
}
