"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/header";
import { CampaignsTab } from "@/components/dashboard/campaigns-tab";
import { EmailAccountsTab } from "@/components/dashboard/email-accounts-tab";
import { DomainsTab } from "@/components/dashboard/domains-tab";
import { AlertsTab } from "@/components/dashboard/alerts-tab";
import { FullDashboardData } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<FullDashboardData>({
    accounts: [],
    campaigns: [],
    domains: [],
    alerts: [],
    lastUpdated: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const criticalAlerts = data.alerts.filter((a) => a.type === "critical").length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        lastUpdated={data.lastUpdated}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {isLoading && data.accounts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-[#1a1a1a] border border-white/10 p-1 rounded-xl">
              <TabsTrigger
                value="campaigns"
                className="rounded-lg data-[state=active]:bg-brand data-[state=active]:text-white data-[state=inactive]:text-gray-400 transition-all duration-200"
              >
                Campaigns
              </TabsTrigger>
              <TabsTrigger
                value="accounts"
                className="rounded-lg data-[state=active]:bg-brand data-[state=active]:text-white data-[state=inactive]:text-gray-400 transition-all duration-200"
              >
                Email Accounts
              </TabsTrigger>
              <TabsTrigger
                value="domains"
                className="rounded-lg data-[state=active]:bg-brand data-[state=active]:text-white data-[state=inactive]:text-gray-400 transition-all duration-200"
              >
                Domains
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="rounded-lg data-[state=active]:bg-brand data-[state=active]:text-white data-[state=inactive]:text-gray-400 transition-all duration-200 relative"
              >
                Alerts
                {criticalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-health-critical text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {criticalAlerts}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="animate-fade-in">
              <CampaignsTab campaigns={data.campaigns} />
            </TabsContent>

            <TabsContent value="accounts" className="animate-fade-in">
              <EmailAccountsTab accounts={data.accounts} />
            </TabsContent>

            <TabsContent value="domains" className="animate-fade-in">
              <DomainsTab domains={data.domains} />
            </TabsContent>

            <TabsContent value="alerts" className="animate-fade-in">
              <AlertsTab alerts={data.alerts} />
            </TabsContent>

          </Tabs>
        )}
      </main>
    </div>
  );
}
