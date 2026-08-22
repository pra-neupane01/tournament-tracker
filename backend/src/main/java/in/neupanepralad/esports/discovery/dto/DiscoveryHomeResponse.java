package in.neupanepralad.esports.discovery.dto;

import in.neupanepralad.esports.game.dto.GameResponse;
import in.neupanepralad.esports.tournament.dto.TournamentResponse;

import java.util.List;

public record DiscoveryHomeResponse(
        List<GameResponse> games,
        List<TournamentResponse> tournaments) {
}