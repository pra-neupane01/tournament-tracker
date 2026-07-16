package in.neupanepralad.esports.scoring.controller;

import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.scoring.dto.ScoringConfigRequest;
import in.neupanepralad.esports.scoring.dto.ScoringConfigResponse;
import in.neupanepralad.esports.scoring.service.ScoringConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/stages/{stageId}/scoring")
@RequiredArgsConstructor
public class ScoringConfigController {

    private final ScoringConfigService scoringConfigService;

    @GetMapping
    public APIResponse<ScoringConfigResponse> get(@PathVariable UUID stageId) {
        return APIResponse.success(
                "Scoring configuration retrieved",
                scoringConfigService.get(stageId)
        );
    }

    @PutMapping
    public APIResponse<ScoringConfigResponse> save(
            @PathVariable UUID stageId,
            Authentication authentication,
            @Valid @RequestBody ScoringConfigRequest request
    ) {
        return APIResponse.success(
                "Scoring configuration saved",
                scoringConfigService.save(
                        stageId,
                        UUID.fromString(authentication.getName()),
                        request
                )
        );
    }
}
