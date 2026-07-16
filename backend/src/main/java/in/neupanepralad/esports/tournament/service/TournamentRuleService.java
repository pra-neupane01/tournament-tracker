package in.neupanepralad.esports.tournament.service;

import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.tournament.dto.TournamentRuleRequest;
import in.neupanepralad.esports.tournament.dto.TournamentRuleResponse;
import in.neupanepralad.esports.tournament.model.TournamentRule;
import in.neupanepralad.esports.tournament.repository.TournamentRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TournamentRuleService {

    private final TournamentRuleRepository ruleRepository;
    private final TournamentAccessService accessService;

    @Transactional(readOnly = true)
    public List<TournamentRuleResponse> list(UUID tournamentId) {
        accessService.requireTournament(tournamentId);
        return ruleRepository.findAllByTournamentIdOrderBySortOrderAsc(tournamentId)
                .stream().map(TournamentRuleResponse::from).toList();
    }

    @Transactional
    public TournamentRuleResponse create(
            UUID tournamentId,
            UUID actorId,
            TournamentRuleRequest request
    ) {
        TournamentRule rule = new TournamentRule();
        rule.setTournament(accessService.requireManager(tournamentId, actorId));
        apply(rule, request);
        return TournamentRuleResponse.from(ruleRepository.save(rule));
    }

    @Transactional
    public TournamentRuleResponse update(
            UUID tournamentId,
            UUID ruleId,
            UUID actorId,
            TournamentRuleRequest request
    ) {
        accessService.requireManager(tournamentId, actorId);
        TournamentRule rule = requireRule(tournamentId, ruleId);
        apply(rule, request);
        return TournamentRuleResponse.from(rule);
    }

    @Transactional
    public void delete(UUID tournamentId, UUID ruleId, UUID actorId) {
        accessService.requireManager(tournamentId, actorId);
        ruleRepository.delete(requireRule(tournamentId, ruleId));
    }

    private TournamentRule requireRule(UUID tournamentId, UUID ruleId) {
        TournamentRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament rule not found"));
        if (!rule.getTournament().getId().equals(tournamentId)) {
            throw new ResourceNotFoundException("Tournament rule not found");
        }
        return rule;
    }

    private void apply(TournamentRule rule, TournamentRuleRequest request) {
        rule.setTitle(request.title().trim());
        rule.setContent(request.content().trim());
        rule.setSortOrder(request.sortOrder());
    }
}
