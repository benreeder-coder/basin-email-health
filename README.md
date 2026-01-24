# Basin Ventures Email Health Dashboard

A dashboard for monitoring email account warmup health scores and campaign analytics, branded for Basin Ventures.

## Live Demo

**Production URL**: https://basin-email-health.vercel.app

## Features

- **Campaigns Tab**: View campaign analytics including leads, contacts, opens, replies, and bounce rates
- **Email Accounts Tab**: Monitor email account health scores, warmup status, and daily limits
- **Domains Tab**: Aggregated health metrics by domain
- **Alerts Tab**: Critical and warning alerts for accounts needing attention
- **Auto-refresh**: Dashboard updates every 30 seconds
- **Webhook API**: Receive data from n8n workflows

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Data Tables**: TanStack Table
- **Icons**: Lucide React
- **Fonts**: Montserrat (headings), Inter (body)

## Brand Colors

- **Primary (Basin Red)**: #E31B54
- **Secondary (Navy)**: #141414
- **Background**: #f2f2f2
- **Health Scores**:
  - Excellent (80-100): #22C55E
  - Good (60-79): #84CC16
  - Warning (40-59): #EAB308
  - Poor (20-39): #F97316
  - Critical (0-19): #EF4444

## API Endpoints

### Webhooks (POST)

**Accounts Webhook**
```
POST /api/webhooks/accounts
Content-Type: application/json

{
  "items": [
    {
      "email": "user@example.com",
      "stat_warmup_score": 85,
      "status": 1,
      "warmup_status": 1,
      "daily_limit": 50,
      ...
    }
  ]
}
```

**Campaigns Webhook**
```
POST /api/webhooks/campaigns
Content-Type: application/json

{
  "campaigns": [
    {
      "campaign_name": "Q4 Outreach",
      "campaign_status": 1,
      "leads_count": 1000,
      "emails_sent_count": 500,
      ...
    }
  ]
}
```

### Dashboard Data (GET)

```
GET /api/dashboard

Response:
{
  "accounts": [...],
  "campaigns": [...],
  "domains": [...],
  "alerts": [...],
  "lastUpdated": "2025-12-18T10:00:00.000Z"
}
```

## n8n Workflow Integration

The updated workflow file (`workflow-updated.json`) is configured to send data to this dashboard:

1. Import `workflow-updated.json` into n8n
2. Configure your Instantly.ai API credentials
3. Enable the workflow
4. Data will be sent every 6 hours automatically

**Webhook URLs in workflow**:
- Accounts: `https://basin-email-health.vercel.app/api/webhooks/accounts`
- Campaigns: `https://basin-email-health.vercel.app/api/webhooks/campaigns`

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Environment Variables

No environment variables are required for basic operation.

Optional (for enhanced security):
```env
WEBHOOK_SECRET=your-secret-key  # For webhook authentication
```

## Deployment

The app is deployed on Vercel. To redeploy:

```bash
npx vercel --prod
```

## Project Structure

```
basin-email-health/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dashboard/route.ts
│   │   │   └── webhooks/
│   │   │       ├── accounts/route.ts
│   │   │       └── campaigns/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── alerts-tab.tsx
│   │   │   ├── campaigns-tab.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── domains-tab.tsx
│   │   │   ├── email-accounts-tab.tsx
│   │   │   ├── header.tsx
│   │   │   ├── health-score-card.tsx
│   │   │   └── stat-card.tsx
│   │   └── ui/  (shadcn components)
│   └── lib/
│       ├── store.ts
│       ├── types.ts
│       └── utils.ts
├── public/
│   └── basin-logo.png
└── package.json
```

## Data Persistence

**Note**: This dashboard uses in-memory storage. Data will be cleared when the server restarts or when Vercel functions cold-start. For production use with persistent data, consider:

- Adding a database (PostgreSQL, MongoDB, etc.)
- Using Redis for caching
- Implementing Vercel KV storage

## License

Private - Basin Ventures
