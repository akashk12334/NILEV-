package com.nilev.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilev.common.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String errorCode = (String) request.getAttribute("jwt_error_code");
        String errorMessage = (String) request.getAttribute("jwt_error_message");
        Integer errorStatus = (Integer) request.getAttribute("jwt_error_status");

        if (errorCode == null) {
            errorCode = "UNAUTHORIZED";
            errorMessage = "Full authentication is required to access this resource";
            errorStatus = HttpServletResponse.SC_UNAUTHORIZED;
        }

        if (errorStatus == null) {
            errorStatus = HttpServletResponse.SC_UNAUTHORIZED;
        }

        response.setStatus(errorStatus);

        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .success(false)
                .status(errorStatus)
                .errorCode(errorCode)
                .message(errorMessage)
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        response.getOutputStream().println(objectMapper.writeValueAsString(errorResponse));
    }
}
