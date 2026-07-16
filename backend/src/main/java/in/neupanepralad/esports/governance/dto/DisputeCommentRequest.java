package in.neupanepralad.esports.governance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DisputeCommentRequest(@NotBlank @Size(max = 3000) String message) {
}
