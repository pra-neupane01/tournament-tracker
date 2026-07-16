package in.neupanepralad.esports.leaderboard.repository;

import in.neupanepralad.esports.leaderboard.model.StageQualification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StageQualificationRepository
        extends JpaRepository<StageQualification, UUID> {

    List<StageQualification> findAllByFromStageIdOrderBySourceRankAsc(UUID fromStageId);

    List<StageQualification> findAllByToStageIdOrderBySourceRankAsc(UUID toStageId);

    void deleteAllByFromStageId(UUID fromStageId);
}
