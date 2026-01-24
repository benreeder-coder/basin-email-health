"use client";

import { useState, useMemo } from "react";
import { CampaignAnalytics } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Filter,
  TrendingUp,
  Mail,
  MessageSquare,
  DollarSign,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

interface CampaignAnalyticsProps {
  campaigns: CampaignAnalytics[];
}

const COLORS = {
  primary: "#E31B54",
  secondary: "#3B82F6",
  success: "#22C55E",
  warning: "#EAB308",
  danger: "#EF4444",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  orange: "#F97316",
};

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: "Draft", color: "#6B7280" },
  1: { label: "Active", color: "#22C55E" },
  2: { label: "Paused", color: "#EAB308" },
  3: { label: "Completed", color: "#3B82F6" },
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          {entry.name.includes("%") || entry.name.includes("Rate") ? "%" : ""}
        </p>
      ))}
    </div>
  );
}

export function CampaignAnalyticsDashboard({ campaigns }: CampaignAnalyticsProps) {
  const [selectedStatus, setSelectedStatus] = useState<number | "all">("all");
  const [selectedMetric, setSelectedMetric] = useState<"performance" | "engagement" | "value">("performance");

  // Filter campaigns based on status
  const filteredCampaigns = useMemo(() => {
    if (selectedStatus === "all") return campaigns;
    return campaigns.filter((c) => c.campaign_status === selectedStatus);
  }, [campaigns, selectedStatus]);

  // Calculate aggregate metrics
  const metrics = useMemo(() => {
    const total = filteredCampaigns.reduce(
      (acc, c) => ({
        sent: acc.sent + c.emails_sent_count,
        leads: acc.leads + c.leads_count,
        replies: acc.replies + c.reply_count_unique,
        bounced: acc.bounced + c.bounced_count,
        opps: acc.opps + c.total_opportunities,
        value: acc.value + c.total_opportunity_value,
      }),
      { sent: 0, leads: 0, replies: 0, bounced: 0, opps: 0, value: 0 }
    );

    return {
      ...total,
      replyRate: total.sent > 0 ? ((total.replies / total.sent) * 100).toFixed(1) : "0",
      bounceRate: total.sent > 0 ? ((total.bounced / total.sent) * 100).toFixed(1) : "0",
    };
  }, [filteredCampaigns]);

  // Prepare chart data
  const barChartData = useMemo(() => {
    return filteredCampaigns.map((c) => ({
      name: c.campaign_name.length > 15 ? c.campaign_name.substring(0, 15) + "..." : c.campaign_name,
      fullName: c.campaign_name,
      sent: c.emails_sent_count,
      leads: c.leads_count,
      replies: c.reply_count_unique,
      bounced: c.bounced_count,
      replyRate: c.emails_sent_count > 0 ? parseFloat(((c.reply_count_unique / c.emails_sent_count) * 100).toFixed(1)) : 0,
      bounceRate: c.emails_sent_count > 0 ? parseFloat(((c.bounced_count / c.emails_sent_count) * 100).toFixed(1)) : 0,
      opps: c.total_opportunities,
      value: c.total_opportunity_value,
    }));
  }, [filteredCampaigns]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    campaigns.forEach((c) => {
      counts[c.campaign_status] = (counts[c.campaign_status] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: STATUS_MAP[Number(status)].label,
        value: count,
        color: STATUS_MAP[Number(status)].color,
      }));
  }, [campaigns]);

  // Funnel data
  const funnelData = useMemo(() => [
    { name: "Sent", value: metrics.sent, fill: COLORS.primary },
    { name: "Replies", value: metrics.replies, fill: COLORS.success },
    { name: "Opportunities", value: metrics.opps, fill: COLORS.purple },
  ], [metrics]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedStatus === "all"
                ? "bg-basin-red text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            All Status
          </button>
          {Object.entries(STATUS_MAP).map(([status, { label, color }]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(Number(status))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedStatus === Number(status)
                  ? "bg-basin-red text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </button>
          ))}
        </div>

        {/* Metric View Filter */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setSelectedMetric("performance")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedMetric === "performance"
                ? "bg-white/10 text-white"
                : "bg-white/5 text-gray-500 hover:bg-white/10"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Performance
          </button>
          <button
            onClick={() => setSelectedMetric("engagement")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedMetric === "engagement"
                ? "bg-white/10 text-white"
                : "bg-white/5 text-gray-500 hover:bg-white/10"
            }`}
          >
            <Activity className="w-4 h-4" />
            Engagement
          </button>
          <button
            onClick={() => setSelectedMetric("value")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedMetric === "value"
                ? "bg-white/10 text-white"
                : "bg-white/5 text-gray-500 hover:bg-white/10"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Value
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-basin-red" />
            <span className="text-xs text-gray-500">Emails Sent</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.sent.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-500">Total Leads</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.leads.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-500">Total Replies</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.replies.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-health-good" />
            <span className="text-xs text-gray-500">Reply Rate</span>
          </div>
          <p className="text-2xl font-bold text-health-good">{metrics.replyRate}%</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-500">Opportunities</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{metrics.opps}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-health-excellent" />
            <span className="text-xs text-gray-500">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-health-excellent">
            ${(metrics.value / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Main Performance Chart */}
        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10 col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-basin-red" />
            {selectedMetric === "performance" && "Campaign Performance Overview"}
            {selectedMetric === "engagement" && "Engagement Rates by Campaign"}
            {selectedMetric === "value" && "Campaign Value & Opportunities"}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {selectedMetric === "performance" ? (
                <BarChart data={barChartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="sent" name="Sent" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leads" name="Leads" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="replies" name="Replies" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : selectedMetric === "engagement" ? (
                <BarChart data={barChartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="replyRate" name="Reply Rate" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bounceRate" name="Bounce Rate" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={barChartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar yAxisId="left" dataKey="opps" name="Opportunities" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="value" name="Value ($)" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-basin-red" />
            Conversion Funnel
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#9CA3AF", fontSize: 12 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-basin-red" />
            Campaign Status Distribution
          </h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {statusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-400">{entry.name}</span>
                  <span className="text-sm font-medium text-white ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bounce Rate Bar Chart */}
        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10 col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-basin-red" />
            Bounce Rate Analysis
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bounceRate" name="Bounce Rate" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
