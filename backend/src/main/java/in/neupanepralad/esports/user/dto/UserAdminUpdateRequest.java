package in.neupanepralad.esports.user.dto;

import in.neupanepralad.esports.user.model.Role;
import jakarta.validation.constraints.NotNull;

public record UserAdminUpdateRequest(
        @NotNull Role role,
        boolean enabled,
        boolean locked
) {
}
