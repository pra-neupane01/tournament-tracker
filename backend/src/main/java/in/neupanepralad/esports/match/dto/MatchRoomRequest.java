package in.neupanepralad.esports.match.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MatchRoomRequest(
        @NotBlank @Size(max = 120) String roomCode,
        @Size(max = 255) String password,
        @Size(max = 120) String serverName,
        @Size(max = 2000) String instructions
) {
}
