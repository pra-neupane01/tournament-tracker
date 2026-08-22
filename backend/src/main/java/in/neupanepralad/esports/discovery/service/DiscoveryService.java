package in.neupanepralad.esports.discovery.service;

import in.neupanepralad.esports.discovery.dto.DiscoveryHomeResponse;
import in.neupanepralad.esports.game.dto.GameResponse;
import in.neupanepralad.esports.game.service.GameService;
import in.neupanepralad.esports.tournament.dto.TournamentResponse;
import in.neupanepralad.esports.tournament.model.TournamentStatus;
import in.neupanepralad.esports.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final GameService gameService;
    private final TournamentRepository tournamentRepository;

    @Transactional(readOnly = true)
    public DiscoveryHomeResponse home() {
        List<GameResponse> games = gameService.list(0, 100, false).getContent();
        List<TournamentResponse> tournaments = tournamentRepository
                .findDiscoverable(List.of(
                        TournamentStatus.PUBLISHED,
                        TournamentStatus.REGISTRATION_OPEN,
                        TournamentStatus.IN_PROGRESS))
                .stream()
                .map(TournamentResponse::from)
                .toList();
        return new DiscoveryHomeResponse(games, tournaments);
    }
}