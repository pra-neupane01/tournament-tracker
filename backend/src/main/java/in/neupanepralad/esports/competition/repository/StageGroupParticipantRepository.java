package in.neupanepralad.esports.competition.repository;

import in.neupanepralad.esports.competition.model.StageGroupParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StageGroupParticipantRepository
        extends JpaRepository<StageGroupParticipant, UUID> {

    List<StageGroupParticipant> findAllByGroupIdOrderBySeedAsc(UUID groupId);

    void deleteAllByGroupStageId(UUID stageId);
}
