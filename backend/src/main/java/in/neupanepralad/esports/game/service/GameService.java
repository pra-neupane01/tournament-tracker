package in.neupanepralad.esports.game.service;

import in.neupanepralad.esports.common.exception.ConflictException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.game.dto.GameRequest;
import in.neupanepralad.esports.game.dto.GameResponse;
import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.game.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;

    @Transactional
    public GameResponse create(GameRequest request) {
        if (gameRepository.existsBySlugIgnoreCase(request.slug())) {
            throw new ConflictException("A game with this slug already exists");
        }
        Game game = new Game();
        apply(game, request);
        return GameResponse.from(gameRepository.save(game));
    }

    @Transactional(readOnly = true)
    public PagedResponse<GameResponse> list(int page, int size, boolean includeInactive) {
        PageRequest pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.ASC, "name")
        );
        return PagedResponse.of(
                (includeInactive
                        ? gameRepository.findAll(pageable)
                        : gameRepository.findByActiveTrue(pageable))
                        .map(GameResponse::from)
        );
    }

    @Transactional(readOnly = true)
    public GameResponse get(UUID gameId) {
        return GameResponse.from(requireGame(gameId));
    }

    @Transactional
    public GameResponse update(UUID gameId, GameRequest request) {
        Game game = requireGame(gameId);
        gameRepository.findBySlugIgnoreCase(request.slug())
                .filter(existing -> !existing.getId().equals(gameId))
                .ifPresent(existing -> {
                    throw new ConflictException("A game with this slug already exists");
                });
        apply(game, request);
        return GameResponse.from(game);
    }

    @Transactional
    public void delete(UUID gameId) {
        gameRepository.delete(requireGame(gameId));
    }

    public Game requireGame(UUID gameId) {
        return gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));
    }

    private void apply(Game game, GameRequest request) {
        game.setName(request.name().trim());
        game.setSlug(request.slug().trim().toLowerCase(java.util.Locale.ROOT));
        game.setPlatform(request.platform());
        game.setTeamSize(request.teamSize());
        game.setSubstituteLimit(request.substituteLimit());
        game.setDescription(request.description());
        game.setActive(request.active());
    }
}
