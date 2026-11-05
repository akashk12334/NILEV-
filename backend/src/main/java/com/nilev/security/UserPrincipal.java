package com.nilev.security;

import com.nilev.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String name;
    private final String email;
    private final String passwordHash;
    private final boolean active;
    private final String role;
    private final java.time.Instant passwordChangedAt;

    public UserPrincipal(Long id, String name, String email, String passwordHash, boolean active, String role) {
        this(id, name, email, passwordHash, active, role, null);
    }

    public UserPrincipal(Long id, String name, String email, String passwordHash, boolean active, String role, java.time.Instant passwordChangedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.active = active;
        this.role = role != null ? role : "USER";
        this.passwordChangedAt = passwordChangedAt;
    }

    public static UserPrincipal create(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.isActive(),
                user.getRole(),
                user.getPasswordChangedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public java.time.Instant getPasswordChangedAt() {
        return passwordChangedAt;
    }

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String cleanRole = (role != null && !role.isBlank()) ? role.trim().toUpperCase() : "USER";
        String authority = cleanRole.startsWith("ROLE_") ? cleanRole : "ROLE_" + cleanRole;
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private String email;
        private String passwordHash;
        private boolean active = true;
        private String role = "USER";

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }

        public Builder password(String password) {
            this.passwordHash = password;
            return this;
        }

        public Builder active(boolean active) {
            this.active = active;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public UserPrincipal build() {
            return new UserPrincipal(id, name, email, passwordHash, active, role);
        }
    }
}
