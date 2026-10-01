import React from "react";
import type { Goal } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Target } from "lucide-react";

export interface GoalProgressProps {
  goal: Goal;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goal }) => {
  return (
    <Card className="hover:border-slate-700 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-indigo-400" />
          <CardTitle className="text-base font-semibold">{goal.title}</CardTitle>
        </div>
        <Badge variant={goal.completed ? "success" : "outline"}>
          {goal.completed ? "Completed" : `${goal.progressPercent}%`}
        </Badge>
      </CardHeader>
      <CardContent>
        {goal.description && (
          <p className="text-sm text-slate-400 mb-3">{goal.description}</p>
        )}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
