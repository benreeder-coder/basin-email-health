import { prisma } from "./prisma";
import {
  EmailAccount,
  CampaignAnalytics,
  DashboardData,
  DomainHealth,
  Alert,
} from "./types";

// Prisma-based store for persistent data
export const dashboardStore = {
  async setAccounts(accounts: EmailAccount[]): Promise<void> {
    // Upsert all accounts (update if exists, create if not)
    for (const account of accounts) {
      await prisma.emailAccount.upsert({
        where: { email: account.email },
        update: {
          firstName: account.first_name || null,
          lastName: account.last_name || null,
          organization: account.organization || null,
          warmupStatus: account.warmup_status || 0,
          providerCode: account.provider_code || null,
          setupPending: account.setup_pending || false,
          isManagedAccount: account.is_managed_account || false,
          warmupLimit: account.warmup?.limit || null,
          warmupCustomFtag: account.warmup?.warmup_custom_ftag || null,
          warmupIncrement: account.warmup?.increment || null,
          warmupReplyRate: account.warmup?.reply_rate || null,
          addedBy: account.added_by || null,
          dailyLimit: account.daily_limit || null,
          modifiedBy: account.modified_by || null,
          trackingDomainName: account.tracking_domain_name || null,
          trackingDomainStatus: account.tracking_domain_status || null,
          status: account.status || 1,
          enableSlowRamp: account.enable_slow_ramp || false,
          inboxPlacementTestLimit: account.inbox_placement_test_limit || null,
          statWarmupScore: account.stat_warmup_score || 0,
          sendingGap: account.sending_gap || null,
          timestampCreated: account.timestamp_created ? new Date(account.timestamp_created) : null,
          timestampUpdated: account.timestamp_updated ? new Date(account.timestamp_updated) : null,
          timestampLastUsed: account.timestamp_last_used ? new Date(account.timestamp_last_used) : null,
        },
        create: {
          email: account.email,
          firstName: account.first_name || null,
          lastName: account.last_name || null,
          organization: account.organization || null,
          warmupStatus: account.warmup_status || 0,
          providerCode: account.provider_code || null,
          setupPending: account.setup_pending || false,
          isManagedAccount: account.is_managed_account || false,
          warmupLimit: account.warmup?.limit || null,
          warmupCustomFtag: account.warmup?.warmup_custom_ftag || null,
          warmupIncrement: account.warmup?.increment || null,
          warmupReplyRate: account.warmup?.reply_rate || null,
          addedBy: account.added_by || null,
          dailyLimit: account.daily_limit || null,
          modifiedBy: account.modified_by || null,
          trackingDomainName: account.tracking_domain_name || null,
          trackingDomainStatus: account.tracking_domain_status || null,
          status: account.status || 1,
          enableSlowRamp: account.enable_slow_ramp || false,
          inboxPlacementTestLimit: account.inbox_placement_test_limit || null,
          statWarmupScore: account.stat_warmup_score || 0,
          sendingGap: account.sending_gap || null,
          timestampCreated: account.timestamp_created ? new Date(account.timestamp_created) : null,
          timestampUpdated: account.timestamp_updated ? new Date(account.timestamp_updated) : null,
          timestampLastUsed: account.timestamp_last_used ? new Date(account.timestamp_last_used) : null,
        },
      });
    }
    await this.updateMetadata();
  },

  async setCampaigns(campaigns: CampaignAnalytics[]): Promise<void> {
    for (const campaign of campaigns) {
      await prisma.campaign.upsert({
        where: { campaignId: campaign.campaign_id },
        update: {
          campaignName: campaign.campaign_name,
          campaignStatus: campaign.campaign_status || 0,
          campaignIsEvergreen: campaign.campaign_is_evergreen || false,
          leadsCount: campaign.leads_count || 0,
          contactedCount: campaign.contacted_count || 0,
          openCount: campaign.open_count || 0,
          replyCount: campaign.reply_count || 0,
          linkClickCount: campaign.link_click_count || 0,
          bouncedCount: campaign.bounced_count || 0,
          unsubscribedCount: campaign.unsubscribed_count || 0,
          completedCount: campaign.completed_count || 0,
          emailsSentCount: campaign.emails_sent_count || 0,
          newLeadsContactedCount: campaign.new_leads_contacted_count || 0,
          totalOpportunities: campaign.total_opportunities || 0,
          totalOpportunityValue: campaign.total_opportunity_value || 0,
          openCountUnique: campaign.open_count_unique || 0,
          replyCountUnique: campaign.reply_count_unique || 0,
          linkClickCountUnique: campaign.link_click_count_unique || 0,
        },
        create: {
          campaignId: campaign.campaign_id,
          campaignName: campaign.campaign_name,
          campaignStatus: campaign.campaign_status || 0,
          campaignIsEvergreen: campaign.campaign_is_evergreen || false,
          leadsCount: campaign.leads_count || 0,
          contactedCount: campaign.contacted_count || 0,
          openCount: campaign.open_count || 0,
          replyCount: campaign.reply_count || 0,
          linkClickCount: campaign.link_click_count || 0,
          bouncedCount: campaign.bounced_count || 0,
          unsubscribedCount: campaign.unsubscribed_count || 0,
          completedCount: campaign.completed_count || 0,
          emailsSentCount: campaign.emails_sent_count || 0,
          newLeadsContactedCount: campaign.new_leads_contacted_count || 0,
          totalOpportunities: campaign.total_opportunities || 0,
          totalOpportunityValue: campaign.total_opportunity_value || 0,
          openCountUnique: campaign.open_count_unique || 0,
          replyCountUnique: campaign.reply_count_unique || 0,
          linkClickCountUnique: campaign.link_click_count_unique || 0,
        },
      });
    }
    await this.updateMetadata();
  },

  async updateMetadata(): Promise<void> {
    await prisma.syncMetadata.upsert({
      where: { id: "singleton" },
      update: { lastUpdated: new Date() },
      create: { id: "singleton", lastUpdated: new Date() },
    });
  },

  async getAccounts(): Promise<EmailAccount[]> {
    const dbAccounts = await prisma.emailAccount.findMany();
    return dbAccounts.map((a) => ({
      email: a.email,
      first_name: a.firstName || "",
      last_name: a.lastName || "",
      organization: a.organization || "",
      warmup_status: a.warmupStatus,
      provider_code: a.providerCode || 0,
      setup_pending: a.setupPending,
      is_managed_account: a.isManagedAccount,
      warmup: {
        limit: a.warmupLimit || 0,
        warmup_custom_ftag: a.warmupCustomFtag || "",
        increment: a.warmupIncrement || "",
        reply_rate: a.warmupReplyRate || 0,
      },
      added_by: a.addedBy || "",
      daily_limit: a.dailyLimit || 0,
      modified_by: a.modifiedBy || "",
      tracking_domain_name: a.trackingDomainName || "",
      tracking_domain_status: a.trackingDomainStatus || "",
      status: a.status,
      enable_slow_ramp: a.enableSlowRamp,
      inbox_placement_test_limit: a.inboxPlacementTestLimit || 0,
      stat_warmup_score: a.statWarmupScore,
      sending_gap: a.sendingGap || 0,
      timestamp_created: a.timestampCreated?.toISOString() || "",
      timestamp_updated: a.timestampUpdated?.toISOString() || "",
      timestamp_last_used: a.timestampLastUsed?.toISOString() || "",
    }));
  },

  async getCampaigns(): Promise<CampaignAnalytics[]> {
    const dbCampaigns = await prisma.campaign.findMany();
    return dbCampaigns.map((c) => ({
      campaign_id: c.campaignId,
      campaign_name: c.campaignName,
      campaign_status: c.campaignStatus,
      campaign_is_evergreen: c.campaignIsEvergreen,
      leads_count: c.leadsCount,
      contacted_count: c.contactedCount,
      open_count: c.openCount,
      reply_count: c.replyCount,
      link_click_count: c.linkClickCount,
      bounced_count: c.bouncedCount,
      unsubscribed_count: c.unsubscribedCount,
      completed_count: c.completedCount,
      emails_sent_count: c.emailsSentCount,
      new_leads_contacted_count: c.newLeadsContactedCount,
      total_opportunities: c.totalOpportunities,
      total_opportunity_value: c.totalOpportunityValue,
      open_count_unique: c.openCountUnique,
      reply_count_unique: c.replyCountUnique,
      link_click_count_unique: c.linkClickCountUnique,
    }));
  },

  async getLastUpdated(): Promise<string | null> {
    const metadata = await prisma.syncMetadata.findUnique({
      where: { id: "singleton" },
    });
    return metadata?.lastUpdated?.toISOString() || null;
  },

  async getDashboardData(): Promise<DashboardData> {
    const [accounts, campaigns, lastUpdated] = await Promise.all([
      this.getAccounts(),
      this.getCampaigns(),
      this.getLastUpdated(),
    ]);
    return { accounts, campaigns, lastUpdated };
  },

  async getDomains(): Promise<DomainHealth[]> {
    const accounts = await this.getAccounts();
    const domainMap = new Map<string, EmailAccount[]>();

    accounts.forEach((account) => {
      const domain = account.email?.split("@")[1];
      if (domain) {
        if (!domainMap.has(domain)) {
          domainMap.set(domain, []);
        }
        domainMap.get(domain)!.push(account);
      }
    });

    return Array.from(domainMap.entries()).map(([domain, domainAccounts]) => ({
      domain,
      accountCount: domainAccounts.length,
      averageHealthScore:
        domainAccounts.length > 0
          ? domainAccounts.reduce(
              (sum, a) => sum + (a.stat_warmup_score || 0),
              0
            ) / domainAccounts.length
          : 0,
      activeAccounts: domainAccounts.filter((a) => a.status === 1).length,
      warmupEnabled: domainAccounts.filter((a) => a.warmup_status === 1).length,
      accounts: domainAccounts,
    }));
  },

  async getAlerts(): Promise<Alert[]> {
    const [accounts, campaigns] = await Promise.all([
      this.getAccounts(),
      this.getCampaigns(),
    ]);
    const alerts: Alert[] = [];

    accounts.forEach((account) => {
      const score = account.stat_warmup_score || 0;
      if (score < 20) {
        alerts.push({
          id: `critical-${account.email}`,
          type: "critical",
          title: "Critical Health Score",
          message: `${account.email} has a critical warmup score of ${score}%`,
          relatedEntity: account.email,
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      } else if (score < 50) {
        alerts.push({
          id: `warning-${account.email}`,
          type: "warning",
          title: "Low Health Score",
          message: `${account.email} warmup score is ${score}%`,
          relatedEntity: account.email,
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }
    });

    campaigns.forEach((campaign) => {
      if (
        campaign.emails_sent_count > 0 &&
        campaign.bounced_count > campaign.emails_sent_count * 0.1
      ) {
        alerts.push({
          id: `bounce-${campaign.campaign_id}`,
          type: "warning",
          title: "High Bounce Rate",
          message: `Campaign "${campaign.campaign_name}" has >10% bounce rate`,
          relatedEntity: campaign.campaign_name,
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }
    });

    return alerts.sort((a, b) => {
      const priority = { critical: 0, warning: 1, info: 2 };
      return priority[a.type] - priority[b.type];
    });
  },
};
