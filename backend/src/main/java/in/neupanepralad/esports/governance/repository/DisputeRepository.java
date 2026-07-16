package in.neupanepralad.esports.governance.repository;

import in.neupanepralad.esports.governance.model.Dispute;
import in.neupanepralad.esports.governance.model.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    Page<Dispute> findAllByFixtureStageTournamentId(
            UUID tournamentId,
            Pageable pageable
    );

    Page<Dispute> findAllByFixtureStageTournamentIdAndStatus(
            UUID tournamentId,
            DisputeStatus status,
            Pageable pageable
    );
}
