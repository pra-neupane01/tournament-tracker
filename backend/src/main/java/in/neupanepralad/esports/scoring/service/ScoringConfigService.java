package in.neupanepralad.esports.scoring.service;

import in.neupanepralad.esports.common.exception.ConflictException;
import in.neupanepralad.esports.competition.model.TournamentStage;
import in.neupanepralad.esports.competition.repository.TournamentStageRepository;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.scoring.dto.MetricScoringRuleRequest;
import in.neupanepralad.esports.scoring.dto.PlacementScoringRuleRequest;
import in.neupanepralad.esports.scoring.dto.ScoringConfigRequest;
import in.neupanepralad.esports.scoring.dto.ScoringConfigResponse;
import in.neupanepralad.esports.scoring.model.MetricScoringRule;
import in.neupanepralad.esports.scoring.model.PlacementScoringRule;
import in.neupanepralad.esports.scoring.repository.MetricScoringRuleRepository;
import in.neupanepralad.esports.scoring.repository.PlacementScoringRuleRepository;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScoringConfigService {

    private final TournamentStageRepository stageRepository;
    private final MetricScoringRuleRepository metricRuleRepository;
    private final PlacementScoringRuleRepository placementRuleRepository;
    private final TournamentAccessService tournamentAccessService;

    @Transactional
    public ScoringConfigResponse save(
            UUID stageId,
            UUID actorId,
            ScoringConfigRequest request
    ) {
        TournamentStage stage = requireStage(stageId);
        tournamentAccessService.requireManager(stage.getTournament().getId(), actorId);
        validateUniqueRules(request);
        metricRuleRepository.deleteAllByStageId(stageId);
        placementRuleRepository.deleteAllByStageId(stageId);
        request.metricRules().forEach(ruleRequest -> {
            MetricScoringRule rule = new MetricScoringRule();
            rule.setStage(stage);
            rule.setMetricKey(ruleRequest.metricKey().toLowerCase(Locale.ROOT));
            rule.setLabel(ruleRequest.label().trim());
            rule.setPointsPerUnit(ruleRequest.pointsPerUnit());
            rule.setSortOrder(ruleRequest.sortOrder());
            metricRuleRepository.save(rule);
        });
        request.placementRules().forEach(ruleRequest -> {
            PlacementScoringRule rule = new PlacementScoringRule();
            rule.setStage(stage);
            rule.setPlacement(ruleRequest.placement());
            rule.setPoints(ruleRequest.points());
            placementRuleRepository.save(rule);
        });
        return get(stageId);
    }

    @Transactional(readOnly = true)
    public ScoringConfigResponse get(UUID stageId) {
        requireStage(stageId);
        return new ScoringConfigResponse(
                metricRuleRepository.findAllByStageIdOrderBySortOrderAsc(stageId)
                        .stream()
                        .map(rule -> new MetricScoringRuleRequest(
                                rule.getMetricKey(),
                                rule.getLabel(),
                                rule.getPointsPerUnit(),
                                rule.getSortOrder()
                        ))
                        .toList(),
                placementRuleRepository.findAllByStageIdOrderByPlacementAsc(stageId)
                        .stream()
                        .map(rule -> new PlacementScoringRuleRequest(
                                rule.getPlacement(),
                                rule.getPoints()
                        ))
                        .toList()
        );
    }

    private void validateUniqueRules(ScoringConfigRequest request) {
        Set<String> metricKeys = new HashSet<>();
        request.metricRules().forEach(rule -> {
            if (!metricKeys.add(rule.metricKey().toLowerCase(Locale.ROOT))) {
                throw new ConflictException("Metric scoring keys must be unique");
            }
        });
        Set<Integer> placements = new HashSet<>();
        request.placementRules().forEach(rule -> {
            if (!placements.add(rule.placement())) {
                throw new ConflictException("Placement scoring rules must be unique");
            }
        });
    }

    private TournamentStage requireStage(UUID stageId) {
        return stageRepository.findById(stageId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament stage not found"));
    }
}
