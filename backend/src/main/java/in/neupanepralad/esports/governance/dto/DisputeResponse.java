package in.neupanepralad.esports.governance.dto;

import in.neupanepralad.esports.governance.model.Dispute;
import in.neupanepralad.esports.governance.model.DisputeStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record DisputeResponse(
        UUID id,
        UUID fixtureId,
        UUID registrationId,
        String teamName,
        UUID resultSubmissionId,
        String category,
        String description,
        DisputeStatus status,
        String openedBy,
        String assignedTo,
        String resolution,
        LocalDateTime resolvedAt,
        List<DisputeCommentResponse> comments
) {
    public static DisputeResponse from(
            Dispute dispute,
            List<DisputeCommentResponse> comments
    ) {
        return new DisputeResponse(
                dispute.getId(),
                dispute.getFixture().getId(),
                dispute.getRegistration().getId(),
                dispute.getRegistration().getTeam().getName(),
                dispute.getResultSubmission() == null
                        ? null
                        : dispute.getResultSubmission().getId(),
                dispute.getCategory(),
                dispute.getDescription(),
                dispute.getStatus(),
                dispute.getOpenedBy().getFullName(),
                dispute.getAssignedTo() == null
                        ? null
                        : dispute.getAssignedTo().getFullName(),
                dispute.getResolution(),
                dispute.getResolvedAt(),
                comments
        );
    }
}
