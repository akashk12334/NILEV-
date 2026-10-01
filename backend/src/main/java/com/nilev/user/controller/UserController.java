package com.nilev.user.controller;

import com.nilev.common.ApiResponse;
import com.nilev.exception.NilevApiException;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.security.UserPrincipal;
import com.nilev.user.dto.UserDto;
import com.nilev.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/users", "/api/users"})
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserService userService;
    private final PartnerConnectionRepository partnerConnectionRepo;

    public UserController(UserService userService, PartnerConnectionRepository partnerConnectionRepo) {
        this.userService = userService;
        this.partnerConnectionRepo = partnerConnectionRepo;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserDto userDto = userService.getCurrentUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }

    @GetMapping("/{id}")
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
