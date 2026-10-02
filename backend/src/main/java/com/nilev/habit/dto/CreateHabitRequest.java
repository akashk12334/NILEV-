package com.nilev.habit.dto;

import com.nilev.habit.entity.HabitFrequency;
import com.nilev.habit.entity.HabitTimeOfDay;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateHabitRequest {

    @NotBlank(message = "Habit name is required")
    @Size(max = 120, message = "Habit name must be at most 120 characters")
    private String name;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    @Size(max = 10)
    private String icon = "⭐";

    @Size(max = 60)
    private String category = "General";

    @Size(max = 10)
    private String color = "#8B5CF6";

    private HabitFrequency frequency = HabitFrequency.DAILY;
    private HabitTimeOfDay timeOfDay = HabitTimeOfDay.ANYTIME;

    private LocalDate startDate;
    private LocalDate endDate;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public HabitFrequency getFrequency() { return frequency; }
    public void setFrequency(HabitFrequency frequency) { this.frequency = frequency; }

    public HabitTimeOfDay getTimeOfDay() { return timeOfDay; }
    public void setTimeOfDay(HabitTimeOfDay timeOfDay) { this.timeOfDay = timeOfDay; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
