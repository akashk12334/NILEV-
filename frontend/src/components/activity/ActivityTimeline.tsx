import React from "react";
import type { Activity } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Calendar } from "lucide-react";

export interface ActivityTimelineProps {
  activities?: Activity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities = [],
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-pink-400" />
          <span>Activity Timeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-slate-400">
            No activity logs yet. Foundation ready for activity tracking.
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-slate-800 pb-2 text-sm"
              >
                <div>
                  <span className="font-medium text-slate-200">{item.title}</span>
                  <span className="ml-2 text-xs text-slate-500">{item.category}</span>
                </div>
                <span className="text-xs text-slate-400">{item.activityDate}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
