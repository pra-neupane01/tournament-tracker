package in.neupanepralad.esports.match.repository;

import in.neupanepralad.esports.match.model.FixtureCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FixtureCheckInRepository extends JpaRepository<FixtureCheckIn, UUID> {
    Optional<FixtureCheckIn> findByFixtureIdAndRegistrationId(
            UUID fixtureId,
            UUID registrationId
    );

    List<FixtureCheckIn> findAllByFixtureIdOrderByCheckedInAtAsc(UUID fixtureId);
}
