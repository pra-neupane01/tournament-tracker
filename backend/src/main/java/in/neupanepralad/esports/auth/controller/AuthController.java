package in.neupanepralad.esports.auth.controller;

import in.neupanepralad.esports.auth.dto.AuthResponse;
import in.neupanepralad.esports.auth.dto.ChangePasswordRequest;
import in.neupanepralad.esports.auth.dto.LoginRequest;
import in.neupanepralad.esports.auth.dto.RefreshRequest;
import in.neupanepralad.esports.auth.dto.RegisterRequest;
import in.neupanepralad.esports.auth.dto.UserResponse;
import in.neupanepralad.esports.auth.service.AuthService;
import in.neupanepralad.esports.common.response.APIResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return APIResponse.success("Account created", authService.register(request));
    }

    @PostMapping("/login")
    public APIResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return APIResponse.success("Login successful", authService.login(request));
    }

    @PostMapping("/refresh")
    public APIResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return APIResponse.success("Token refreshed", authService.refresh(request));
    }

    @PostMapping("/logout")
    public APIResponse<Void> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request);
        return APIResponse.success("Logged out");
    }

    @GetMapping("/me")
    public APIResponse<UserResponse> me(Authentication authentication) {
        return APIResponse.success(
                "Current user retrieved",
                authService.currentUser(UUID.fromString(authentication.getName()))
        );
    }

    @PostMapping("/change-password")
    public APIResponse<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(UUID.fromString(authentication.getName()), request);
        return APIResponse.success("Password changed");
    }
}
