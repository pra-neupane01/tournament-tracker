package in.neupanepralad.esports.team.dto;

import in.neupanepralad.esports.team.model.RosterRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RosterMemberRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(max = 100) String playerUid,
        @NotBlank @Size(max = 100) String inGameName,
        @NotNull RosterRole role,
        boolean active
) {
}
