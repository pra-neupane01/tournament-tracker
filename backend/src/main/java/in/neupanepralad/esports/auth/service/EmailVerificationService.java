package in.neupanepralad.esports.auth.service;

import in.neupanepralad.esports.auth.model.EmailVerificationToken;
import in.neupanepralad.esports.auth.repository.EmailVerificationTokenRepository;
import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.user.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final EmailVerificationTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    @Value("${app.auth.verification-url:http://localhost:5173/verify-email}") private String verificationUrl;
    @Value("${app.auth.verification-token-expiration-hours:24}") private long expirationHours;
    @Value("${app.auth.email-verification-required:true}") private boolean verificationRequired;

    public boolean isVerificationRequired() { return verificationRequired; }

    @Transactional
    public void sendVerification(User user) {
        tokenRepository.deleteByUserId(user.getId());
        String raw = createToken();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user); token.setTokenHash(hash(raw));
        token.setExpiresAt(LocalDateTime.now(ZoneOffset.UTC).plusHours(expirationHours));
        tokenRepository.save(token);
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mailSender.createMimeMessage(), StandardCharsets.UTF_8.name());
            helper.setTo(user.getEmail()); helper.setSubject("Verify your EsportsManager account");
            helper.setText("<p>Hi " + user.getFullName() + ",</p><p><a href=\"" + verificationUrl
                    + "?token=" + raw + "\">Verify your email address</a></p>", true);
            mailSender.send(helper.getMimeMessage());
        } catch (MessagingException exception) {
            throw new IllegalStateException("Could not create verification email", exception);
        }
    }

    @Transactional
    public void verify(String raw) {
        EmailVerificationToken token = tokenRepository.findByTokenHashAndVerifiedAtIsNull(hash(raw))
                .orElseThrow(() -> new BadRequestException("Verification link is invalid or has expired"));
        if (token.getExpiresAt().isBefore(LocalDateTime.now(ZoneOffset.UTC)))
            throw new BadRequestException("Verification link is invalid or has expired");
        token.setVerifiedAt(LocalDateTime.now(ZoneOffset.UTC));
        token.getUser().setEmailVerified(true);
    }

    private String createToken() { byte[] bytes = new byte[48]; RANDOM.nextBytes(bytes); return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes); }
    private String hash(String value) { try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); } catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); } }
}
