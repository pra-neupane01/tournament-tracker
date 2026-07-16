package in.neupanepralad.esports.tournament.dto;

import in.neupanepralad.esports.tournament.model.TournamentFormat;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public record TournamentRequest(
        @NotNull UUID organizationId,
        @NotNull UUID gameId,
        @NotBlank @Size(max = 180) String name,
        @NotBlank @Size(max = 180)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$") String slug,
        @Size(max = 5000) String description,
        @NotNull TournamentFormat format,
        @NotBlank @Size(max = 60) String timeZone,
        LocalDateTime registrationOpensAt,
        LocalDateTime registrationClosesAt,
        @NotNull LocalDateTime startsAt,
        LocalDateTime endsAt,
        @Min(2) @Max(10000) int minimumTeams,
        @Min(2) @Max(10000) int maximumTeams,
        @Min(1) @Max(100) int minimumRosterSize,
        @Min(1) @Max(100) int maximumRosterSize,
        boolean allowSubstitutes,
        boolean publicVisible
) {
}
