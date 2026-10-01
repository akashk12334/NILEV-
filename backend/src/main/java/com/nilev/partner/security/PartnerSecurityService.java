package com.nilev.partner.security;

import com.nilev.exception.UnauthorizedPartnerAccessException;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("partnerSecurity")
public class PartnerSecurityService {

    private final PartnerConnectionRepository partnerConnectionRepository;

    public PartnerSecurityService(PartnerConnectionRepository partnerConnectionRepository) {
        this.partnerConnectionRepository = partnerConnectionRepository;
    }

    /**
     * Gets the currently authenticated user's ID.
     */
    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getId();
        }
        return null;
    }

    /**
     * Checks if current user is the owner of the resource.
     */
    public boolean isSelf(Long targetUserId) {
        Long currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(targetUserId);
    }

    /**
     * Checks if targetUserId is the connected partner of current user.
     */
    public boolean isConnectedPartner(Long targetUserId) {
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null || targetUserId == null) {
            return false;
        }
        return partnerConnectionRepository.findActiveConnectionBetween(currentUserId, targetUserId).isPresent();
    }

    /**
     * Checks if current user can view data for targetUserId.
     * Both people can view each other's:
     * - habit completion, streaks, goals progress, XP, level, companion, achievements, activity timeline.
     */
    public boolean canRead(Long targetUserId) {
        return isSelf(targetUserId) || isConnectedPartner(targetUserId);
    }

    /**
     * Checks if current user can modify data for targetUserId.
     * A user MUST NOT be able to:
     * - edit partner habits, delete partner habits, complete partner habits
     * - edit partner goals, delete partner goals
     * - change partner profile, change partner companion
     * Partner data is strictly read-only!
     */
    public boolean canModify(Long targetUserId) {
        return isSelf(targetUserId);
    }

    /**
     * Enforces read permission. Throws AccessDeniedException if not self or connected partner.
     */
    public void enforceCanRead(Long targetUserId) {
        if (!canRead(targetUserId)) {
            throw new AccessDeniedException("Access denied: You can only view data for yourself or your connected partner.");
        }
    }

    /**
     * Enforces write/modify permission. Throws UnauthorizedPartnerAccessException if attempting to modify partner data.
     */
    public void enforceCanModify(Long ownerId, String resourceType) {
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null || !currentUserId.equals(ownerId)) {
            if (isConnectedPartner(ownerId)) {
                throw new UnauthorizedPartnerAccessException(
                        "Partner data is read-only. You cannot edit, delete, complete, or modify " +
                        resourceType + " belonging to your partner."
                );
            }
            throw new AccessDeniedException("Access denied: You do not have permission to modify this " + resourceType + ".");
        }
    }

    public void enforceCanModifyProfile(Long targetUserId) {
        enforceCanModify(targetUserId, "profile");
    }

    public void enforceCanModifyHabit(Long habitOwnerId) {
        enforceCanModify(habitOwnerId, "habits");
    }

    public void enforceCanModifyGoal(Long goalOwnerId) {
        enforceCanModify(goalOwnerId, "goals");
    }

    public void enforceCanModifyCompanion(Long companionOwnerId) {
        enforceCanModify(companionOwnerId, "companion");
    }
}
