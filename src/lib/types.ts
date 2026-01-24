// Instantly.ai Account Data Structure
export interface EmailAccount {
  email: string;
  timestamp_created: string;
  timestamp_updated: string;
  first_name: string;
  last_name: string;
  organization: string;
  warmup_status: number; // 0=disabled, 1=enabled
  provider_code: number;
  setup_pending: boolean;
  is_managed_account: boolean;
  warmup: {
    limit: number;
    warmup_custom_ftag: string;
    increment: string;
    reply_rate: number;
  };
  added_by: string;
  daily_limit: number;
  modified_by: string;
  tracking_domain_name: string;
  tracking_domain_status: string;
  status: number; // 1=active, 0=paused
  enable_slow_ramp: boolean;
  inbox_placement_test_limit: number;
  timestamp_last_used: string;
  stat_warmup_score: number; // 0-100 health score
  sending_gap: number;
}

// Instantly.ai Campaign Analytics Structure
export interface CampaignAnalytics {
  campaign_name: string;
  campaign_id: string;
  campaign_status: number; // 0=draft, 1=active, 2=paused, 3=completed
  campaign_is_evergreen: boolean;
  leads_count: number;
  contacted_count: number;
  open_count: number;
  reply_count: number;
  link_click_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  completed_count: number;
  emails_sent_count: number;
  new_leads_contacted_count: number;
  total_opportunities: number;
  total_opportunity_value: number;
  open_count_unique: number;
  reply_count_unique: number;
  link_click_count_unique: number;
}

// Domain aggregation from accounts
export interface DomainHealth {
  domain: string;
  accountCount: number;
  averageHealthScore: number;
  activeAccounts: number;
  warmupEnabled: number;
  accounts: EmailAccount[];
}

// Alert types
export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  relatedEntity: string;
  timestamp: string;
  acknowledged: boolean;
}

// Webhook payload types
export interface AccountsWebhookPayload {
  items: EmailAccount[];
}

export interface CampaignsWebhookPayload {
  campaigns: CampaignAnalytics[];
}

// Dashboard state
export interface DashboardData {
  accounts: EmailAccount[];
  campaigns: CampaignAnalytics[];
  lastUpdated: string | null;
}

// Full dashboard data with derived fields
export interface FullDashboardData extends DashboardData {
  domains: DomainHealth[];
  alerts: Alert[];
}
