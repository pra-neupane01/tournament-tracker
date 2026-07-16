package in.neupanepralad.esports.governance.controller;

import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.governance.dto.DisputeCommentRequest;
import in.neupanepralad.esports.governance.dto.DisputeRequest;
import in.neupanepralad.esports.governance.dto.DisputeResponse;
import in.neupanepralad.esports.governance.dto.DisputeReviewRequest;
import in.neupanepralad.esports.governance.dto.PenaltyRequest;
import in.neupanepralad.esports.governance.dto.PenaltyResponse;
import in.neupanepralad.esports.governance.model.DisputeStatus;
import in.neupanepralad.esports.governance.service.GovernanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class GovernanceController {

    private final GovernanceService governanceService;

    @PostMapping("/tournaments/{tournamentId}/penalties")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<PenaltyResponse> issuePenalty(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @Valid @RequestBody PenaltyRequest request
    ) {
        return APIResponse.success(
                "Penalty issued",
                governanceService.issuePenalty(
                        tournamentId,
                        userId(authentication),
                        request
                )
        );
    }

    @GetMapping("/tournaments/{tournamentId}/penalties")
    public APIResponse<List<PenaltyResponse>> listPenalties(
            @PathVariable UUID tournamentId
    ) {
        return APIResponse.success(
                "Penalties retrieved",
                governanceService.listPenalties(tournamentId)
        );
    }

    @PostMapping("/penalties/{penaltyId}/revoke")
    public APIResponse<PenaltyResponse> revokePenalty(
            @PathVariable UUID penaltyId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Penalty revoked",
                governanceService.revokePenalty(penaltyId, userId(authentication))
        );
    }

    @PostMapping("/fixtures/{fixtureId}/disputes")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<DisputeResponse> openDispute(
            @PathVariable UUID fixtureId,
            Authentication authentication,
            @Valid @RequestBody DisputeRequest request
    ) {
        return APIResponse.success(
                "Dispute opened",
                governanceService.openDispute(
                        fixtureId,
                        userId(authentication),
                        request
                )
        );
    }

    @GetMapping("/tournaments/{tournamentId}/disputes")
    public APIResponse<PagedResponse<DisputeResponse>> listDisputes(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @RequestParam(required = false) DisputeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return APIResponse.success(
                "Disputes retrieved",
                governanceService.listDisputes(
                        tournamentId,
                        userId(authentication),
                        status,
                        page,
                        size
                )
        );
    }

    @GetMapping("/disputes/{disputeId}")
    public APIResponse<DisputeResponse> getDispute(
            @PathVariable UUID disputeId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Dispute retrieved",
                governanceService.getDispute(disputeId, userId(authentication))
        );
    }

    @PatchMapping("/disputes/{disputeId}")
    public APIResponse<DisputeResponse> reviewDispute(
            @PathVariable UUID disputeId,
            Authentication authentication,
            @Valid @RequestBody DisputeReviewRequest request
    ) {
        return APIResponse.success(
                "Dispute updated",
                governanceService.reviewDispute(
                        disputeId,
                        userId(authentication),
                        request
                )
        );
    }

    @PostMapping("/disputes/{disputeId}/comments")
    public APIResponse<DisputeResponse> comment(
            @PathVariable UUID disputeId,
            Authentication authentication,
            @Valid @RequestBody DisputeCommentRequest request
    ) {
        return APIResponse.success(
                "Dispute comment added",
                governanceService.comment(
                        disputeId,
                        userId(authentication),
                        request.message()
                )
        );
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
