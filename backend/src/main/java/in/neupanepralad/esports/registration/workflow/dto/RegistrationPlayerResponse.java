package in.neupanepralad.esports.registration.workflow.dto;

import in.neupanepralad.esports.registration.workflow.model.RegistrationPlayer;
import in.neupanepralad.esports.team.model.RosterRole;

import java.util.UUID;

public record RegistrationPlayerResponse(
        UUID userId,
        String fullName,
        String playerUid,
        String inGameName,
        RosterRole rosterRole
) {
    public static RegistrationPlayerResponse from(RegistrationPlayer player) {
        return new RegistrationPlayerResponse(
                player.getUserId(),
                player.getFullName(),
                player.getPlayerUid(),
                player.getInGameName(),
                player.getRosterRole()
        );
    }
}
