package in.neupanepralad.esports.game.controller;

import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.game.dto.GameRequest;
import in.neupanepralad.esports.game.dto.GameResponse;
import in.neupanepralad.esports.game.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<GameResponse> create(@Valid @RequestBody GameRequest request) {
        return APIResponse.success("Game created", gameService.create(request));
    }

    @GetMapping
    public APIResponse<PagedResponse<GameResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean includeInactive
    ) {
        return APIResponse.success(
                "Games retrieved",
                gameService.list(page, size, includeInactive)
        );
    }

    @GetMapping("/{gameId}")
    public APIResponse<GameResponse> get(@PathVariable UUID gameId) {
        return APIResponse.success("Game retrieved", gameService.get(gameId));
    }

    @PutMapping("/{gameId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public APIResponse<GameResponse> update(
            @PathVariable UUID gameId,
            @Valid @RequestBody GameRequest request
    ) {
        return APIResponse.success("Game updated", gameService.update(gameId, request));
    }

    @DeleteMapping("/{gameId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID gameId) {
        gameService.delete(gameId);
    }
}
