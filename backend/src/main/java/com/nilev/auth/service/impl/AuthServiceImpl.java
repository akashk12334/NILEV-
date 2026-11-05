package com.nilev.auth.service.impl;

import com.nilev.auth.dto.AdminPasswordResetRequest;
import com.nilev.auth.dto.AuthResponse;
import com.nilev.auth.dto.ChangePasswordRequest;
import com.nilev.auth.dto.ForgotPasswordRequest;
import com.nilev.auth.dto.LoginRequest;
import com.nilev.auth.dto.RecoveryCodeResponse;
import com.nilev.auth.dto.RecoveryCodeStatusResponse;
import com.nilev.auth.dto.RegisterRequest;
import com.nilev.auth.dto.ResetPasswordRequest;
import com.nilev.auth.dto.ResetPasswordWithRecoveryCodeRequest;
import com.nilev.auth.dto.UserResponse;
import com.nilev.auth.entity.PasswordResetRequest;
import com.nilev.auth.entity.PasswordResetToken;
import com.nilev.auth.entity.RecoveryCode;
import com.nilev.auth.repository.PasswordResetRequestRepository;
import com.nilev.auth.repository.PasswordResetTokenRepository;
import com.nilev.auth.repository.RecoveryCodeRepository;
import com.nilev.auth.service.AuthService;
import com.nilev.auth.service.EmailService;
import com.nilev.auth.util.RecoveryCodeUtils;
import com.nilev.exception.*;
import com.nilev.security.JwtTokenProvider;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordResetRequestRepository passwordResetRequestRepository;
    private final RecoveryCodeRepository recoveryCodeRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           PasswordResetTokenRepository passwordResetTokenRepository,
                           PasswordResetRequestRepository passwordResetRequestRepository,
                           RecoveryCodeRepository recoveryCodeRepository,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordResetRequestRepository = passwordResetRequestRepository;
        this.recoveryCodeRepository = recoveryCodeRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateEmailException(normalizedEmail);
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordHash)
                .active(true)
                .role("USER")
                .lastLoginAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);

        // Generate initial recovery code for newly registered account
        String rawRecoveryCode = RecoveryCodeUtils.generateCode();
        String codeHash = RecoveryCodeUtils.hashCode(RecoveryCodeUtils.normalizeCode(rawRecoveryCode));
        RecoveryCode recoveryCode = new RecoveryCode(null, savedUser, codeHash, null, Instant.now());
        recoveryCodeRepository.save(recoveryCode);

        String accessToken = tokenProvider.generateAccessToken(savedUser.getId(), savedUser.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getId(), savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(toUserResponse(savedUser))
                .recoveryCode(rawRecoveryCode)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            throw new AccountInactiveException("Account is currently disabled. Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidTokenException("Refresh token cannot be blank");
        }

        String rawToken = refreshToken.startsWith("Bearer ")
                ? refreshToken.substring(7).trim()
                : refreshToken.trim();

        String tokenType = tokenProvider.getTokenType(rawToken);
        if (!"REFRESH".equalsIgnoreCase(tokenType)) {
            throw new InvalidTokenException("The supplied token is not a valid refresh token");
        }

        Long userId = tokenProvider.getUserIdFromToken(rawToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidTokenException("User associated with refresh token no longer exists"));

        if (!user.isActive()) {
            throw new AccountInactiveException("Account is disabled");
        }

        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    @Override
    public void logout(String token) {
        // Stateless JWT logout - clients purge local credentials.
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return toUserResponse(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (userOpt.isPresent() && userOpt.get().isActive()) {
            User user = userOpt.get();

            // Invalidate any previously requested unused tokens for this user
            passwordResetTokenRepository.deleteByUser(user);

            // Generate cryptographically secure random token (32 bytes = 64 hex characters)
            byte[] randomBytes = new byte[32];
            secureRandom.nextBytes(randomBytes);
            String rawToken = HexFormat.of().formatHex(randomBytes);

            // Store only the SHA-256 hash in the database
            String tokenHash = hashToken(rawToken);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(tokenHash)
                    .expiresAt(Instant.now().plus(Duration.ofMinutes(15)))
                    .build();

            passwordResetTokenRepository.save(resetToken);

            // Send password reset email
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), rawToken);
        } else {
            // Protect against user enumeration - log for observability only
            log.info("Password reset requested for unregistered or inactive email: {}", normalizedEmail);
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String rawToken = request.getToken().trim();
        String newPassword = request.getNewPassword();

        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }

        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or unrecognized password reset token"));

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("This password reset token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new TokenExpiredException("This password reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        if (user == null || !user.isActive()) {
            throw new InvalidTokenException("The account associated with this token is disabled or inactive");
        }

        // Update password hash and mark when password was changed (invalidates previous sessions)
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);

        // Mark token as consumed (single-use)
        resetToken.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(resetToken);

        // Clean up any remaining tokens for this user
        passwordResetTokenRepository.deleteByUser(user);
    }

    @Override
    @Transactional
    public void resetPasswordWithRecoveryCode(ResetPasswordWithRecoveryCodeRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        String normalizedCode = RecoveryCodeUtils.normalizeCode(request.getRecoveryCode());
        String codeHash = RecoveryCodeUtils.hashCode(normalizedCode);

        String newPassword = request.getNewPassword();
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (userOpt.isEmpty() || !userOpt.get().isActive()) {
            throw new BadRequestException("Invalid email or recovery code");
        }

        User user = userOpt.get();
        Optional<RecoveryCode> codeOpt = recoveryCodeRepository.findByUser(user);
        if (codeOpt.isEmpty()) {
            throw new BadRequestException("Invalid email or recovery code");
        }

        RecoveryCode recoveryCode = codeOpt.get();
        if (recoveryCode.getUsedAt() != null || !recoveryCode.getCodeHash().equals(codeHash)) {
            throw new BadRequestException("Invalid email or recovery code");
        }

        // Update password hash and passwordChangedAt
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);

        // Invalidate recovery code (single-use)
        recoveryCode.setUsedAt(Instant.now());
        recoveryCodeRepository.save(recoveryCode);

        // Clean up any remaining email reset tokens for this user
        passwordResetTokenRepository.deleteByUser(user);

        log.info("Password successfully reset via recovery code for user ID: {}", user.getId());
    }

    @Override
    @Transactional
    public RecoveryCodeResponse generateRecoveryCode(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String rawCode = RecoveryCodeUtils.generateCode();
        String codeHash = RecoveryCodeUtils.hashCode(RecoveryCodeUtils.normalizeCode(rawCode));

        Optional<RecoveryCode> existingOpt = recoveryCodeRepository.findByUser(user);
        if (existingOpt.isPresent()) {
            RecoveryCode existing = existingOpt.get();
            existing.setCodeHash(codeHash);
            existing.setUsedAt(null);
            existing.setCreatedAt(Instant.now());
            recoveryCodeRepository.save(existing);
        } else {
            RecoveryCode newCode = new RecoveryCode(null, user, codeHash, null, Instant.now());
            recoveryCodeRepository.save(newCode);
        }

        log.info("Recovery code generated for user ID: {}", userId);
        return new RecoveryCodeResponse(rawCode);
    }

    @Override
    @Transactional(readOnly = true)
    public RecoveryCodeStatusResponse getRecoveryCodeStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Optional<RecoveryCode> existingOpt = recoveryCodeRepository.findByUser(user);
        if (existingOpt.isPresent() && existingOpt.get().getUsedAt() == null) {
            return new RecoveryCodeStatusResponse(true, existingOpt.get().getCreatedAt());
        }
        return new RecoveryCodeStatusResponse(false, null);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        String newPassword = request.getNewPassword();
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters long");
        }

        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new BadRequestException("New password cannot be the same as current password");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);

        // Invalidate any active password reset tokens
        passwordResetTokenRepository.deleteByUser(user);

        log.info("Password successfully updated for user ID: {}", userId);
    }

    @Override
    @Transactional
    public void requestAdminPasswordReset(AdminPasswordResetRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        String maskedEmail = maskEmail(email);

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 1. Immediately hash the proposed new password using BCrypt (never store plain-text)
            String proposedHash = passwordEncoder.encode(request.getNewPassword());

            // 2. Supersede any earlier PENDING requests for this user (only 1 active pending request)
            List<PasswordResetRequest> existingPending = passwordResetRequestRepository.findByUserAndStatus(user, "PENDING");
            for (PasswordResetRequest existing : existingPending) {
                existing.setStatus("SUPERSEDED");
                existing.setProcessedAt(Instant.now());
                existing.setAdminNotes("Superseded by a newer password reset request");
                passwordResetRequestRepository.save(existing);
            }

            // 3. Persist the new request with 24-hour expiration window
            PasswordResetRequest resetRequest = PasswordResetRequest.builder()
                    .user(user)
                    .proposedPasswordHash(proposedHash)
                    .status("PENDING")
                    .createdAt(Instant.now())
                    .expiresAt(Instant.now().plus(Duration.ofHours(24)))
                    .build();

            passwordResetRequestRepository.save(resetRequest);

            log.info("Admin password reset request recorded for user ID: {} [{}]. Status: PENDING, Expires: 24h.",
                    user.getId(), maskedEmail);
        } else {
            log.warn("Admin password reset request for non-existent email [{}]. No request recorded.", maskedEmail);
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "unknown";
        String[] parts = email.split("@", 2);
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.charAt(0) + "*@" + domain;
        }
        return name.substring(0, 2) + "***@" + domain;
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .active(user.isActive())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
