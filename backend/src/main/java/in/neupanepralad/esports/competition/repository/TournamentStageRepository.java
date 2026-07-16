package in.neupanepralad.esports.competition.repository;

import in.neupanepralad.esports.competition.model.TournamentStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TournamentStageRepository extends JpaRepository<TournamentStage, UUID> {
    List<TournamentStage> findAllByTournamentIdOrderBySequenceNumberAsc(UUID tournamentId);
}
