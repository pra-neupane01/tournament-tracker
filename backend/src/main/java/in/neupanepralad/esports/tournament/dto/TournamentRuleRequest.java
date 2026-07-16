package in.neupanepralad.esports.tournament.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TournamentRuleRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 10000) String content,
        @Min(0) int sortOrder
) {
}
