package in.neupanepralad.esports.scoring.repository;

import in.neupanepralad.esports.scoring.model.PlacementScoringRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlacementScoringRuleRepository
        extends JpaRepository<PlacementScoringRule, UUID> {

    List<PlacementScoringRule> findAllByStageIdOrderByPlacementAsc(UUID stageId);

    Optional<PlacementScoringRule> findByStageIdAndPlacement(UUID stageId, int placement);

    void deleteAllByStageId(UUID stageId);
}
