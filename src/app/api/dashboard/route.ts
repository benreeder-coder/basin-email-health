import { NextResponse } from "next/server";
import { dashboardStore } from "@/lib/store";

export async function GET() {
  const [accounts, campaigns, domains, alerts, lastUpdated] = await Promise.all([
    dashboardStore.getAccounts(),
    dashboardStore.getCampaigns(),
    dashboardStore.getDomains(),
    dashboardStore.getAlerts(),
    dashboardStore.getLastUpdated(),
  ]);

  return NextResponse.json({
    accounts,
    campaigns,
    domains,
    alerts,
    lastUpdated,
  });
}
