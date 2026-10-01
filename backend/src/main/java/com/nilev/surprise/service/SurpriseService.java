package com.nilev.surprise.service;

import com.nilev.surprise.dto.CreateSurpriseRequest;
import com.nilev.surprise.dto.SurpriseResponse;
import com.nilev.surprise.dto.UpdateSurpriseRequest;

import java.util.List;

public interface SurpriseService {

    SurpriseResponse createSurprise(Long currentUserId, CreateSurpriseRequest request);

    List<SurpriseResponse> getReceivedSurprises(Long currentUserId);

    List<SurpriseResponse> getSentSurprises(Long currentUserId);

    List<SurpriseResponse> getScheduledSurprises(Long currentUserId);

    SurpriseResponse getSurpriseById(Long currentUserId, Long surpriseId);

    SurpriseResponse updateSurprise(Long currentUserId, Long surpriseId, UpdateSurpriseRequest request);

    void deleteSurprise(Long currentUserId, Long surpriseId);

    SurpriseResponse openSurprise(Long currentUserId, Long surpriseId);

    SurpriseResponse sendDraft(Long currentUserId, Long surpriseId);
}
