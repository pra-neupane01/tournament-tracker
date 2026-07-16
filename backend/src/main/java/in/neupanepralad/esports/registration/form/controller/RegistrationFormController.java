package in.neupanepralad.esports.registration.form.controller;

import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.registration.form.dto.FormFieldRequest;
import in.neupanepralad.esports.registration.form.dto.FormFieldResponse;
import in.neupanepralad.esports.registration.form.service.RegistrationFormService;
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
@RequestMapping("/tournaments/{tournamentId}/registration-form")
@RequiredArgsConstructor
public class RegistrationFormController {

    private final RegistrationFormService formService;

    @GetMapping
    public APIResponse<List<FormFieldResponse>> list(@PathVariable UUID tournamentId) {
        return APIResponse.success(
                "Registration form retrieved",
                formService.list(tournamentId)
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<FormFieldResponse> create(
            @PathVariable UUID tournamentId,
            Authentication authentication,
            @Valid @RequestBody FormFieldRequest request
    ) {
        return APIResponse.success(
                "Registration field created",
                formService.create(tournamentId, userId(authentication), request)
        );
    }

    @PutMapping("/{fieldId}")
    public APIResponse<FormFieldResponse> update(
            @PathVariable UUID tournamentId,
            @PathVariable UUID fieldId,
            Authentication authentication,
            @Valid @RequestBody FormFieldRequest request
    ) {
        return APIResponse.success(
                "Registration field updated",
                formService.update(
                        tournamentId,
                        fieldId,
                        userId(authentication),
                        request
                )
        );
    }

    @DeleteMapping("/{fieldId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID tournamentId,
            @PathVariable UUID fieldId,
            Authentication authentication
    ) {
        formService.delete(tournamentId, fieldId, userId(authentication));
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
