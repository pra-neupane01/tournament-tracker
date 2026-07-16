package in.neupanepralad.esports.team.repository;

import in.neupanepralad.esports.team.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {
    List<TeamMember> findAllByTeamIdOrderByRoleAscCreatedAtAsc(UUID teamId);

    Optional<TeamMember> findByTeamIdAndUserId(UUID teamId, UUID userId);

    boolean existsByTeamIdAndPlayerUidIgnoreCase(UUID teamId, String playerUid);

    void deleteAllByTeamId(UUID teamId);
}
