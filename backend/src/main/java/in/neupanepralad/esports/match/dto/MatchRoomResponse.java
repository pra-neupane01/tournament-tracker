package in.neupanepralad.esports.match.dto;

import java.util.UUID;

public record MatchRoomResponse(
        UUID fixtureId,
        String roomCode,
        String password,
        String serverName,
        String instructions
) {
}
