package in.neupanepralad.esports.tournament.dto;

import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.model.TournamentFormat;
import in.neupanepralad.esports.tournament.model.TournamentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record TournamentResponse(
        UUID id,
        UUID organizationId,
        String organizationName,
        UUID gameId,
        String gameName,
        String name,
        String slug,
        String description,
        TournamentFormat format,
        TournamentStatus status,
        String timeZone,
        LocalDateTime registrationOpensAt,
        LocalDateTime registrationClosesAt,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        int minimumTeams,
        int maximumTeams,
        int minimumRosterSize,
        int maximumRosterSize,
        boolean allowSubstitutes,
        boolean publicVisible
) {
    public static TournamentResponse from(Tournament tournament) {
        return new TournamentResponse(
                tournament.getId(),
                tournament.getOrganization().getId(),
                tournament.getOrganization().getName(),
                tournament.getGame().getId(),
                tournament.getGame().getName(),
                tournament.getName(),
                tournament.getSlug(),
                tournament.getDescription(),
                tournament.getFormat(),
                tournament.getStatus(),
                tournament.getTimeZone(),
                tournament.getRegistrationOpensAt(),
                tournament.getRegistrationClosesAt(),
                tournament.getStartsAt(),
                tournament.getEndsAt(),
                tournament.getMinimumTeams(),
                tournament.getMaximumTeams(),
                tournament.getMinimumRosterSize(),
                tournament.getMaximumRosterSize(),
                tournament.isAllowSubstitutes(),
                tournament.isPublicVisible()
        );
    }
}
