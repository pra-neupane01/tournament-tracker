package in.neupanepralad.esports.organization.dto;

import in.neupanepralad.esports.organization.model.MembershipRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MembershipRequest(
        @NotBlank @Email String email,
        @NotNull MembershipRole role
) {
}
