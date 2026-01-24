"use client";

import { useState } from "react";
import { CampaignAnalytics } from "@/lib/types";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CampaignAnalyticsDashboard } from "./campaign-analytics";
import { BarChart3, Table } from "lucide-react";

const STATUS_COLORS: Record<number, string> = {
  0: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  1: "bg-health-excellent/20 text-health-excellent border-health-excellent/30",
  2: "bg-health-warning/20 text-health-warning border-health-warning/30",
  3: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const campaignColumns: ColumnDef<CampaignAnalytics>[] = [
  {
    accessorKey: "campaign_name",
    header: "Campaign",
    cell: ({ row }) => (
      <span className="font-medium text-white">{row.getValue("campaign_name")}</span>
    ),
  },
  {
    accessorKey: "campaign_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("campaign_status") as number;
      const statusMap: Record<number, string> = {
        0: "Draft",
        1: "Active",
        2: "Paused",
        3: "Completed",
      };
      return (
        <Badge
          variant="outline"
          className={`${STATUS_COLORS[status] || STATUS_COLORS[0]} border`}
        >
          {statusMap[status] || "Unknown"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "emails_sent_count",
    header: "Sent",
    cell: ({ row }) => (
      <span className="text-gray-300">
        {(row.getValue("emails_sent_count") as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "leads_count",
    header: "Leads",
    cell: ({ row }) => (
      <span className="text-gray-300">
        {(row.getValue("leads_count") as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "reply_count_unique",
    header: "Replies",
    cell: ({ row }) => (
      <span className="text-gray-300">
        {(row.getValue("reply_count_unique") as number).toLocaleString()}
      </span>
    ),
  },
  {
    id: "reply_rate",
    header: "Reply %",
    cell: ({ row }) => {
      const replies = row.original.reply_count_unique;
      const sent = row.original.emails_sent_count;
      const rate = sent > 0 ? ((replies / sent) * 100).toFixed(1) : "0";
      const rateNum = parseFloat(rate);
      const colorClass = rateNum >= 5 ? "text-health-excellent" : rateNum >= 2 ? "text-health-good" : "text-gray-400";
      return <span className={`font-medium ${colorClass}`}>{rate}%</span>;
    },
  },
  {
    id: "positive_rate",
    header: "Positive %",
    cell: ({ row }) => {
      // Positive rate based on replies vs opens (engaged users who replied)
      const replies = row.original.reply_count_unique;
      const opens = row.original.open_count_unique;
      const rate = opens > 0 ? ((replies / opens) * 100).toFixed(1) : "0";
      const rateNum = parseFloat(rate);
      const colorClass = rateNum >= 20 ? "text-health-excellent" : rateNum >= 10 ? "text-health-good" : "text-cyan-400";
      return <span className={`font-medium ${colorClass}`}>{rate}%</span>;
    },
  },
  {
    id: "bounce_rate",
    header: "Bounce %",
    cell: ({ row }) => {
      const bounced = row.original.bounced_count;
      const sent = row.original.emails_sent_count;
      const rate = sent > 0 ? ((bounced / sent) * 100).toFixed(1) : "0";
      const rateNum = parseFloat(rate);
      const colorClass = rateNum > 5 ? "text-health-critical" : rateNum > 2 ? "text-health-warning" : "text-health-good";
      return <span className={`font-medium ${colorClass}`}>{rate}%</span>;
    },
  },
  {
    accessorKey: "total_opportunities",
    header: "Opps",
    cell: ({ row }) => (
      <span className="text-purple-400 font-medium">
        {(row.getValue("total_opportunities") as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "total_opportunity_value",
    header: "Value",
    cell: ({ row }) => {
      const value = row.getValue("total_opportunity_value") as number;
      const formatted = value >= 1000000
        ? `$${(value / 1000000).toFixed(1)}M`
        : value >= 1000
        ? `$${(value / 1000).toFixed(0)}K`
        : `$${value.toLocaleString()}`;
      return <span className="text-health-excellent font-medium">{formatted}</span>;
    },
  },
];

interface CampaignsTabProps {
  campaigns: CampaignAnalytics[];
}

export function CampaignsTab({ campaigns }: CampaignsTabProps) {
  const [view, setView] = useState<"charts" | "table">("charts");

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Campaign Analytics</h2>
        <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setView("charts")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              view === "charts"
                ? "bg-basin-red text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Charts
          </button>
          <button
            onClick={() => setView("table")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              view === "table"
                ? "bg-basin-red text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Table className="w-4 h-4" />
            Table
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {view === "charts" && <CampaignAnalyticsDashboard campaigns={campaigns} />}

      {/* Data Table */}
      {view === "table" && <DataTable columns={campaignColumns} data={campaigns} />}
    </div>
  );
}
