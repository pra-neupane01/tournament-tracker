package in.neupanepralad.esports.registration.workflow.dto;

import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegistrationReviewRequest(
        @NotNull RegistrationStatus status,
        @Size(max = 2000) String reviewNotes
) {
}
