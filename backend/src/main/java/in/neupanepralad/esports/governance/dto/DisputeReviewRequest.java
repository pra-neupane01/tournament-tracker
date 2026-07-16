package in.neupanepralad.esports.governance.dto;

import in.neupanepralad.esports.governance.model.DisputeStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DisputeReviewRequest(
        @NotNull DisputeStatus status,
        @Size(max = 5000) String resolution
) {
}
