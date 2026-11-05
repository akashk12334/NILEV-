package com.nilev.auth.service.impl;

import com.nilev.auth.dto.AdminApprovalRequest;
import com.nilev.auth.dto.AdminPasswordResetResponse;
import com.nilev.auth.dto.AdminRejectionRequest;
import com.nilev.auth.entity.PasswordResetRequest;
import com.nilev.auth.repository.PasswordResetRequestRepository;
import com.nilev.auth.repository.PasswordResetTokenRepository;
import com.nilev.auth.service.AdminPasswordResetService;
import com.nilev.exception.BadRequestException;
import com.nilev.exception.ResourceNotFoundException;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminPasswordResetServiceImpl implements AdminPasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(AdminPasswordResetServiceImpl.class);

    private final PasswordResetRequestRepository resetRequestRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final UserRepository userRepository;

    public AdminPasswordResetServiceImpl(PasswordResetRequestRepository resetRequestRepository,
                                         PasswordResetTokenRepository resetTokenRepository,
                                         UserRepository userRepository) {
        this.resetRequestRepository = resetRequestRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminPasswordResetResponse> getPendingPasswordResets() {
        return resetRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING")
                .stream()
                .filter(req -> !req.isExpired())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminPasswordResetResponse> getAllPasswordResets() {
        return resetRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void approvePasswordReset(Long requestId, Long adminUserId, AdminApprovalRequest request) {
        // 1. Verify admin identity and active admin status
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new AccessDeniedException("Admin user not found"));

        if (!admin.isActive() || !"ADMIN".equalsIgnoreCase(admin.getRole())) {
            log.warn("Unauthorized approval attempt by user ID: {}", adminUserId);
            throw new AccessDeniedException("Only active administrators can approve password resets");
        }

        if (request == null || !request.isConfirmedIdentity()) {
            throw new BadRequestException("Administrator must explicitly confirm user identity before approval");
        }

        if (request.getVerificationNote() == null || request.getVerificationNote().trim().length() < 5) {
            throw new BadRequestException("Verification note must explain how user identity was verified (minimum 5 characters)");
        }

        // 2. Fetch the reset request
        PasswordResetRequest resetRequest = resetRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("PasswordResetRequest", "id", requestId));

        // 3. Verify status
        if (!resetRequest.isPending()) {
            throw new BadRequestException("Password reset request is not pending. Current status: " + resetRequest.getStatus());
        }

        // 4. Verify request has not expired
        if (resetRequest.isExpired()) {
            throw new BadRequestException("Password reset request has expired (>24 hours) and can no longer be approved");
        }

        // 5. Atomically apply the proposed BCrypt password to the user
        User user = resetRequest.getUser();
        user.setPasswordHash(resetRequest.getProposedPasswordHash());
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);

        // 6. Update request status to COMPLETED
        resetRequest.setStatus("COMPLETED");
        resetRequest.setProcessedAt(Instant.now());
        resetRequest.setProcessedByAdminId(admin.getId());
        resetRequest.setAdminNotes(request.getVerificationNote().trim());
        resetRequestRepository.save(resetRequest);

        // 7. Invalidate any active password reset tokens
        resetTokenRepository.deleteByUser(user);

        log.info("Password reset request #{} successfully APPROVED by admin ID: {} for user ID: {}",
                requestId, admin.getId(), user.getId());
    }

    @Override
    @Transactional
    public void rejectPasswordReset(Long requestId, Long adminUserId, AdminRejectionRequest request) {
        // 1. Verify admin identity and active admin status
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new AccessDeniedException("Admin user not found"));

        if (!admin.isActive() || !"ADMIN".equalsIgnoreCase(admin.getRole())) {
            log.warn("Unauthorized rejection attempt by user ID: {}", adminUserId);
            throw new AccessDeniedException("Only active administrators can reject password resets");
        }

        // 2. Fetch reset request
        PasswordResetRequest resetRequest = resetRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("PasswordResetRequest", "id", requestId));

        if (!resetRequest.isPending()) {
            throw new BadRequestException("Password reset request is not pending. Current status: " + resetRequest.getStatus());
        }

        String reason = (request != null && request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason().trim()
                : "Rejected by administrator";

        resetRequest.setStatus("REJECTED");
        resetRequest.setProcessedAt(Instant.now());
        resetRequest.setProcessedByAdminId(admin.getId());
        resetRequest.setAdminNotes(reason);
        resetRequestRepository.save(resetRequest);

        // Notice: user's password in database is NOT modified on rejection
        log.info("Password reset request #{} REJECTED by admin ID: {} for user ID: {}",
                requestId, admin.getId(), resetRequest.getUser().getId());
    }

    private AdminPasswordResetResponse toResponse(PasswordResetRequest entity) {
        User u = entity.getUser();
        return new AdminPasswordResetResponse(
                entity.getId(),
                u != null ? u.getId() : null,
                u != null ? u.getEmail() : null,
                u != null ? u.getName() : null,
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getExpiresAt(),
                entity.getProcessedAt(),
                entity.getProcessedByAdminId(),
                entity.getAdminNotes()
        );
    }
}
