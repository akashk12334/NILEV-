package com.nilev.goal.dto;

public class UpdateGoalProgressRequest {

    /** Absolute new value */
    private Double currentValue;

    /** Optional increment to add to the existing currentValue */
    private Double increment;

    /** Optional comment or note about this progress log */
    private String note;

    public UpdateGoalProgressRequest() {}

    public UpdateGoalProgressRequest(Double currentValue) {
        this.currentValue = currentValue;
    }

    public Double getCurrentValue() { return currentValue; }
    public void setCurrentValue(Double currentValue) { this.currentValue = currentValue; }

    public Double getIncrement() { return increment; }
    public void setIncrement(Double increment) { this.increment = increment; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
