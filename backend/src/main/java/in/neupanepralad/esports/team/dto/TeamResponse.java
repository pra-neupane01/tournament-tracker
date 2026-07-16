package in.neupanepralad.esports.team.dto;

import in.neupanepralad.esports.team.model.Team;

import java.util.UUID;

public record TeamResponse(
        UUID id,
        String name,
        String shortName,
        String logoUrl,
        UUID gameId,
        String gameName,
        UUID organizationId,
        String organizationName,
        UUID managerId,
        String managerName
) {
    public static TeamResponse from(Team team) {
        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getShortName(),
                team.getLogoUrl(),
                team.getGame().getId(),
                team.getGame().getName(),
                team.getOrganization() == null ? null : team.getOrganization().getId(),
                team.getOrganization() == null ? null : team.getOrganization().getName(),
                team.getManager().getId(),
                team.getManager().getFullName()
        );
    }
}
