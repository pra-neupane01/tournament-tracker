package in.neupanepralad.esports.result.repository;

import in.neupanepralad.esports.result.model.ResultSubmission;
import in.neupanepralad.esports.result.model.ResultSubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ResultSubmissionRepository extends JpaRepository<ResultSubmission, UUID> {
    List<ResultSubmission> findAllByFixtureIdOrderBySubmittedAtDesc(UUID fixtureId);

    List<ResultSubmission> findAllByFixtureIdAndStatus(
            UUID fixtureId,
            ResultSubmissionStatus status
    );
}
