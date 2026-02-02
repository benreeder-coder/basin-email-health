# Basin Email Health Dashboard - Project Resume

> Last updated: 2026-01-24

## Quick Context

Email health monitoring dashboard for Basin Ventures that tracks Instantly.ai email account warmup scores, campaign analytics, and send projections. Data flows from n8n workflows via webhooks to a Vercel-hosted Next.js app with PostgreSQL persistence. The most recent work fixed the send projection algorithm to use a capacity-based backlog model.

## Current State

### What's Working
- Campaign analytics tab with leads, opens, replies, bounce rates
- Email accounts tab with health scores and warmup status
- Domains tab with aggregated health metrics per domain
- Alerts tab for critical/warning notifications
- **Send Projection tab** with capacity-based algorithm (just fixed)
- Webhook endpoints receiving data from n8n every 6 hours
- Auto-refresh every 30 seconds
- PostgreSQL persistence via Prisma

### What Was Just Changed (2026-01-24)
The `generateProjectionData()` function was replaced to fix Day 1 showing only 300 emails. New algorithm:
- Day 1 = 900 emails (pre-warmed accounts)
- Follow-ups (Email 2s/3s) take priority over new leads
- Overflow beyond 900/day carries to next day as backlog

### Tech Stack
- **Next.js 16**: App Router, React 19
- **TypeScript**: Full type coverage
- **Tailwind CSS v4**: With Basin brand colors
- **Prisma + PostgreSQL**: Vercel Postgres for persistence
- **Recharts**: Charts in Send Projection tab
- **shadcn/ui**: UI component library
- **Vercel**: Hosting and deployment

## File Structure

```
basin-email-health/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dashboard/route.ts      # GET dashboard data
│   │   │   ├── admin/clear-campaigns/  # Admin endpoint
│   │   │   └── webhooks/
│   │   │       ├── accounts/route.ts   # POST from n8n
│   │   │       └── campaigns/route.ts  # POST from n8n
│   │   ├── globals.css                 # Tailwind + brand colors
│   │   ├── layout.tsx                  # Root layout
│   │   └── page.tsx                    # Main dashboard (tabs)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── send-projection-tab.tsx # RECENTLY MODIFIED
│   │   │   ├── campaigns-tab.tsx
│   │   │   ├── email-accounts-tab.tsx
│   │   │   ├── domains-tab.tsx
│   │   │   ├── alerts-tab.tsx
│   │   │   ├── header.tsx
│   │   │   └── data-table.tsx
│   │   └── ui/                         # shadcn components
│   └── lib/
│       ├── store.ts                    # Prisma-based data store
│       ├── types.ts                    # TypeScript interfaces
│       ├── prisma.ts                   # Prisma client
│       └── utils.ts                    # cn() helper
├── prisma/
│   └── schema.prisma                   # Database schema
├── public/
│   └── basin-logo.png
├── .env / .env.local                   # DB connection strings
└── workflow-updated.json               # n8n workflow config
```

## Key Technical Details

### Send Projection Algorithm (RECENTLY FIXED)
Location: `src/components/dashboard/send-projection-tab.tsx:102-215`

Campaign constants:
```typescript
const CAMPAIGN_START = new Date(2026, 1, 2); // Feb 2, 2026
const TOTAL_LEADS = 6398;
const EMAILS_PER_LEAD = 3;
const DAILY_CAPACITY = 900;
```

Priority order for daily sends:
1. Backlogged Email 2s (oldest)
2. Backlogged Email 3s
3. Email 2s due today (from leads started day-1)
4. Email 3s due today (from leads started day-3)
5. New Email 1s to fill remaining capacity

### Database Schema
Location: `prisma/schema.prisma`

Three models:
- `EmailAccount`: Instantly.ai account data with warmup scores
- `Campaign`: Campaign analytics (leads, opens, replies, bounces)
- `SyncMetadata`: Tracks last webhook update timestamp

### Data Flow
1. n8n workflow calls Instantly.ai API every 6 hours
2. Sends data to `/api/webhooks/accounts` and `/api/webhooks/campaigns`
3. Webhooks upsert to PostgreSQL via Prisma
4. Dashboard polls `/api/dashboard` every 30 seconds

### Important Code Locations
- **Dashboard tabs**: `src/app/page.tsx:62-120` - Tab component structure
- **Send projection algorithm**: `src/components/dashboard/send-projection-tab.tsx:102-215`
- **Data store (Prisma)**: `src/lib/store.ts` - All CRUD operations
- **Webhook handlers**: `src/app/api/webhooks/*/route.ts`
- **Alert generation**: `src/lib/store.ts:237-290` - Health score alerts

### Brand Colors
```css
--basin-red: #E31B54
--health-excellent: #22C55E (80-100)
--health-good: #84CC16 (60-79)
--health-warning: #EAB308 (40-59)
--health-poor: #F97316 (20-39)
--health-critical: #EF4444 (0-19)
```

## Recent Changes

1. **Send projection fix** (2026-01-24): Replaced `generateProjectionData()` with capacity-based backlog model
   - Day 1 now shows 900 emails instead of 300
   - Follow-ups take priority over new leads
   - No day exceeds 900 capacity

## Known Issues / Future Work

- [ ] Send projection constants are hardcoded - could be made configurable
- [ ] Campaign data in projection is static (6398 leads) - could sync with actual campaign
- [ ] No authentication on webhooks - add `WEBHOOK_SECRET` validation
- [ ] No user authentication on dashboard

## Deployments

- **GitHub**: https://github.com/benreeder-coder/basin-email-health
- **Vercel Production**: https://basin-email-health.vercel.app
- **Latest deploy URL**: https://basin-email-health-lzut7vnhk-ben-reeders-projects.vercel.app

## How to Continue

### Local Development
```bash
cd "Email Health/basin-email-health"
npm install
npm run dev
# Opens http://localhost:3000
```

### Database Commands
```bash
npm run db:push    # Push schema changes to DB
npm run db:studio  # Open Prisma Studio GUI
```

### Deploy
```bash
git add . && git commit -m "message"
git push origin master
vercel --prod --yes
```

### Test Webhooks
```bash
# Accounts webhook
curl -X POST http://localhost:3000/api/webhooks/accounts \
  -H "Content-Type: application/json" \
  -d '{"items": [{"email": "test@example.com", "stat_warmup_score": 85}]}'

# Campaigns webhook
curl -X POST http://localhost:3000/api/webhooks/campaigns \
  -H "Content-Type: application/json" \
  -d '{"campaigns": [{"campaign_id": "123", "campaign_name": "Test", "leads_count": 100}]}'
```

## Environment Variables

Required in `.env.local`:
```
POSTGRES_PRISMA_URL=postgresql://...?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://...
```

Optional:
```
WEBHOOK_SECRET=your-secret-key
```

## n8n Integration

The workflow file `workflow-updated.json` is configured for:
- Accounts webhook: `https://basin-email-health.vercel.app/api/webhooks/accounts`
- Campaigns webhook: `https://basin-email-health.vercel.app/api/webhooks/campaigns`
- Runs every 6 hours
