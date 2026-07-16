package in.neupanepralad.esports.team.dto;

import in.neupanepralad.esports.team.model.RosterRole;
import in.neupanepralad.esports.team.model.TeamMember;

import java.util.UUID;

public record RosterMemberResponse(
        UUID id,
        UUID userId,
        String fullName,
        String email,
        String playerUid,
        String inGameName,
        RosterRole role,
        boolean active
) {
    public static RosterMemberResponse from(TeamMember member) {
        return new RosterMemberResponse(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getFullName(),
                member.getUser().getEmail(),
                member.getPlayerUid(),
                member.getInGameName(),
                member.getRole(),
                member.isActive()
        );
    }
}
