"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Mail,
  Calendar,
  TrendingUp,
  Clock,
  BarChart3,
  Layers,
  CalendarDays,
  CalendarRange,
} from "lucide-react";

// Campaign constants
const CAMPAIGN_START = new Date(2026, 1, 2); // Feb 2, 2026 (Monday)
const TOTAL_LEADS = 6398;
const EMAILS_PER_LEAD = 3;
const TOTAL_EMAILS = TOTAL_LEADS * EMAILS_PER_LEAD; // 19,194
const DAILY_CAPACITY = 900;

const COLORS = {
  email1: "#E31B54", // Basin red
  email2: "#3B82F6", // Blue
  email3: "#22C55E", // Green
  total: "#8B5CF6", // Purple
  cumulative: "#06B6D4", // Cyan
};

// Check if a date is a weekday (Mon-Fri)
function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

// Get the next weekday
function getNextWeekday(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  while (!isWeekday(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

// Format date for display
function formatDate(date: Date, format: "short" | "medium" | "long" = "short"): string {
  if (format === "short") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (format === "medium") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

// Get week number for grouping
function getWeekKey(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const weekNum = Math.ceil(diff / oneWeek);
  return `${date.getFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
}

// Get month key for grouping
function getMonthKey(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface DailyData {
  date: Date;
  dateStr: string;
  email1: number;
  email2: number;
  email3: number;
  total: number;
  cumulative: number;
}

interface AggregatedData {
  label: string;
  email1: number;
  email2: number;
  email3: number;
  total: number;
  cumulative: number;
}

// Generate projection data with capacity-based backlog model
// Accounts are pre-warmed, so Day 1 = full capacity (900 emails)
// Follow-ups take priority over new leads (Email 2s and 3s before Email 1s)
// If more than capacity is due, overflow carries to next day as backlog
//
// Priority order:
// 1. Backlogged follow-ups (oldest first)
// 2. Email 2s due today (from leads started on day-1)
// 3. Email 3s due today (from leads started on day-3)
// 4. New Email 1s (new leads) to fill remaining capacity
function generateProjectionData(): DailyData[] {
  const data: DailyData[] = [];

  // Pre-calculate all business days we'll need
  const MAX_DAYS = 50;
  const businessDays: Date[] = [];
  let currentDate = new Date(CAMPAIGN_START);

  for (let i = 0; i < MAX_DAYS; i++) {
    while (!isWeekday(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    businessDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Track leads started on each day (for calculating future follow-ups)
  const leadsStartedOnDay: number[] = new Array(MAX_DAYS).fill(0);

  // Track total leads started so far
  let totalLeadsStarted = 0;
  let cumulative = 0;

  // Backlog carries over from previous day (follow-ups that didn't fit)
  let backlogEmail2 = 0;
  let backlogEmail3 = 0;

  for (let dayIndex = 0; dayIndex < MAX_DAYS; dayIndex++) {
    let remainingCapacity = DAILY_CAPACITY;
    let email1Today = 0;
    let email2Today = 0;
    let email3Today = 0;

    // Priority 1: Process backlogged Email 2s first (oldest)
    if (backlogEmail2 > 0 && remainingCapacity > 0) {
      const send = Math.min(backlogEmail2, remainingCapacity);
      email2Today += send;
      backlogEmail2 -= send;
      remainingCapacity -= send;
    }

    // Priority 2: Process backlogged Email 3s
    if (backlogEmail3 > 0 && remainingCapacity > 0) {
      const send = Math.min(backlogEmail3, remainingCapacity);
      email3Today += send;
      backlogEmail3 -= send;
      remainingCapacity -= send;
    }

    // Priority 3: Email 2s due today (from leads started on day-1)
    const email2DueToday = dayIndex >= 1 ? leadsStartedOnDay[dayIndex - 1] : 0;
    if (email2DueToday > 0) {
      const send = Math.min(email2DueToday, remainingCapacity);
      email2Today += send;
      remainingCapacity -= send;
      // Overflow goes to backlog
      backlogEmail2 += (email2DueToday - send);
    }

    // Priority 4: Email 3s due today (from leads started on day-3)
    const email3DueToday = dayIndex >= 3 ? leadsStartedOnDay[dayIndex - 3] : 0;
    if (email3DueToday > 0) {
      const send = Math.min(email3DueToday, remainingCapacity);
      email3Today += send;
      remainingCapacity -= send;
      // Overflow goes to backlog
      backlogEmail3 += (email3DueToday - send);
    }

    // Priority 5: Start new leads (Email 1s) with remaining capacity
    if (remainingCapacity > 0 && totalLeadsStarted < TOTAL_LEADS) {
      const newLeads = Math.min(remainingCapacity, TOTAL_LEADS - totalLeadsStarted);
      email1Today = newLeads;
      leadsStartedOnDay[dayIndex] = newLeads;
      totalLeadsStarted += newLeads;
    }

    // Build daily data
    const total = email1Today + email2Today + email3Today;

    // Stop if nothing to send and all done
    if (total === 0 && totalLeadsStarted >= TOTAL_LEADS && backlogEmail2 === 0 && backlogEmail3 === 0) {
      break;
    }

    if (total > 0) {
      cumulative += total;
      data.push({
        date: businessDays[dayIndex],
        dateStr: formatDate(businessDays[dayIndex]),
        email1: email1Today,
        email2: email2Today,
        email3: email3Today,
        total,
        cumulative,
      });
    }

    // Stop once we've sent all emails
    if (cumulative >= TOTAL_EMAILS) break;
  }

  return data;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

type ViewMode = "sequence" | "total";
type TimeGrouping = "daily" | "weekly" | "monthly";

export function SendProjectionTab() {
  const [viewMode, setViewMode] = useState<ViewMode>("sequence");
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>("daily");
  const [showCumulative, setShowCumulative] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: number; end: number }>({ start: 0, end: 100 });

  // Generate the projection data
  const dailyData = useMemo(() => generateProjectionData(), []);

  // Calculate campaign end date
  const endDate = dailyData[dailyData.length - 1]?.date;
  const totalWorkingDays = dailyData.length;

  // Aggregate data based on time grouping
  const aggregatedData = useMemo((): AggregatedData[] => {
    if (timeGrouping === "daily") {
      return dailyData.map((d) => ({
        label: d.dateStr,
        email1: d.email1,
        email2: d.email2,
        email3: d.email3,
        total: d.total,
        cumulative: d.cumulative,
      }));
    }

    const groups = new Map<string, AggregatedData>();

    dailyData.forEach((d) => {
      const key = timeGrouping === "weekly" ? getWeekKey(d.date) : getMonthKey(d.date);

      if (!groups.has(key)) {
        groups.set(key, {
          label: timeGrouping === "weekly"
            ? `Week of ${formatDate(d.date)}`
            : getMonthKey(d.date),
          email1: 0,
          email2: 0,
          email3: 0,
          total: 0,
          cumulative: 0,
        });
      }

      const group = groups.get(key)!;
      group.email1 += d.email1;
      group.email2 += d.email2;
      group.email3 += d.email3;
      group.total += d.total;
      group.cumulative = d.cumulative; // Take the last cumulative value
    });

    return Array.from(groups.values());
  }, [dailyData, timeGrouping]);

  // Apply date range filter
  const filteredData = useMemo(() => {
    const startIdx = Math.floor((dateRange.start / 100) * aggregatedData.length);
    const endIdx = Math.ceil((dateRange.end / 100) * aggregatedData.length);
    return aggregatedData.slice(startIdx, endIdx);
  }, [aggregatedData, dateRange]);

  return (
    <div className="space-y-6">
      {/* Header with view toggles */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-white">Send Volume Projection</h2>

        <div className="flex gap-4 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode("sequence")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === "sequence"
                  ? "bg-basin-red text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-4 h-4" />
              By Sequence
            </button>
            <button
              onClick={() => setViewMode("total")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === "total"
                  ? "bg-basin-red text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Total Volume
            </button>
          </div>

          {/* Time Grouping Toggle */}
          <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setTimeGrouping("daily")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                timeGrouping === "daily"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Daily
            </button>
            <button
              onClick={() => setTimeGrouping("weekly")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                timeGrouping === "weekly"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              Weekly
            </button>
            <button
              onClick={() => setTimeGrouping("monthly")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                timeGrouping === "monthly"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Monthly
            </button>
          </div>

          {/* Cumulative Toggle */}
          <button
            onClick={() => setShowCumulative(!showCumulative)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${
              showCumulative
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                : "bg-[#1a1a1a] text-gray-400 border-white/10 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Cumulative
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-basin-red" />
            <span className="text-xs text-gray-500">Total Emails</span>
          </div>
          <p className="text-2xl font-bold text-white">{TOTAL_EMAILS.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{TOTAL_LEADS.toLocaleString()} leads × {EMAILS_PER_LEAD} emails</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-500">Working Days</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalWorkingDays}</p>
          <p className="text-xs text-gray-500 mt-1">{DAILY_CAPACITY} emails/day</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-500">Start Date</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatDate(CAMPAIGN_START, "short")}</p>
          <p className="text-xs text-gray-500 mt-1">Monday, Feb 2, 2026</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-500">End Date</span>
          </div>
          <p className="text-2xl font-bold text-white">{endDate ? formatDate(endDate, "short") : "—"}</p>
          <p className="text-xs text-gray-500 mt-1">{endDate ? formatDate(endDate, "long") : "Calculating..."}</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-basin-red" />
          {showCumulative ? "Cumulative Send Progress" : "Email Send Schedule"}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({timeGrouping === "daily" ? "Weekdays only" : timeGrouping === "weekly" ? "By week" : "By month"})
          </span>
        </h3>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {showCumulative ? (
              <AreaChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  interval={timeGrouping === "daily" ? Math.floor(filteredData.length / 10) : 0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative Emails"
                  stroke={COLORS.cumulative}
                  fill={COLORS.cumulative}
                  fillOpacity={0.3}
                />
              </AreaChart>
            ) : viewMode === "sequence" ? (
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  interval={timeGrouping === "daily" ? Math.floor(filteredData.length / 10) : 0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
                <Bar dataKey="email1" name="Email 1" stackId="stack" fill={COLORS.email1} />
                <Bar dataKey="email2" name="Email 2" stackId="stack" fill={COLORS.email2} />
                <Bar dataKey="email3" name="Email 3" stackId="stack" fill={COLORS.email3} />
              </BarChart>
            ) : (
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  interval={timeGrouping === "daily" ? Math.floor(filteredData.length / 10) : 0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
                <Bar dataKey="total" name="Total Emails" fill={COLORS.total} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Date Range Slider */}
        <div className="mt-6 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Date Range</span>
            <span className="text-sm text-gray-500">
              {filteredData[0]?.label} - {filteredData[filteredData.length - 1]?.label}
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({
                ...prev,
                start: Math.min(Number(e.target.value), prev.end - 10)
              }))}
              className="flex-1 accent-basin-red"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({
                ...prev,
                end: Math.max(Number(e.target.value), prev.start + 10)
              }))}
              className="flex-1 accent-basin-red"
            />
          </div>
        </div>
      </div>

      {/* Email Sequence Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.email1 }} />
            <span className="text-sm font-medium text-white">Email 1 (First Touch)</span>
          </div>
          <p className="text-xl font-bold text-white">{TOTAL_LEADS.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Sent to all {TOTAL_LEADS.toLocaleString()} leads</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.email2 }} />
            <span className="text-sm font-medium text-white">Email 2 (Follow-up)</span>
          </div>
          <p className="text-xl font-bold text-white">{TOTAL_LEADS.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Sent to all {TOTAL_LEADS.toLocaleString()} leads</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.email3 }} />
            <span className="text-sm font-medium text-white">Email 3 (Final)</span>
          </div>
          <p className="text-xl font-bold text-white">{TOTAL_LEADS.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Sent to all {TOTAL_LEADS.toLocaleString()} leads</p>
        </div>
      </div>
    </div>
  );
}
