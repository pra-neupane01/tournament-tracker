package in.neupanepralad.esports.result.dto;

import in.neupanepralad.esports.result.model.ParticipantResult;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ParticipantResultResponse(
        UUID registrationId,
        UUID teamId,
        String teamName,
        int placement,
        BigDecimal totalPoints,
        List<ResultMetricResponse> metrics
) {
    public static ParticipantResultResponse from(
            ParticipantResult result,
            List<ResultMetricResponse> metrics
    ) {
        return new ParticipantResultResponse(
                result.getRegistration().getId(),
                result.getRegistration().getTeam().getId(),
                result.getRegistration().getTeam().getName(),
                result.getPlacement(),
                result.getTotalPoints(),
                metrics
        );
    }
}
