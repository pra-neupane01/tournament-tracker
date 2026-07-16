package in.neupanepralad.esports.result.dto;

import in.neupanepralad.esports.result.model.ResultSubmissionStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResultReviewRequest(
        @NotNull ResultSubmissionStatus status,
        @Size(max = 2000) String reviewNotes
) {
}
