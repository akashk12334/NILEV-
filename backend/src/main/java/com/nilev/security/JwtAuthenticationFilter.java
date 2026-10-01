package com.nilev.security;

import com.nilev.exception.AccountInactiveException;
import com.nilev.exception.InvalidTokenException;
import com.nilev.exception.TokenExpiredException;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, CustomUserDetailsService customUserDetailsService) {
        this.tokenProvider = tokenProvider;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String jwt = getJwtFromRequest(request);

        if (StringUtils.hasText(jwt)) {
            try {
                Claims claims = tokenProvider.validateAndParseClaims(jwt);
                String tokenType = claims.get("token_type", String.class);

                // Access tokens only for protected APIs
                if ("REFRESH".equalsIgnoreCase(tokenType)) {
                    throw new InvalidTokenException("Refresh tokens cannot be used to authenticate API requests directly");
                }

                Long userId = Long.parseLong(claims.getSubject());
                UserDetails userDetails = customUserDetailsService.loadUserById(userId);

                if (!userDetails.isEnabled()) {
                    throw new AccountInactiveException("Account is inactive or disabled");
                }

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (TokenExpiredException ex) {
                log.warn("JWT token expired on {}: {}", request.getRequestURI(), ex.getMessage());
                request.setAttribute("jwt_error_code", "TOKEN_EXPIRED");
                request.setAttribute("jwt_error_message", ex.getMessage());
                request.setAttribute("jwt_error_status", HttpServletResponse.SC_UNAUTHORIZED);
            } catch (InvalidTokenException ex) {
                log.warn("Invalid JWT on {}: {}", request.getRequestURI(), ex.getMessage());
                request.setAttribute("jwt_error_code", "INVALID_TOKEN");
                request.setAttribute("jwt_error_message", ex.getMessage());
                request.setAttribute("jwt_error_status", HttpServletResponse.SC_UNAUTHORIZED);
            } catch (AccountInactiveException ex) {
                log.warn("Inactive account accessed {}: {}", request.getRequestURI(), ex.getMessage());
                request.setAttribute("jwt_error_code", "ACCOUNT_INACTIVE");
                request.setAttribute("jwt_error_message", ex.getMessage());
                request.setAttribute("jwt_error_status", HttpServletResponse.SC_FORBIDDEN);
            } catch (Exception ex) {
                log.error("Could not set user authentication in security context", ex);
                request.setAttribute("jwt_error_code", "INVALID_TOKEN");
                request.setAttribute("jwt_error_message", "Authentication failed");
                request.setAttribute("jwt_error_status", HttpServletResponse.SC_UNAUTHORIZED);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
