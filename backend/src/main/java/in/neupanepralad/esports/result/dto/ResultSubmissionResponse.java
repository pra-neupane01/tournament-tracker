package in.neupanepralad.esports.result.dto;

import in.neupanepralad.esports.result.model.ResultSubmission;
import in.neupanepralad.esports.result.model.ResultSubmissionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ResultSubmissionResponse(
        UUID id,
        UUID fixtureId,
        ResultSubmissionStatus status,
        String submittedBy,
        LocalDateTime submittedAt,
        String notes,
        String evidenceUrl,
        String reviewedBy,
        LocalDateTime reviewedAt,
        String reviewNotes,
        List<ParticipantResultResponse> results
) {
    public static ResultSubmissionResponse from(
            ResultSubmission submission,
            List<ParticipantResultResponse> results
    ) {
        return new ResultSubmissionResponse(
                submission.getId(),
                submission.getFixture().getId(),
                submission.getStatus(),
                submission.getSubmittedBy().getFullName(),
                submission.getSubmittedAt(),
                submission.getNotes(),
                submission.getEvidenceUrl(),
                submission.getReviewedBy() == null
                        ? null
                        : submission.getReviewedBy().getFullName(),
                submission.getReviewedAt(),
                submission.getReviewNotes(),
                results
        );
    }
}
