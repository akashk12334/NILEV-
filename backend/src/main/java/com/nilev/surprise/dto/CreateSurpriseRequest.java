package com.nilev.surprise.dto;

import com.nilev.surprise.entity.SurpriseType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class CreateSurpriseRequest {

    @NotNull(message = "Surprise type is required")
    private SurpriseType type = SurpriseType.MESSAGE;

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    @NotBlank(message = "Content cannot be blank")
    private String content;

    @Size(max = 500, message = "Media URL must not exceed 500 characters")
    private String mediaUrl;

    private LocalDateTime scheduledAt;

    private Boolean isDraft = false;

    public CreateSurpriseRequest() {}

    public SurpriseType getType() { return type; }
    public void setType(SurpriseType type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public Boolean getIsDraft() { return isDraft; }
    public void setIsDraft(Boolean isDraft) { this.isDraft = isDraft; }
}
