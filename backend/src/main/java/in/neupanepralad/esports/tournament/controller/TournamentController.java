package in.neupanepralad.esports.tournament.controller;

import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.tournament.dto.TournamentRequest;
import in.neupanepralad.esports.tournament.dto.TournamentResponse;
import in.neupanepralad.esports.tournament.dto.TournamentStatusRequest;
import in.neupanepralad.esports.tournament.model.TournamentStatus;
import in.neupanepralad.esports.tournament.service.TournamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
@RequestMapping("/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<TournamentResponse> create(
            Authentication authentication,
            @Valid @RequestBody TournamentRequest request
    ) {
        return APIResponse.success(
                "Tournament created",
                tournamentService.create(userId(authentication), request)
        );
    }

    @GetMapping
    public APIResponse<PagedResponse<TournamentResponse>> list(
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) UUID gameId,
            @RequestParam(required = false) TournamentStatus status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return APIResponse.success(
                "Tournaments retrieved",
                tournamentService.list(
                        organizationId,
                        gameId,
                        status,
                        query,
                        page,
                        size
                )
        );
    }

    @GetMapping("/{tournamentId}")
    public APIResponse<TournamentResponse> get(@PathVariable UUID tournamentId) {
        return APIResponse.success(
                "Tournament retrieved",
                tournamentService.get(tournamentId)
        );
    }

    @PutMapping("/{tournamentId}")
    public APIResponse<TournamentResponse> update(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @Valid @RequestBody TournamentRequest request
    ) {
        return APIResponse.success(
                "Tournament updated",
                tournamentService.update(tournamentId, userId(authentication), request)
        );
    }

    @PatchMapping("/{tournamentId}/status")
    public APIResponse<TournamentResponse> updateStatus(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @Valid @RequestBody TournamentStatusRequest request
    ) {
        return APIResponse.success(
                "Tournament status updated",
                tournamentService.updateStatus(
                        tournamentId,
                        userId(authentication),
                        request.status()
                )
        );
    }

    @DeleteMapping("/{tournamentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID tournamentId,
            Authentication authentication
    ) {
        tournamentService.delete(tournamentId, userId(authentication));
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
