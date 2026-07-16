package in.neupanepralad.esports.result.repository;

import in.neupanepralad.esports.result.model.ParticipantResult;
import in.neupanepralad.esports.result.model.ResultSubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParticipantResultRepository extends JpaRepository<ParticipantResult, UUID> {
    List<ParticipantResult> findAllBySubmissionIdOrderByPlacementAsc(UUID submissionId);

    List<ParticipantResult> findAllBySubmissionFixtureStageIdAndSubmissionStatus(
            UUID stageId,
            ResultSubmissionStatus status
    );
}
