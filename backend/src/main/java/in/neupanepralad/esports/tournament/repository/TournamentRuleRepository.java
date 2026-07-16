package in.neupanepralad.esports.tournament.repository;

import in.neupanepralad.esports.tournament.model.TournamentRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TournamentRuleRepository extends JpaRepository<TournamentRule, UUID> {
    List<TournamentRule> findAllByTournamentIdOrderBySortOrderAsc(UUID tournamentId);

    void deleteAllByTournamentId(UUID tournamentId);
}
