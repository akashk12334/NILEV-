package com.nilev.habit.dto;

import com.nilev.habit.entity.HabitFrequency;
import com.nilev.habit.entity.HabitTimeOfDay;
import jakarta.validation.constraints.Size;

public class UpdateHabitRequest {

    @Size(max = 120)
    private String name;

    @Size(max = 500)
    private String description;

    @Size(max = 10)
    private String icon;

    @Size(max = 60)
    private String category;

    @Size(max = 10)
    private String color;

    private HabitFrequency frequency;
    private HabitTimeOfDay timeOfDay;
    private Boolean active;

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

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
