package in.neupanepralad.esports.competition.controller;

import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.competition.dto.FixtureRequest;
import in.neupanepralad.esports.competition.dto.FixtureResponse;
import in.neupanepralad.esports.competition.dto.GroupRequest;
import in.neupanepralad.esports.competition.dto.GroupResponse;
import in.neupanepralad.esports.competition.dto.StageGenerateRequest;
import in.neupanepralad.esports.competition.dto.StageRequest;
import in.neupanepralad.esports.competition.dto.StageResponse;
import in.neupanepralad.esports.competition.service.CompetitionService;
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
@RequestMapping
@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionService competitionService;

    @PostMapping("/tournaments/{tournamentId}/stages")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<StageResponse> createStage(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @Valid @RequestBody StageRequest request
    ) {
        return APIResponse.success(
                "Tournament stage created",
                competitionService.createStage(tournamentId, userId(authentication), request)
        );
    }

    @GetMapping("/tournaments/{tournamentId}/stages")
    public APIResponse<List<StageResponse>> listStages(@PathVariable UUID tournamentId) {
        return APIResponse.success(
                "Tournament stages retrieved",
                competitionService.listStages(tournamentId)
        );
    }

    @PutMapping("/tournaments/{tournamentId}/stages/{stageId}")
    public APIResponse<StageResponse> updateStage(
            @PathVariable UUID tournamentId,
            @PathVariable UUID stageId,
            Authentication authentication,
            @Valid @RequestBody StageRequest request
    ) {
        return APIResponse.success(
                "Tournament stage updated",
                competitionService.updateStage(
                        tournamentId,
                        stageId,
                        userId(authentication),
                        request
                )
        );
    }

    @DeleteMapping("/tournaments/{tournamentId}/stages/{stageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStage(
            @PathVariable UUID tournamentId,
            @PathVariable UUID stageId,
            Authentication authentication
    ) {
        competitionService.deleteStage(tournamentId, stageId, userId(authentication));
    }

    @PostMapping("/stages/{stageId}/generate")
    public APIResponse<StageResponse> generate(
            @PathVariable UUID stageId,
            Authentication authentication,
            @Valid @RequestBody StageGenerateRequest request
    ) {
        return APIResponse.success(
                "Stage fixtures generated",
                competitionService.generate(stageId, userId(authentication), request.groupCount())
        );
    }

    @PostMapping("/stages/{stageId}/groups")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<GroupResponse> createGroup(
            @PathVariable UUID stageId,
            Authentication authentication,
            @Valid @RequestBody GroupRequest request
    ) {
        return APIResponse.success(
                "Stage group created",
                competitionService.createGroup(stageId, userId(authentication), request)
        );
    }

    @GetMapping("/stages/{stageId}/groups")
    public APIResponse<List<GroupResponse>> listGroups(@PathVariable UUID stageId) {
        return APIResponse.success(
                "Stage groups retrieved",
                competitionService.listGroups(stageId)
        );
    }

    @PutMapping("/stages/{stageId}/groups/{groupId}")
    public APIResponse<GroupResponse> updateGroup(
            @PathVariable UUID stageId,
            @PathVariable UUID groupId,
            Authentication authentication,
            @Valid @RequestBody GroupRequest request
    ) {
        return APIResponse.success(
                "Stage group updated",
                competitionService.updateGroup(
                        stageId,
                        groupId,
                        userId(authentication),
                        request
                )
        );
    }

    @PostMapping("/stages/{stageId}/fixtures")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<FixtureResponse> createFixture(
            @PathVariable UUID stageId,
            Authentication authentication,
            @Valid @RequestBody FixtureRequest request
    ) {
        return APIResponse.success(
                "Fixture created",
                competitionService.createFixture(stageId, userId(authentication), request)
        );
    }

    @GetMapping("/stages/{stageId}/fixtures")
    public APIResponse<List<FixtureResponse>> listFixtures(@PathVariable UUID stageId) {
        return APIResponse.success(
                "Fixtures retrieved",
                competitionService.listFixtures(stageId)
        );
    }

    @PutMapping("/stages/{stageId}/fixtures/{fixtureId}")
    public APIResponse<FixtureResponse> updateFixture(
            @PathVariable UUID stageId,
            @PathVariable UUID fixtureId,
            Authentication authentication,
            @Valid @RequestBody FixtureRequest request
    ) {
        return APIResponse.success(
                "Fixture updated",
                competitionService.updateFixture(
                        stageId,
                        fixtureId,
                        userId(authentication),
                        request
                )
        );
    }

    @DeleteMapping("/stages/{stageId}/fixtures/{fixtureId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFixture(
            @PathVariable UUID stageId,
            @PathVariable UUID fixtureId,
            Authentication authentication
    ) {
        competitionService.deleteFixture(stageId, fixtureId, userId(authentication));
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
