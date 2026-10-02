package com.nilev.habit.dto;

import java.util.ArrayList;
import java.util.List;

public class TodayHabitSummaryResponse {

    private boolean partnerConnected;
    private String partnerName;
    private String partnerNickname;

    private int userCompletedCount;
    private int userTotalCount;
    private int userPercentage;

    private int partnerCompletedCount;
    private int partnerTotalCount;
    private int partnerPercentage;

    private int sharedCompletedCount;
    private int sharedTotalCount;
    private int sharedPercentage;

    private List<HabitResponse> userHabits = new ArrayList<>();
    private List<HabitResponse> partnerHabits = new ArrayList<>();

    public TodayHabitSummaryResponse() {}

    public boolean isPartnerConnected() { return partnerConnected; }
    public void setPartnerConnected(boolean partnerConnected) { this.partnerConnected = partnerConnected; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

    public String getPartnerNickname() { return partnerNickname; }
    public void setPartnerNickname(String partnerNickname) { this.partnerNickname = partnerNickname; }

    public int getUserCompletedCount() { return userCompletedCount; }
    public void setUserCompletedCount(int userCompletedCount) { this.userCompletedCount = userCompletedCount; }

    public int getUserTotalCount() { return userTotalCount; }
    public void setUserTotalCount(int userTotalCount) { this.userTotalCount = userTotalCount; }

    public int getUserPercentage() { return userPercentage; }
    public void setUserPercentage(int userPercentage) { this.userPercentage = userPercentage; }

    public int getPartnerCompletedCount() { return partnerCompletedCount; }
    public void setPartnerCompletedCount(int partnerCompletedCount) { this.partnerCompletedCount = partnerCompletedCount; }

    public int getPartnerTotalCount() { return partnerTotalCount; }
    public void setPartnerTotalCount(int partnerTotalCount) { this.partnerTotalCount = partnerTotalCount; }

    public int getPartnerPercentage() { return partnerPercentage; }
    public void setPartnerPercentage(int partnerPercentage) { this.partnerPercentage = partnerPercentage; }

    public int getSharedCompletedCount() { return sharedCompletedCount; }
    public void setSharedCompletedCount(int sharedCompletedCount) { this.sharedCompletedCount = sharedCompletedCount; }

    public int getSharedTotalCount() { return sharedTotalCount; }
    public void setSharedTotalCount(int sharedTotalCount) { this.sharedTotalCount = sharedTotalCount; }

    public int getSharedPercentage() { return sharedPercentage; }
    public void setSharedPercentage(int sharedPercentage) { this.sharedPercentage = sharedPercentage; }

    public List<HabitResponse> getUserHabits() { return userHabits; }
    public void setUserHabits(List<HabitResponse> userHabits) { this.userHabits = userHabits; }

    public List<HabitResponse> getPartnerHabits() { return partnerHabits; }
    public void setPartnerHabits(List<HabitResponse> partnerHabits) { this.partnerHabits = partnerHabits; }
}
