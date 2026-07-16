package in.neupanepralad.esports.auth.service;

import in.neupanepralad.esports.auth.dto.AuthResponse;
import in.neupanepralad.esports.auth.dto.ChangePasswordRequest;
import in.neupanepralad.esports.auth.dto.LoginRequest;
import in.neupanepralad.esports.auth.dto.RefreshRequest;
import in.neupanepralad.esports.auth.dto.RegisterRequest;
import in.neupanepralad.esports.auth.dto.UserResponse;
import in.neupanepralad.esports.auth.model.RefreshToken;
import in.neupanepralad.esports.auth.repository.RefreshTokenRepository;
import in.neupanepralad.esports.auth.security.JwtService;
import in.neupanepralad.esports.common.exception.ConflictException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.common.exception.UnauthorizedException;
import in.neupanepralad.esports.user.model.Role;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.security.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.PLAYER);
        return issueTokens(userRepository.save(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (!user.isEnabled() || user.isLocked()
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken storedToken = refreshTokenRepository
                .findByTokenHashAndRevokedFalse(hashToken(request.refreshToken()))
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now(ZoneOffset.UTC))) {
            storedToken.setRevoked(true);
            throw new UnauthorizedException("Refresh token has expired");
        }
        storedToken.setRevoked(true);
        User user = storedToken.getUser();
        if (!user.isEnabled() || user.isLocked()) {
            throw new UnauthorizedException("User account is unavailable");
        }
        return issueTokens(user);
    }

    @Transactional
    public void logout(RefreshRequest request) {
        refreshTokenRepository.findByTokenHashAndRevokedFalse(hashToken(request.refreshToken()))
                .ifPresent(token -> token.setRevoked(true));
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(UUID userId) {
        return UserResponse.from(requireUser(userId));
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = requireUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    private AuthResponse issueTokens(User user) {
        String rawRefreshToken = createOpaqueToken();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashToken(rawRefreshToken));
        refreshToken.setExpiresAt(
                LocalDateTime.now(ZoneOffset.UTC).plus(
                        Duration.ofMillis(refreshTokenExpirationMs)
                )
        );
        refreshTokenRepository.save(refreshToken);
        return new AuthResponse(
                jwtService.createAccessToken(user),
                rawRefreshToken,
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds(),
                UserResponse.from(user)
        );
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    private String createOpaqueToken() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
