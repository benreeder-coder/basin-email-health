"use client";

import { useState } from "react";
import { DomainHealth, EmailAccount } from "@/lib/types";
import { StatCard } from "./stat-card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Globe,
  Users,
  Zap,
  Mail,
  Activity,
} from "lucide-react";

function getHealthColor(score: number): string {
  if (score >= 80) return "text-health-excellent";
  if (score >= 60) return "text-health-good";
  if (score >= 40) return "text-health-warning";
  if (score >= 20) return "text-health-poor";
  return "text-health-critical";
}

function getHealthBg(score: number): string {
  if (score >= 80) return "bg-health-excellent";
  if (score >= 60) return "bg-health-good";
  if (score >= 40) return "bg-health-warning";
  if (score >= 20) return "bg-health-poor";
  return "bg-health-critical";
}

function getHealthGlow(score: number): string {
  if (score >= 80) return "shadow-[0_0_20px_rgba(34,197,94,0.3)]";
  if (score >= 60) return "shadow-[0_0_20px_rgba(132,204,22,0.3)]";
  if (score >= 40) return "shadow-[0_0_20px_rgba(234,179,8,0.3)]";
  if (score >= 20) return "shadow-[0_0_20px_rgba(249,115,22,0.3)]";
  return "shadow-[0_0_20px_rgba(239,68,68,0.3)]";
}

function AccountCard({ account, index }: { account: EmailAccount; index: number }) {
  const score = account.stat_warmup_score || 0;

  return (
    <div
      className="account-card-animate bg-[#1a1a1a] rounded-lg p-4 border border-white/5 hover:border-white/10 transition-all duration-200"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${getHealthBg(score)} flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">{score}</span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">{account.email}</p>
            <p className="text-gray-500 text-xs">
              {account.first_name} {account.last_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Status</p>
            <Badge
              variant="outline"
              className={`text-xs ${account.status === 1 ? 'border-health-excellent text-health-excellent' : 'border-gray-600 text-gray-400'}`}
            >
              {account.status === 1 ? "Active" : "Paused"}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Warmup</p>
            <Badge
              variant="outline"
              className={`text-xs ${account.warmup_status === 1 ? 'border-basin-red text-basin-red' : 'border-gray-600 text-gray-400'}`}
            >
              {account.warmup_status === 1 ? "On" : "Off"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function DomainCard({ domain }: { domain: DomainHealth }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const avgScore = Math.round(domain.averageHealthScore);

  return (
    <div className={`domain-card glow-effect bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden ${isExpanded ? getHealthGlow(avgScore) : ''}`}>
      {/* Domain Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
      >
        <div className="flex items-center gap-4">
          {/* Health Score Circle */}
          <div className={`relative w-16 h-16 rounded-full ${getHealthBg(avgScore)} flex items-center justify-center ${avgScore >= 80 ? 'health-pulse-excellent' : ''}`}>
            <span className="text-white text-xl font-bold">{avgScore}</span>
            <div className="absolute inset-0 rounded-full border-2 border-white/20" />
          </div>

          {/* Domain Info */}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-basin-red" />
              <h3 className="text-white font-semibold text-lg">{domain.domain}</h3>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {domain.accountCount} account{domain.accountCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm">{domain.activeAccounts} active</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
            <Zap className="w-4 h-4 text-basin-red" />
            <span className="text-gray-300 text-sm">{domain.warmupEnabled} warming</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expandable Content */}
      <div className={`domain-expand-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="domain-expand-inner">
          <div className="px-6 pb-6 pt-2 border-t border-white/5">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-gray-500" />
              <h4 className="text-gray-400 text-sm font-medium">Email Accounts</h4>
            </div>

            {/* Account Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {domain.accounts.map((account, index) => (
                <AccountCard
                  key={account.email}
                  account={account}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DomainsTabProps {
  domains: DomainHealth[];
}

export function DomainsTab({ domains }: DomainsTabProps) {
  const totalAccounts = domains.reduce((sum, d) => sum + d.accountCount, 0);
  const totalWarmup = domains.reduce((sum, d) => sum + d.warmupEnabled, 0);
  const avgHealthAcrossDomains =
    domains.length > 0
      ? Math.round(
          domains.reduce((sum, d) => sum + d.averageHealthScore, 0) /
            domains.length
        )
      : 0;

  // Sort domains by health score (lowest first for attention)
  const sortedDomains = [...domains].sort(
    (a, b) => a.averageHealthScore - b.averageHealthScore
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-basin-red/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-basin-red" />
            </div>
            <span className="text-gray-500 text-sm">Total Domains</span>
          </div>
          <p className="text-3xl font-bold text-white">{domains.length}</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-500 text-sm">Total Accounts</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalAccounts}</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-gray-500 text-sm">Warmup Active</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalWarmup}</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg ${avgHealthAcrossDomains >= 80 ? 'bg-health-excellent/20' : avgHealthAcrossDomains >= 60 ? 'bg-health-good/20' : 'bg-health-warning/20'} flex items-center justify-center`}>
              <Activity className={`w-5 h-5 ${getHealthColor(avgHealthAcrossDomains)}`} />
            </div>
            <span className="text-gray-500 text-sm">Avg Health</span>
          </div>
          <p className={`text-3xl font-bold ${getHealthColor(avgHealthAcrossDomains)}`}>
            {avgHealthAcrossDomains}%
          </p>
        </div>
      </div>

      {/* Domain Cards */}
      <div className="space-y-4">
        {sortedDomains.map((domain) => (
          <DomainCard key={domain.domain} domain={domain} />
        ))}
      </div>

      {/* Empty State */}
      {domains.length === 0 && (
        <div className="text-center py-12 bg-[#1a1a1a] rounded-2xl border border-white/10">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-gray-400 font-medium mb-2">No domains yet</h3>
          <p className="text-gray-600 text-sm">
            Domain data will appear here once email accounts are synced
          </p>
        </div>
      )}
    </div>
  );
}
