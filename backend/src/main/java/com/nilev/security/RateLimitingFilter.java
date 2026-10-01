package com.nilev.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nilev.common.ApiErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Sliding window rate limiting filter to protect sensitive authentication
 * and invite endpoints against brute-force and credential stuffing attacks.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    // Limit sensitive auth endpoints to 20 requests per 60 seconds per IP
    private static final int AUTH_LIMIT = 20;
    private static final long WINDOW_MS = 60_000L; // 1 minute

    private final Map<String, Deque<Long>> requestLog = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public RateLimitingFilter() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        if (isRateLimitedPath(path)) {
            String clientIp = getClientIp(request);
            long now = System.currentTimeMillis();

            synchronized (requestLog) {
                Deque<Long> timestamps = requestLog.computeIfAbsent(clientIp + ":" + path, k -> new ArrayDeque<>());

                // Evict entries older than the window
                while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MS) {
                    timestamps.pollFirst();
                }

                if (timestamps.size() >= AUTH_LIMIT) {
                    log.warn("Rate limit exceeded for client IP [{}] on path [{}] (count={})", clientIp, path, timestamps.size());

                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setHeader("Retry-After", "60");
                    response.setHeader("X-RateLimit-Limit", String.valueOf(AUTH_LIMIT));
                    response.setHeader("X-RateLimit-Remaining", "0");

                    ApiErrorResponse error = ApiErrorResponse.builder()
                            .success(false)
                            .status(HttpStatus.TOO_MANY_REQUESTS.value())
                            .errorCode("RATE_LIMIT_EXCEEDED")
                            .message("Too many requests. Rate limit of " + AUTH_LIMIT + " requests per minute exceeded. Please try again in 60 seconds.")
                            .path(path)
                            .timestamp(Instant.now())
                            .build();

                    response.getWriter().write(objectMapper.writeValueAsString(error));
                    return;
                }

                timestamps.addLast(now);
                int remaining = Math.max(0, AUTH_LIMIT - timestamps.size());
                response.setHeader("X-RateLimit-Limit", String.valueOf(AUTH_LIMIT));
                response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimitedPath(String path) {
        if (path == null) return false;
        return path.endsWith("/auth/login") ||
                path.endsWith("/auth/register") ||
                path.endsWith("/partners/invite");
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
