package in.neupanepralad.esports.governance.dto;

import in.neupanepralad.esports.governance.model.DisputeComment;

import java.time.LocalDateTime;
import java.util.UUID;

public record DisputeCommentResponse(
        UUID id,
        String author,
        String message,
        LocalDateTime createdAt
) {
    public static DisputeCommentResponse from(DisputeComment comment) {
        return new DisputeCommentResponse(
                comment.getId(),
                comment.getAuthor().getFullName(),
                comment.getMessage(),
                comment.getCreatedAt()
        );
    }
}
