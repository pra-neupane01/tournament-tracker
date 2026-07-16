package in.neupanepralad.esports.competition.repository;

import in.neupanepralad.esports.competition.model.StageGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StageGroupRepository extends JpaRepository<StageGroup, UUID> {
    List<StageGroup> findAllByStageIdOrderByGroupNumberAsc(UUID stageId);

    void deleteAllByStageId(UUID stageId);
}
