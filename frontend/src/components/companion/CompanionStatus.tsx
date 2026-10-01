import React from "react";
import type { Companion } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Sparkles, Heart } from "lucide-react";

export interface CompanionStatusProps {
  companion?: Companion | null;
}

export const CompanionStatus: React.FC<CompanionStatusProps> = ({ companion }) => {
  return (
    <Card className="border-indigo-900/50 bg-gradient-to-br from-slate-900 to-indigo-950/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Virtual Companion</span>
        </CardTitle>
        <span className="text-xs text-indigo-400 font-medium">
          Level {companion?.level ?? 1}
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-2xl">
            🌱
          </div>
          <div>
            <h4 className="font-semibold text-white">
              {companion?.name ?? "Nilev Companion"}
            </h4>
            <div className="flex items-center space-x-1 text-xs text-slate-400 mt-1">
              <Heart className="h-3 w-3 text-pink-400 fill-pink-400" />
              <span>Affinity: {companion?.happinessScore ?? 100}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
