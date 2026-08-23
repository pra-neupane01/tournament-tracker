package in.neupanepralad.esports.auth.dto;

import in.neupanepralad.esports.user.model.User;

import java.time.LocalDateTime;

public record ProfileSummaryResponse(
        UserResponse user,
        int matches,
        double winRate,
        int tournamentsWon,
        int totalPrize,
        int joinedYear
) {
    public static ProfileSummaryResponse from(User user) {
        LocalDateTime createdAt = user.getCreatedAt();
        return new ProfileSummaryResponse(
                UserResponse.from(user),
                1402,
                68.4,
                24,
                45200,
                createdAt == null ? 2021 : createdAt.getYear()
        );
    }
}
