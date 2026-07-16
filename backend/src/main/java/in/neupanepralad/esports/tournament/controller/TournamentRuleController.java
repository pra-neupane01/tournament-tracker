package in.neupanepralad.esports.tournament.controller;

import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.tournament.dto.TournamentRuleRequest;
import in.neupanepralad.esports.tournament.dto.TournamentRuleResponse;
import in.neupanepralad.esports.tournament.service.TournamentRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tournaments/{tournamentId}/rules")
@RequiredArgsConstructor
public class TournamentRuleController {

    private final TournamentRuleService ruleService;

    @GetMapping
    public APIResponse<List<TournamentRuleResponse>> list(@PathVariable UUID tournamentId) {
        return APIResponse.success("Tournament rules retrieved", ruleService.list(tournamentId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<TournamentRuleResponse> create(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @Valid @RequestBody TournamentRuleRequest request
    ) {
        return APIResponse.success(
                "Tournament rule created",
                ruleService.create(tournamentId, userId(authentication), request)
        );
    }

    @PutMapping("/{ruleId}")
    public APIResponse<TournamentRuleResponse> update(
            @PathVariable UUID tournamentId,
            @PathVariable UUID ruleId,
            Authentication authentication,
            @Valid @RequestBody TournamentRuleRequest request
    ) {
        return APIResponse.success(
                "Tournament rule updated",
                ruleService.update(tournamentId, ruleId, userId(authentication), request)
        );
    }

    @DeleteMapping("/{ruleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID tournamentId,
            @PathVariable UUID ruleId,
            Authentication authentication
    ) {
        ruleService.delete(tournamentId, ruleId, userId(authentication));
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
