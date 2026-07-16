package in.neupanepralad.esports.scoring.repository;

import in.neupanepralad.esports.scoring.model.MetricScoringRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MetricScoringRuleRepository extends JpaRepository<MetricScoringRule, UUID> {
    List<MetricScoringRule> findAllByStageIdOrderBySortOrderAsc(UUID stageId);

    void deleteAllByStageId(UUID stageId);
}
