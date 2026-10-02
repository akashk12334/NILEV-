package com.nilev.user.controller;

import com.nilev.common.ApiResponse;
import com.nilev.exception.NilevApiException;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.security.UserPrincipal;
import com.nilev.user.dto.DeleteAccountRequest;
import com.nilev.user.dto.UpdateUserRequest;
import com.nilev.user.dto.UserDto;
import com.nilev.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping({"/api/v1/users", "/api/users"})
public class UserController {

    private final UserService userService;
    private final PartnerConnectionRepository partnerConnectionRepo;

    public UserController(UserService userService, PartnerConnectionRepository partnerConnectionRepo) {
        this.userService = userService;
        this.partnerConnectionRepo = partnerConnectionRepo;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserDto userDto = userService.getCurrentUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> updateCurrentUser(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateUserRequest request) {
        UserDto userDto = userService.updateUser(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", userDto));
    }

    @PostMapping(value = "/me/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> updateProfilePicture(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        UserDto userDto = userService.updateProfilePicture(currentUser.getId(), file);
        return ResponseEntity.ok(ApiResponse.success("Profile picture updated successfully", userDto));
    }

    @DeleteMapping("/me/profile-picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> removeProfilePicture(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserDto userDto = userService.removeProfilePicture(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile picture removed successfully", userDto));
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody DeleteAccountRequest request) {
        userService.deleteUserAccount(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Account permanently deleted", null));
    }

    @GetMapping("/avatar/{filename}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<byte[]> getAvatar(@PathVariable String filename) {
        byte[] image = userService.getAvatarImage(filename);
        String contentType = userService.getAvatarContentType(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(image);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long currentUserId = currentUser.getId();
        if (!currentUserId.equals(id)) {
            boolean isPartner = partnerConnectionRepo.findActiveConnectionForUser(currentUserId)
                    .map(conn -> {
                        Long u1 = conn.getUser1().getId();
                        Long u2 = conn.getUser2().getId();
                        Long partnerId = currentUserId.equals(u1) ? u2 : u1;
                        return id.equals(partnerId);
                    })
                    .orElse(false);

            if (!isPartner) {
                throw new NilevApiException("Access denied: You can only view your own profile or your connected partner's profile", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
            }
        }

        UserDto userDto = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }
}
