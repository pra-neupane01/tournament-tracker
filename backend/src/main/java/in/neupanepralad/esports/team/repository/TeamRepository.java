package in.neupanepralad.esports.team.repository;

import in.neupanepralad.esports.team.model.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {
    Page<Team> findAllByGameId(UUID gameId, Pageable pageable);

    boolean existsByGameIdAndNameIgnoreCase(UUID gameId, String name);

    Optional<Team> findByGameIdAndNameIgnoreCase(UUID gameId, String name);
}
