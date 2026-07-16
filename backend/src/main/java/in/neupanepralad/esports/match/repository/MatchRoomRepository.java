package in.neupanepralad.esports.match.repository;

import in.neupanepralad.esports.match.model.MatchRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MatchRoomRepository extends JpaRepository<MatchRoom, UUID> {
    Optional<MatchRoom> findByFixtureId(UUID fixtureId);
}
