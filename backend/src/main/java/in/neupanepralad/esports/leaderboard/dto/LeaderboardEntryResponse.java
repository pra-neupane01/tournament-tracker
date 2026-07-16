package in.neupanepralad.esports.leaderboard.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record LeaderboardEntryResponse(
        int rank,
        UUID registrationId,
        UUID teamId,
        String teamName,
        int matchesPlayed,
        int wins,
        int placementTotal,
        BigDecimal points,
        BigDecimal penaltyPoints,
        boolean disqualified,
        boolean qualified
) {
}
