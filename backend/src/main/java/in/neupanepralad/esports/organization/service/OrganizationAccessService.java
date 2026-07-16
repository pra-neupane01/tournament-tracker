package in.neupanepralad.esports.organization.service;

import in.neupanepralad.esports.common.exception.ForbiddenException;
import in.neupanepralad.esports.organization.model.MembershipRole;
import in.neupanepralad.esports.organization.repository.OrganizationMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationAccessService {

    private final OrganizationMembershipRepository membershipRepository;

    public void requireManager(UUID organizationId, UUID userId) {
        if (!membershipRepository.existsByOrganizationIdAndUserIdAndRoleIn(
                organizationId,
                userId,
                List.of(MembershipRole.OWNER, MembershipRole.ADMIN)
        )) {
            throw new ForbiddenException("Organization manager access is required");
        }
    }

    public boolean isMember(UUID organizationId, UUID userId) {
        return membershipRepository.findByOrganizationIdAndUserId(organizationId, userId).isPresent();
    }
}
