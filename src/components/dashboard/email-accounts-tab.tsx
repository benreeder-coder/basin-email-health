"use client";

import { EmailAccount } from "@/lib/types";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { HealthScoreCard } from "./health-score-card";
import { StatCard } from "./stat-card";

function getHealthBadge(score: number) {
  if (score >= 80)
    return (
      <Badge className="bg-health-excellent hover:bg-health-excellent text-white">
        {score}%
      </Badge>
    );
  if (score >= 60)
    return (
      <Badge className="bg-health-good hover:bg-health-good text-white">
        {score}%
      </Badge>
    );
  if (score >= 40)
    return (
      <Badge className="bg-health-warning hover:bg-health-warning text-white">
        {score}%
      </Badge>
    );
  if (score >= 20)
    return (
      <Badge className="bg-health-poor hover:bg-health-poor text-white">
        {score}%
      </Badge>
    );
  return (
    <Badge className="bg-health-critical hover:bg-health-critical text-white">
      {score}%
    </Badge>
  );
}

const accountColumns: ColumnDef<EmailAccount>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="font-medium text-white">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "first_name",
    header: "Name",
    cell: ({ row }) =>
      `${row.original.first_name || ""} ${row.original.last_name || ""}`.trim() ||
      "-",
  },
  {
    accessorKey: "stat_warmup_score",
    header: "Health Score",
    cell: ({ row }) =>
      getHealthBadge((row.getValue("stat_warmup_score") as number) || 0),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === 1 ? "default" : "secondary"}>
        {row.getValue("status") === 1 ? "Active" : "Paused"}
      </Badge>
    ),
  },
  {
    accessorKey: "warmup_status",
    header: "Warmup",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("warmup_status") === 1 ? "default" : "secondary"}
      >
        {row.getValue("warmup_status") === 1 ? "Enabled" : "Disabled"}
      </Badge>
    ),
  },
  {
    accessorKey: "daily_limit",
    header: "Daily Limit",
  },
  {
    accessorKey: "tracking_domain_name",
    header: "Tracking Domain",
    cell: ({ row }) => row.getValue("tracking_domain_name") || "-",
  },
  {
    accessorKey: "timestamp_last_used",
    header: "Last Used",
    cell: ({ row }) => {
      const timestamp = row.getValue("timestamp_last_used") as string;
      return timestamp ? new Date(timestamp).toLocaleDateString() : "-";
    },
  },
];

interface EmailAccountsTabProps {
  accounts: EmailAccount[];
}

export function EmailAccountsTab({ accounts }: EmailAccountsTabProps) {
  const avgHealth =
    accounts.length > 0
      ? Math.round(
          accounts.reduce((sum, a) => sum + (a.stat_warmup_score || 0), 0) /
            accounts.length
        )
      : 0;

  const activeCount = accounts.filter((a) => a.status === 1).length;
  const warmupCount = accounts.filter((a) => a.warmup_status === 1).length;
  const criticalCount = accounts.filter(
    (a) => (a.stat_warmup_score || 0) < 50
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <HealthScoreCard
          score={avgHealth}
          label="Average Health Score"
          sublabel={`Across ${accounts.length} accounts`}
        />
        <StatCard title="Active Accounts" value={activeCount} />
        <StatCard title="Warmup Enabled" value={warmupCount} />
        <StatCard
          title="Needs Attention"
          value={criticalCount}
          className={criticalCount > 0 ? "border-l-4 border-l-[#EAB308]" : ""}
        />
      </div>

      <DataTable columns={accountColumns} data={accounts} />
    </div>
  );
}
