package com.nilev.user.service;

import com.nilev.user.dto.UserDto;

import org.springframework.web.multipart.MultipartFile;
import com.nilev.user.dto.UpdateUserRequest;
import com.nilev.user.dto.DeleteAccountRequest;

public interface UserService {

    UserDto getUserById(Long id);

    UserDto getUserByEmail(String email);

    UserDto getCurrentUser(Long currentUserId);

    UserDto updateUser(Long currentUserId, UpdateUserRequest request);

    UserDto updateProfilePicture(Long currentUserId, MultipartFile file);

    UserDto removeProfilePicture(Long currentUserId);

    void deleteUserAccount(Long currentUserId, DeleteAccountRequest request);

    byte[] getAvatarImage(String filename);

    String getAvatarContentType(String filename);
}
