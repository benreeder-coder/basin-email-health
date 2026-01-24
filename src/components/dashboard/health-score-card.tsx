"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HealthScoreCardProps {
  score: number;
  label: string;
  sublabel?: string;
}

function getHealthColor(score: number): string {
  if (score >= 80) return "text-health-excellent";
  if (score >= 60) return "text-health-good";
  if (score >= 40) return "text-health-warning";
  if (score >= 20) return "text-health-poor";
  return "text-health-critical";
}

function getHealthBg(score: number): string {
  if (score >= 80) return "border-l-[#22C55E]";
  if (score >= 60) return "border-l-[#84CC16]";
  if (score >= 40) return "border-l-[#EAB308]";
  if (score >= 20) return "border-l-[#F97316]";
  return "border-l-[#EF4444]";
}

export function HealthScoreCard({
  score,
  label,
  sublabel,
}: HealthScoreCardProps) {
  return (
    <Card className={`border-l-4 ${getHealthBg(score)} bg-[#1a1a1a] border-white/10`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getHealthColor(score)}`}>
          {score}%
        </div>
        {sublabel && (
          <p className="text-xs text-gray-600 mt-1">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
