package in.neupanepralad.esports.tournament.dto;

import in.neupanepralad.esports.tournament.model.TournamentRule;

import java.util.UUID;

public record TournamentRuleResponse(
        UUID id,
        String title,
        String content,
        int sortOrder
) {
    public static TournamentRuleResponse from(TournamentRule rule) {
        return new TournamentRuleResponse(
                rule.getId(),
                rule.getTitle(),
                rule.getContent(),
                rule.getSortOrder()
        );
    }
}
