package com.nilev.user.dto;

import jakarta.validation.constraints.Size;

public class UpdateUserRequest {

    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String name;

    @Size(max = 50, message = "Nickname cannot exceed 50 characters")
    private String nickname;

    @Size(max = 500, message = "Profile image URL cannot exceed 500 characters")
    private String profileImageUrl;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String name, String nickname, String profileImageUrl) {
        this.name = name;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
}
