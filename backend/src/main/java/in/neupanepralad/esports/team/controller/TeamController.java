package in.neupanepralad.esports.team.controller;

import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.team.dto.RosterMemberRequest;
import in.neupanepralad.esports.team.dto.RosterMemberResponse;
import in.neupanepralad.esports.team.dto.TeamRequest;
import in.neupanepralad.esports.team.dto.TeamResponse;
import in.neupanepralad.esports.team.service.TeamService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<TeamResponse> create(
            Authentication authentication,
            @Valid @RequestBody TeamRequest request
    ) {
        return APIResponse.success(
                "Team created",
                teamService.create(userId(authentication), request)
        );
    }

    @GetMapping
    public APIResponse<PagedResponse<TeamResponse>> list(
            @RequestParam(required = false) UUID gameId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return APIResponse.success("Teams retrieved", teamService.list(gameId, page, size));
    }

    @GetMapping("/{teamId}")
    public APIResponse<TeamResponse> get(@PathVariable UUID teamId) {
        return APIResponse.success("Team retrieved", teamService.get(teamId));
    }

    @PutMapping("/{teamId}")
    public APIResponse<TeamResponse> update(
            @PathVariable UUID teamId,
            Authentication authentication,
            @Valid @RequestBody TeamRequest request
    ) {
        return APIResponse.success(
                "Team updated",
                teamService.update(teamId, userId(authentication), request)
        );
    }

    @DeleteMapping("/{teamId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID teamId, Authentication authentication) {
        teamService.delete(teamId, userId(authentication));
    }

    @GetMapping("/{teamId}/roster")
    public APIResponse<List<RosterMemberResponse>> roster(@PathVariable UUID teamId) {
        return APIResponse.success("Roster retrieved", teamService.roster(teamId));
    }

    @PostMapping("/{teamId}/roster")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<RosterMemberResponse> addRosterMember(
            @PathVariable UUID teamId,
            Authentication authentication,
            @Valid @RequestBody RosterMemberRequest request
    ) {
        return APIResponse.success(
                "Roster member added",
                teamService.addRosterMember(teamId, userId(authentication), request)
        );
    }

    @PutMapping("/{teamId}/roster/{memberId}")
    public APIResponse<RosterMemberResponse> updateRosterMember(
            @PathVariable UUID teamId,
            @PathVariable UUID memberId,
            Authentication authentication,
            @Valid @RequestBody RosterMemberRequest request
    ) {
        return APIResponse.success(
                "Roster member updated",
                teamService.updateRosterMember(
                        teamId,
                        memberId,
                        userId(authentication),
                        request
                )
        );
    }

    @DeleteMapping("/{teamId}/roster/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeRosterMember(
            @PathVariable UUID teamId,
            @PathVariable UUID memberId,
            Authentication authentication
    ) {
        teamService.removeRosterMember(teamId, memberId, userId(authentication));
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
