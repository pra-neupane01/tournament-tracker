package in.neupanepralad.esports.registration.workflow.repository;

import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface TournamentRegistrationRepository
        extends JpaRepository<TournamentRegistration, UUID> {

    Optional<TournamentRegistration> findByTournamentIdAndTeamId(
            UUID tournamentId,
            UUID teamId
    );

    Page<TournamentRegistration> findAllByTournamentId(
            UUID tournamentId,
            Pageable pageable
    );

    Page<TournamentRegistration> findAllByTournamentIdAndStatus(
            UUID tournamentId,
            RegistrationStatus status,
            Pageable pageable
    );

    long countByTournamentIdAndStatus(UUID tournamentId, RegistrationStatus status);

    long countByTournamentIdAndStatusIn(
            UUID tournamentId,
            Collection<RegistrationStatus> statuses
    );
}
