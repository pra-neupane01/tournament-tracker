package in.neupanepralad.esports.competition.repository;

import in.neupanepralad.esports.competition.model.FixtureParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FixtureParticipantRepository extends JpaRepository<FixtureParticipant, UUID> {
    List<FixtureParticipant> findAllByFixtureIdOrderBySlotNumberAsc(UUID fixtureId);

    List<FixtureParticipant> findAllByRegistrationId(UUID registrationId);

    boolean existsByFixtureIdAndRegistrationId(UUID fixtureId, UUID registrationId);

    void deleteAllByFixtureStageId(UUID stageId);

    void deleteAllByFixtureId(UUID fixtureId);
}
