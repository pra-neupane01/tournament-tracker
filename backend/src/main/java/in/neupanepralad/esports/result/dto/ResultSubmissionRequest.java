package in.neupanepralad.esports.result.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ResultSubmissionRequest(
        @Size(max = 2000) String notes,
        @Size(max = 500) String evidenceUrl,
        @NotEmpty @Size(max = 100) List<@Valid ParticipantResultRequest> results
) {
}
