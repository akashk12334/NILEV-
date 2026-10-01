import React from "react";
import type { Habit } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Flame } from "lucide-react";

export interface HabitCardProps {
  habit: Habit;
  onToggleCheckIn?: (habitId: number) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggleCheckIn }) => {
  return (
    <Card className="hover:border-slate-700 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{habit.title}</CardTitle>
        <Badge variant={habit.isShared ? "default" : "secondary"}>
          {habit.isShared ? "Shared" : "Personal"}
        </Badge>
      </CardHeader>
      <CardContent>
        {habit.description && (
          <p className="text-sm text-slate-400 mb-3">{habit.description}</p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <Flame className="h-4 w-4 text-orange-400" />
            <span>Streak: {habit.streakCount} days</span>
          </div>
          {onToggleCheckIn && (
            <button
              onClick={() => onToggleCheckIn(habit.id)}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Check in
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
