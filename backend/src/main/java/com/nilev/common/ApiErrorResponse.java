package com.nilev.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/**
 * Standard API error response envelope.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private boolean success = false;
    private int status;
    private String errorCode;
    private String message;
    private List<String> errors;
    private String path;
    private Instant timestamp = Instant.now();

    public ApiErrorResponse() {
    }

    public ApiErrorResponse(boolean success, int status, String errorCode, String message,
                            List<String> errors, String path, Instant timestamp) {
        this.success = success;
        this.status = status;
        this.errorCode = errorCode;
        this.message = message;
        this.errors = errors;
        this.path = path;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success = false;
        private int status;
        private String errorCode;
        private String message;
        private List<String> errors;
        private String path;
        private Instant timestamp = Instant.now();

        public Builder success(boolean success) {
            this.success = success;
            return this;
        }

        public Builder status(int status) {
            this.status = status;
            return this;
        }

        public Builder errorCode(String errorCode) {
            this.errorCode = errorCode;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder errors(List<String> errors) {
            this.errors = errors;
            return this;
        }

        public Builder path(String path) {
            this.path = path;
            return this;
        }

        public Builder timestamp(Instant timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public ApiErrorResponse build() {
            return new ApiErrorResponse(success, status, errorCode, message, errors, path, timestamp);
        }
    }
}
