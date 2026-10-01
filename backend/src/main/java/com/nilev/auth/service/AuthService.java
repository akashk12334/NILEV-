package com.nilev.auth.service;

import com.nilev.auth.dto.AuthResponse;
import com.nilev.auth.dto.LoginRequest;
import com.nilev.auth.dto.RegisterRequest;
import com.nilev.auth.dto.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String refreshToken);

    void logout(String token);

    UserResponse getMe(Long userId);
}
