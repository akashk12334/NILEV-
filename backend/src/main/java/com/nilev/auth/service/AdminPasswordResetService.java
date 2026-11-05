package com.nilev.auth.service;

import com.nilev.auth.dto.AdminApprovalRequest;
import com.nilev.auth.dto.AdminPasswordResetResponse;
import com.nilev.auth.dto.AdminRejectionRequest;

import java.util.List;

public interface AdminPasswordResetService {

    List<AdminPasswordResetResponse> getPendingPasswordResets();

    List<AdminPasswordResetResponse> getAllPasswordResets();

    void approvePasswordReset(Long requestId, Long adminUserId, AdminApprovalRequest request);

    void rejectPasswordReset(Long requestId, Long adminUserId, AdminRejectionRequest request);
}

