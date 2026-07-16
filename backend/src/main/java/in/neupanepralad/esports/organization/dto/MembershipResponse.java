package in.neupanepralad.esports.organization.dto;

import in.neupanepralad.esports.organization.model.MembershipRole;
import in.neupanepralad.esports.organization.model.OrganizationMembership;
import in.neupanepralad.esports.user.model.Role;

import java.util.UUID;

public record MembershipResponse(
        UUID id,
        UUID userId,
        String fullName,
        String email,
        Role platformRole,
        MembershipRole organizationRole
) {
    public static MembershipResponse from(OrganizationMembership membership) {
        return new MembershipResponse(
                membership.getId(),
                membership.getUser().getId(),
                membership.getUser().getFullName(),
                membership.getUser().getEmail(),
                membership.getUser().getRole(),
                membership.getRole()
        );
    }
}
