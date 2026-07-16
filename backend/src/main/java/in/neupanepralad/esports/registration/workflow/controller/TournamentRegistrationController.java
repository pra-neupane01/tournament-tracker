package in.neupanepralad.esports.registration.workflow.controller;

import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.registration.workflow.dto.RegistrationResponse;
import in.neupanepralad.esports.registration.workflow.dto.RegistrationReviewRequest;
import in.neupanepralad.esports.registration.workflow.dto.RegistrationSubmitRequest;
import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import in.neupanepralad.esports.registration.workflow.service.TournamentRegistrationService;
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

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class TournamentRegistrationController {

    private final TournamentRegistrationService registrationService;

    @PostMapping("/tournaments/{tournamentId}/registrations")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<RegistrationResponse> submit(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @Valid @RequestBody RegistrationSubmitRequest request
    ) {
        return APIResponse.success(
                "Tournament registration submitted",
                registrationService.submit(tournamentId, userId(authentication), request)
        );
    }

    @GetMapping("/tournaments/{tournamentId}/registrations")
    public APIResponse<PagedResponse<RegistrationResponse>> list(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return APIResponse.success(
                "Tournament registrations retrieved",
                registrationService.list(
                        tournamentId,
                        userId(authentication),
                        status,
                        page,
                        size
                )
        );
    }

    @GetMapping("/registrations/{registrationId}")
    public APIResponse<RegistrationResponse> get(
            @PathVariable UUID registrationId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Tournament registration retrieved",
                registrationService.get(registrationId, userId(authentication))
        );
    }

    @PatchMapping("/registrations/{registrationId}/review")
    public APIResponse<RegistrationResponse> review(
            @PathVariable UUID registrationId,
            Authentication authentication,
            @Valid @RequestBody RegistrationReviewRequest request
    ) {
        return APIResponse.success(
                "Tournament registration reviewed",
                registrationService.review(
                        registrationId,
                        userId(authentication),
                        request
                )
        );
    }

    @PostMapping("/registrations/{registrationId}/withdraw")
    public APIResponse<RegistrationResponse> withdraw(
            @PathVariable UUID registrationId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Tournament registration withdrawn",
                registrationService.withdraw(registrationId, userId(authentication))
        );
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
