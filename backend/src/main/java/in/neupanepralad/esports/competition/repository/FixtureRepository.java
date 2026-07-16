package in.neupanepralad.esports.competition.repository;

import in.neupanepralad.esports.competition.model.Fixture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FixtureRepository extends JpaRepository<Fixture, UUID> {
    List<Fixture> findAllByStageIdOrderByRoundNumberAscMatchNumberAsc(UUID stageId);

    List<Fixture> findAllByStageTournamentIdOrderByStageSequenceNumberAscRoundNumberAscMatchNumberAsc(
            UUID tournamentId
    );

    void deleteAllByStageId(UUID stageId);
}
