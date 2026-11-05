package com.nilev.auth.repository;

import com.nilev.auth.entity.PasswordResetRequest;
import com.nilev.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {

    List<PasswordResetRequest> findByStatusOrderByCreatedAtDesc(String status);

    List<PasswordResetRequest> findByUserAndStatus(User user, String status);

    List<PasswordResetRequest> findAllByOrderByCreatedAtDesc();

    @Modifying
    void deleteByUser(User user);
}

