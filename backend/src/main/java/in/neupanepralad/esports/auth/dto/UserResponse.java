package in.neupanepralad.esports.auth.dto;

import in.neupanepralad.esports.user.model.Role;
import in.neupanepralad.esports.user.model.User;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        Role role,
        boolean enabled
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled()
        );
    }
}
