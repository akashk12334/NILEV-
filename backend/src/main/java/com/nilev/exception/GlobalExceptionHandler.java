package com.nilev.exception;

import com.nilev.common.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NilevApiException.class)
    public ResponseEntity<ApiErrorResponse> handleNilevApiException(NilevApiException ex, HttpServletRequest request) {
        log.warn("NilevApiException [{}]: {}", ex.getErrorCode(), ex.getMessage());
        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .status(ex.getStatus().value())
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();
        return new ResponseEntity<>(response, ex.getStatus());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> errors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.add(fieldError.getField() + ": " + fieldError.getDefaultMessage());
        }

        log.warn("Validation error on {}: {}", request.getRequestURI(), errors);

        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .errorCode("VALIDATION_FAILED")
                .message("Request validation failed")
                .errors(errors)
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        List<String> errors = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .toList();

        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .errorCode("CONSTRAINT_VIOLATION")
                .message("Validation constraints violated")
                .errors(errors)
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        log.warn("Authentication failed: {}", ex.getMessage());
        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .status(HttpStatus.UNAUTHORIZED.value())
                .errorCode("INVALID_CREDENTIALS")
                .message("Invalid email or password")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(org.springframework.security.authentication.DisabledException.class)
    public ResponseEntity<ApiErrorResponse> handleDisabledException(org.springframework.security.authentication.DisabledException ex, HttpServletRequest request) {
        log.warn("Disabled account attempted login: {}", ex.getMessage());
        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .status(HttpStatus.FORBIDDEN.value())
                .errorCode("ACCOUNT_INACTIVE")
                .message("Account is inactive or disabled")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        String message = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : "You do not have permission to access this resource";

        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .status(HttpStatus.FORBIDDEN.value())
                .errorCode("ACCESS_DENIED")
                .message(message)
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        log.warn("Upload size exceeded at {}: {}", request.getRequestURI(), ex.getMessage());

        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .errorCode("FILE_TOO_LARGE")
                .message("File size exceeds the 10 MB upload limit. Please select a smaller photo.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiErrorResponse> handleMultipartException(MultipartException ex, HttpServletRequest request) {
        log.error("Multipart upload exception at {}: ", request.getRequestURI(), ex);

        String detail = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .errorCode("INVALID_MULTIPART_REQUEST")
                .message("Invalid upload request: " + (detail != null ? detail : "Malformed file upload"))
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGlobalException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: ", request.getRequestURI(), ex);

        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .errorCode("INTERNAL_SERVER_ERROR")
                .message("An unexpected error occurred. Please try again later.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
