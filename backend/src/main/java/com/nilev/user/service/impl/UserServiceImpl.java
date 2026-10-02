package com.nilev.user.service.impl;

import com.nilev.exception.NilevApiException;
import com.nilev.exception.ResourceNotFoundException;
import com.nilev.partner.entity.PartnerActivity;
import com.nilev.partner.entity.PartnerConnection;
import com.nilev.user.dto.DeleteAccountRequest;
import com.nilev.user.dto.UpdateUserRequest;
import com.nilev.user.dto.UserDto;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import com.nilev.user.service.UserService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private final UserRepository userRepository;
    private final Path avatarUploadDir = Paths.get("uploads", "avatars");

    @PersistenceContext
    private EntityManager entityManager;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(Long currentUserId) {
        return getUserById(currentUserId);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long currentUserId, UpdateUserRequest request) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        if (request != null) {
            if (request.getName() != null) {
                String trimmedName = request.getName().trim();
                if (trimmedName.isEmpty()) {
                    throw new NilevApiException("Full name cannot be blank", HttpStatus.BAD_REQUEST, "INVALID_NAME");
                }
                user.setName(trimmedName);
            }

            if (request.getNickname() != null) {
                String trimmedNickname = request.getNickname().trim();
                user.setNickname(trimmedNickname.isEmpty() ? null : trimmedNickname);
            }

            if (request.getProfileImageUrl() != null) {
                String trimmedUrl = request.getProfileImageUrl().trim();
                user.setAvatarUrl(trimmedUrl.isEmpty() ? null : trimmedUrl);
            }
        }

        user = userRepository.save(user);
        log.info("User {} updated profile: name='{}', nickname='{}'", currentUserId, user.getName(), user.getNickname());
        return toDto(user);
    }

    @Override
    @Transactional
    public UserDto updateProfilePicture(Long currentUserId, MultipartFile file) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        if (file == null || file.isEmpty()) {
            throw new NilevApiException("Please select a valid image file to upload", HttpStatus.BAD_REQUEST, "EMPTY_FILE");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new NilevApiException("File size exceeds 5MB limit", HttpStatus.BAD_REQUEST, "FILE_TOO_LARGE");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new NilevApiException("Invalid image format. Allowed formats: JPG, PNG, WEBP", HttpStatus.BAD_REQUEST, "INVALID_IMAGE_TYPE");
        }

        String extension = ".jpg";
        if (contentType.equalsIgnoreCase("image/png")) {
            extension = ".png";
        } else if (contentType.equalsIgnoreCase("image/webp")) {
            extension = ".webp";
        }

        try {
            if (!Files.exists(avatarUploadDir)) {
                Files.createDirectories(avatarUploadDir);
            }

            // Remove previous avatar file if stored locally
            deleteLocalAvatarIfPresent(user.getAvatarUrl());

            String filename = "avatar_" + currentUserId + "_" + System.currentTimeMillis() + extension;
            Path targetFile = avatarUploadDir.resolve(filename);
            Files.write(targetFile, file.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            String avatarUrl = "/api/v1/users/avatar/" + filename;
            user.setAvatarUrl(avatarUrl);
            user = userRepository.save(user);

            log.info("User {} uploaded new profile picture: {}", currentUserId, avatarUrl);
            return toDto(user);
        } catch (IOException e) {
            log.error("Failed to store profile picture for user {}", currentUserId, e);
            throw new NilevApiException("Failed to store image on server. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR, "FILE_UPLOAD_FAILED");
        }
    }

    @Override
    @Transactional
    public UserDto removeProfilePicture(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        deleteLocalAvatarIfPresent(user.getAvatarUrl());
        user.setAvatarUrl(null);
        user = userRepository.save(user);

        log.info("User {} removed profile picture", currentUserId);
        return toDto(user);
    }

    @Override
    @Transactional
    public void deleteUserAccount(Long currentUserId, DeleteAccountRequest request) {
        if (request == null || request.getConfirmation() == null || !"DELETE".equals(request.getConfirmation().trim())) {
            throw new NilevApiException("Please type DELETE to confirm account deletion", HttpStatus.BAD_REQUEST, "INVALID_CONFIRMATION");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        log.warn("Initiating permanent account deletion for User ID: {}, Email: {}", currentUserId, user.getEmail());

        // 1. Safe Partner Connection Handling
        List<PartnerConnection> connections = entityManager.createQuery(
                "SELECT pc FROM PartnerConnection pc WHERE pc.user1.id = :uid OR pc.user2.id = :uid", PartnerConnection.class)
                .setParameter("uid", currentUserId)
                .getResultList();

        for (PartnerConnection pc : connections) {
            User partner = pc.getPartnerOf(currentUserId);
            if (partner != null && pc.isActive()) {
                PartnerActivity disconnectNotice = PartnerActivity.builder()
                        .user(partner)
                        .activityType("PARTNER_DISCONNECTED")
                        .title("Partner Disconnected")
                        .description("Your partner's account has been deleted.")
                        .icon("💔")
                        .build();
                entityManager.persist(disconnectNotice);
            }
            entityManager.remove(pc);
        }

        // 2. Remove partner invitations
        entityManager.createQuery("DELETE FROM PartnerInvitation pi WHERE pi.sender.id = :uid OR pi.receiver.id = :uid")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        // 3. Remove partner activities for this user
        entityManager.createQuery("DELETE FROM PartnerActivity pa WHERE pa.user.id = :uid")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        // 4. Remove surprises (sent or received)
        entityManager.createQuery("DELETE FROM Surprise s WHERE s.sender.id = :uid OR s.receiver.id = :uid")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        // 5. Remove notifications (targeted or actor)
        entityManager.createQuery("DELETE FROM Notification n WHERE n.user.id = :uid OR n.actor.id = :uid")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        // 6. Remove activity reactions
        entityManager.createNativeQuery("DELETE FROM activity_reactions WHERE user_id = :uid OR activity_id IN (SELECT id FROM activities WHERE actor_id = :uid)")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        // 7. Remove activities by user
        entityManager.createQuery("DELETE FROM Activity a WHERE a.actor.id = :uid")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        // 8. Remove habit completions
        entityManager.createNativeQuery("DELETE FROM habit_completions WHERE user_id = :uid OR habit_id IN (SELECT id FROM habits WHERE user_id = :uid)")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        // 9. Remove habits
        entityManager.createQuery("DELETE FROM Habit h WHERE h.user.id = :uid")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        // 10. Goals: unlink if partner, delete if owner
        entityManager.createQuery("UPDATE Goal g SET g.partner = null WHERE g.partner.id = :uid")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        entityManager.createQuery("DELETE FROM Goal g WHERE g.owner.id = :uid")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        // 11. Companions & Companion History
        entityManager.createNativeQuery("DELETE FROM companion_history WHERE companion_id IN (SELECT id FROM companions WHERE user_id = :uid)")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        entityManager.createQuery("DELETE FROM Companion c WHERE c.user.id = :uid")
                .setParameter("uid", currentUserId)
                .executeUpdate();

        // 12. Delete stored avatar file
        deleteLocalAvatarIfPresent(user.getAvatarUrl());

        // 13. Finally delete User entity
        userRepository.delete(user);
        log.info("User {} deleted successfully with all personal data.", currentUserId);
    }

    @Override
    public byte[] getAvatarImage(String filename) {
        if (filename == null || filename.isBlank() || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new NilevApiException("Invalid avatar filename", HttpStatus.BAD_REQUEST, "INVALID_FILENAME");
        }

        Path target = avatarUploadDir.resolve(filename);
        if (!Files.exists(target)) {
            throw new ResourceNotFoundException("Avatar", "filename", filename);
        }

        try {
            return Files.readAllBytes(target);
        } catch (IOException e) {
            log.error("Error reading avatar file {}", filename, e);
            throw new NilevApiException("Failed to read image file", HttpStatus.INTERNAL_SERVER_ERROR, "FILE_READ_ERROR");
        }
    }

    @Override
    public String getAvatarContentType(String filename) {
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".webp")) return "image/webp";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        }
        return "application/octet-stream";
    }

    private void deleteLocalAvatarIfPresent(String avatarUrl) {
        if (avatarUrl != null && (avatarUrl.contains("/users/avatar/"))) {
            int idx = avatarUrl.lastIndexOf("/users/avatar/");
            if (idx != -1) {
                String filename = avatarUrl.substring(idx + "/users/avatar/".length());
                if (!filename.contains("..") && !filename.contains("/") && !filename.contains("\\")) {
                    Path oldFile = avatarUploadDir.resolve(filename);
                    try {
                        Files.deleteIfExists(oldFile);
                    } catch (IOException ignored) {}
                }
            }
        }
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .profileImageUrl(user.getAvatarUrl())
                .role(user.getRole())
                .active(user.isActive())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
