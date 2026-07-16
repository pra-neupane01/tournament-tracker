package in.neupanepralad.esports.result.controller;

import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.result.dto.ResultReviewRequest;
import in.neupanepralad.esports.result.dto.ResultSubmissionRequest;
import in.neupanepralad.esports.result.dto.ResultSubmissionResponse;
import in.neupanepralad.esports.result.service.ResultService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @PostMapping("/fixtures/{fixtureId}/results")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<ResultSubmissionResponse> submit(
            @PathVariable UUID fixtureId,
            Authentication authentication,
            @Valid @RequestBody ResultSubmissionRequest request
    ) {
        return APIResponse.success(
                "Result submitted",
                resultService.submit(
                        fixtureId,
                        UUID.fromString(authentication.getName()),
                        request
                )
        );
    }

    @GetMapping("/fixtures/{fixtureId}/results")
    public APIResponse<List<ResultSubmissionResponse>> list(
            @PathVariable UUID fixtureId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Result submissions retrieved",
                resultService.list(
                        fixtureId,
                        UUID.fromString(authentication.getName())
                )
        );
    }

    @PatchMapping("/results/{submissionId}/review")
    public APIResponse<ResultSubmissionResponse> review(
            @PathVariable UUID submissionId,
            Authentication authentication,
            @Valid @RequestBody ResultReviewRequest request
    ) {
        return APIResponse.success(
                "Result submission reviewed",
                resultService.review(
                        submissionId,
                        UUID.fromString(authentication.getName()),
                        request
                )
        );
    }
}
