import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { CheckCircle2, Flame, Heart, Sparkles } from "lucide-react";

export const DashboardMetrics: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Habit Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0 Days</div>
          <p className="text-xs text-slate-500 mt-1">Foundation initialized</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Goals Completed</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0 / 0</div>
          <p className="text-xs text-slate-500 mt-1">Ready for goals</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Shared Memories</CardTitle>
          <Heart className="h-4 w-4 text-pink-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0 Logs</div>
          <p className="text-xs text-slate-500 mt-1">Activity module ready</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Companion Affinity</CardTitle>
          <Sparkles className="h-4 w-4 text-indigo-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Level 1</div>
          <p className="text-xs text-slate-500 mt-1">Companion initialized</p>
        </CardContent>
      </Card>
    </div>
  );
};
