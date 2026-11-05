package com.nilev.auth.repository;

import com.nilev.auth.entity.RecoveryCode;
import com.nilev.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecoveryCodeRepository extends JpaRepository<RecoveryCode, Long> {

    Optional<RecoveryCode> findByUser(User user);

    Optional<RecoveryCode> findByCodeHash(String codeHash);

    void deleteByUser(User user);
}

