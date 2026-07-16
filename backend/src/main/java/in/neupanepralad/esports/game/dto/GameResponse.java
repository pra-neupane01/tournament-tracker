package in.neupanepralad.esports.game.dto;

import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.game.model.GamePlatform;

import java.util.UUID;

public record GameResponse(
        UUID id,
        String name,
        String slug,
        GamePlatform platform,
        int teamSize,
        int substituteLimit,
        String description,
        boolean active
) {
    public static GameResponse from(Game game) {
        return new GameResponse(
                game.getId(),
                game.getName(),
                game.getSlug(),
                game.getPlatform(),
                game.getTeamSize(),
                game.getSubstituteLimit(),
                game.getDescription(),
                game.isActive()
        );
    }
}
