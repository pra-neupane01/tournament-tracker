package in.neupanepralad.esports.leaderboard.controller;

import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.leaderboard.dto.LeaderboardEntryResponse;
import in.neupanepralad.esports.leaderboard.dto.ManualQualificationRequest;
import in.neupanepralad.esports.leaderboard.dto.QualificationRequest;
import in.neupanepralad.esports.leaderboard.dto.QualificationResponse;
import in.neupanepralad.esports.leaderboard.service.LeaderboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/stages/{stageId}")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/leaderboard")
    public APIResponse<List<LeaderboardEntryResponse>> leaderboard(
            @PathVariable UUID stageId,
            @RequestParam(required = false) UUID groupId
    ) {
        return APIResponse.success(
                "Leaderboard retrieved",
                leaderboardService.leaderboard(stageId, groupId)
        );
    }

    @PostMapping("/qualifications")
    public APIResponse<List<QualificationResponse>> qualify(
            @PathVariable UUID stageId,
            Authentication authentication,
            @Valid @RequestBody QualificationRequest request
    ) {
        return APIResponse.success(
                "Teams qualified",
                leaderboardService.qualify(
                        stageId,
                        UUID.fromString(authentication.getName()),
                        request
                )
        );
    }

    @PostMapping("/qualifications/manual")
    public APIResponse<List<QualificationResponse>> qualifyManually(
            @PathVariable UUID stageId,
            Authentication authentication,
            @Valid @RequestBody ManualQualificationRequest request
    ) {
        return APIResponse.success(
                "Manual qualifications saved",
                leaderboardService.qualifyManually(
                        stageId,
                        UUID.fromString(authentication.getName()),
                        request
                )
        );
    }

    @GetMapping("/qualifications")
    public APIResponse<List<QualificationResponse>> listQualifications(
            @PathVariable UUID stageId
    ) {
        return APIResponse.success(
                "Qualifications retrieved",
                leaderboardService.listQualifications(stageId)
        );
    }
}
