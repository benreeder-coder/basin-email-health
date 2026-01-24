"use client";

import { Alert as AlertType } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { StatCard } from "./stat-card";

interface AlertsTabProps {
  alerts: AlertType[];
}

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    className: "border-l-4 border-l-[#EF4444] bg-red-500/10 border-white/5",
    iconClassName: "text-health-critical",
  },
  warning: {
    icon: AlertCircle,
    className: "border-l-4 border-l-[#EAB308] bg-yellow-500/10 border-white/5",
    iconClassName: "text-health-warning",
  },
  info: {
    icon: Info,
    className: "border-l-4 border-l-blue-500 bg-blue-500/10 border-white/5",
    iconClassName: "text-blue-400",
  },
};

export function AlertsTab({ alerts }: AlertsTabProps) {
  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;
  const infoCount = alerts.filter((a) => a.type === "info").length;

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-[#1a1a1a] rounded-2xl border border-white/10">
        <div className="rounded-full bg-health-excellent/20 p-4 mb-4">
          <CheckCircle2 className="h-8 w-8 text-health-excellent" />
        </div>
        <h3 className="text-lg font-semibold text-white">No Alerts</h3>
        <p className="text-gray-500 mt-1">
          All email accounts and campaigns are performing well.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Critical"
          value={criticalCount}
          className={
            criticalCount > 0 ? "border-l-4 border-l-[#EF4444]" : ""
          }
        />
        <StatCard
          title="Warnings"
          value={warningCount}
          className={
            warningCount > 0 ? "border-l-4 border-l-[#EAB308]" : ""
          }
        />
        <StatCard
          title="Info"
          value={infoCount}
          className={infoCount > 0 ? "border-l-4 border-l-blue-500" : ""}
        />
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;

          return (
            <Alert key={alert.id} className={config.className}>
              <Icon className={`h-4 w-4 ${config.iconClassName}`} />
              <AlertTitle className="font-semibold text-white">{alert.title}</AlertTitle>
              <AlertDescription className="text-gray-400">
                {alert.message}
                <span className="block text-xs text-gray-600 mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </AlertDescription>
            </Alert>
          );
        })}
      </div>
    </div>
  );
}
