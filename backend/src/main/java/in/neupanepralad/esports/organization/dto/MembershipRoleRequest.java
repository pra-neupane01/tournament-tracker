package in.neupanepralad.esports.organization.dto;

import in.neupanepralad.esports.organization.model.MembershipRole;
import jakarta.validation.constraints.NotNull;

public record MembershipRoleRequest(@NotNull MembershipRole role) {
}
