package com.nilev.user.service;

import com.nilev.user.dto.UserDto;

public interface UserService {

    UserDto getUserById(Long id);

    UserDto getUserByEmail(String email);

    UserDto getCurrentUser(Long currentUserId);
}
