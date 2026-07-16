package in.neupanepralad.esports.organization.repository;

import in.neupanepralad.esports.organization.model.MembershipRole;
import in.neupanepralad.esports.organization.model.OrganizationMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationMembershipRepository
        extends JpaRepository<OrganizationMembership, UUID> {

    Optional<OrganizationMembership> findByOrganizationIdAndUserId(
            UUID organizationId,
            UUID userId
    );

    List<OrganizationMembership> findAllByOrganizationIdOrderByCreatedAtAsc(UUID organizationId);

    boolean existsByOrganizationIdAndUserIdAndRoleIn(
            UUID organizationId,
            UUID userId,
            List<MembershipRole> roles
    );

    void deleteAllByOrganizationId(UUID organizationId);
}
