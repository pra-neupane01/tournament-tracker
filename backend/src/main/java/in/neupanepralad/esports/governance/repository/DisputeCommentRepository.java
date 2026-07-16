package in.neupanepralad.esports.governance.repository;

import in.neupanepralad.esports.governance.model.DisputeComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DisputeCommentRepository extends JpaRepository<DisputeComment, UUID> {
    List<DisputeComment> findAllByDisputeIdOrderByCreatedAtAsc(UUID disputeId);
}
