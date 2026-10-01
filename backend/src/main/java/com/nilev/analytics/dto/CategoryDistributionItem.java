package com.nilev.analytics.dto;

public class CategoryDistributionItem {
    private String category;
    private int count;
    private int completions;
    private double percentage;
    private String color;

    public CategoryDistributionItem() {}

    public CategoryDistributionItem(String category, int count, int completions, double percentage, String color) {
        this.category = category;
        this.count = count;
        this.completions = completions;
        this.percentage = Math.round(percentage * 10.0) / 10.0;
        this.color = color;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public int getCompletions() { return completions; }
    public void setCompletions(int completions) { this.completions = completions; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
