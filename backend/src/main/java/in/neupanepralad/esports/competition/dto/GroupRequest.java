package in.neupanepralad.esports.competition.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GroupRequest(
        @NotBlank @Size(max = 80) String name,
        @Min(1) int groupNumber
) {
}
