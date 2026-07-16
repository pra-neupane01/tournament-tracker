package in.neupanepralad.esports.governance.repository;

import in.neupanepralad.esports.governance.model.Penalty;
import in.neupanepralad.esports.governance.model.PenaltyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PenaltyRepository extends JpaRepository<Penalty, UUID> {
    List<Penalty> findAllByTournamentIdOrderByIssuedAtDesc(UUID tournamentId);

    List<Penalty> findAllByTournamentIdAndStatus(
            UUID tournamentId,
            PenaltyStatus status
    );
}
