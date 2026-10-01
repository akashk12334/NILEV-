package com.nilev.companion.service;

import com.nilev.companion.dto.*;
import com.nilev.companion.entity.Companion;

import java.util.List;

public interface CompanionService {

    CompanionResponse getMyCompanion(Long currentUserId);

    CompanionResponse chooseCompanion(Long currentUserId, ChooseCompanionRequest request);

    CompanionResponse updateCompanion(Long currentUserId, UpdateCompanionRequest request);

    CompanionResponse getPartnerCompanion(Long currentUserId);

    List<CompanionHistoryResponse> getCompanionHistory(Long currentUserId, int limit);

    CompanionResponse interact(Long currentUserId);

    /**
     * Award XP to user's companion from legitimate domain activity.
     * Checks deterministic level progression and emits COMPANION_LEVEL_UP event if level increases.
     */
    Companion addXp(Long userId, int xpAmount, String eventType, String title, String description, String icon);
}
