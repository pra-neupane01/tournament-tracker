package in.neupanepralad.esports.match.controller;

import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.competition.dto.FixtureResponse;
import in.neupanepralad.esports.match.dto.CheckInRequest;
import in.neupanepralad.esports.match.dto.CheckInResponse;
import in.neupanepralad.esports.match.dto.CheckInStatusRequest;
import in.neupanepralad.esports.match.dto.FixtureScheduleRequest;
import in.neupanepralad.esports.match.dto.MatchRoomRequest;
import in.neupanepralad.esports.match.dto.MatchRoomResponse;
import in.neupanepralad.esports.match.service.MatchOperationsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/fixtures/{fixtureId}")
@RequiredArgsConstructor
public class MatchOperationsController {

    private final MatchOperationsService matchOperationsService;

    @PutMapping("/schedule")
    public APIResponse<FixtureResponse> schedule(
            @PathVariable UUID fixtureId,
            Authentication authentication,
            @Valid @RequestBody FixtureScheduleRequest request
    ) {
        return APIResponse.success(
                "Fixture scheduled",
                matchOperationsService.schedule(
                        fixtureId,
                        userId(authentication),
                        request
                )
        );
    }

    @PutMapping("/room")
    public APIResponse<MatchRoomResponse> saveRoom(
            @PathVariable UUID fixtureId,
            Authentication authentication,
            @Valid @RequestBody MatchRoomRequest request
    ) {
        return APIResponse.success(
                "Match room saved",
                matchOperationsService.saveRoom(fixtureId, userId(authentication), request)
        );
    }

    @GetMapping("/room")
    public APIResponse<MatchRoomResponse> getRoom(
            @PathVariable UUID fixtureId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Match room retrieved",
                matchOperationsService.getRoom(fixtureId, userId(authentication))
        );
    }

    @PostMapping("/check-ins")
    public APIResponse<CheckInResponse> checkIn(
            @PathVariable UUID fixtureId,
            Authentication authentication,
            @Valid @RequestBody CheckInRequest request
    ) {
        return APIResponse.success(
                "Team checked in",
                matchOperationsService.checkIn(
                        fixtureId,
                        request.registrationId(),
                        userId(authentication)
                )
        );
    }

    @PutMapping("/check-ins/status")
    public APIResponse<CheckInResponse> setCheckInStatus(
            @PathVariable UUID fixtureId,
            Authentication authentication,
            @Valid @RequestBody CheckInStatusRequest request
    ) {
        return APIResponse.success(
                "Check-in status updated",
                matchOperationsService.setCheckInStatus(
                        fixtureId,
                        request.registrationId(),
                        request.status(),
                        userId(authentication)
                )
        );
    }

    @GetMapping("/check-ins")
    public APIResponse<List<CheckInResponse>> listCheckIns(
            @PathVariable UUID fixtureId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Fixture check-ins retrieved",
                matchOperationsService.listCheckIns(fixtureId, userId(authentication))
        );
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
