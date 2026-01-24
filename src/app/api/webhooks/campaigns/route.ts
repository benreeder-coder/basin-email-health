import { NextRequest, NextResponse } from "next/server";
import { dashboardStore } from "@/lib/store";
import { CampaignAnalytics } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle multiple formats from n8n:
    // 1. { campaigns: [...] } - direct format
    // 2. [{ campaigns: [...] }] - wrapped in array
    // 3. [{ items: [{ items: [...] }] }] - doubly nested from n8n
    // 4. Direct array of campaigns
    let campaigns: CampaignAnalytics[];

    if (Array.isArray(body)) {
      // Check if it's an array wrapper
      if (body[0]?.campaigns) {
        campaigns = body[0].campaigns;
      } else if (body[0]?.items) {
        // Check for doubly nested structure: [{ items: [{ items: [...] }] }]
        if (Array.isArray(body[0].items) && body[0].items[0]?.items) {
          campaigns = body[0].items[0].items;
        } else {
          campaigns = body[0].items;
        }
      } else {
        campaigns = body;
      }
    } else if (body.campaigns) {
      campaigns = body.campaigns;
    } else if (body.items) {
      // Check for nested items: { items: [{ items: [...] }] }
      if (Array.isArray(body.items) && body.items[0]?.items) {
        campaigns = body.items[0].items;
      } else {
        campaigns = body.items;
      }
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid payload format. Expected { campaigns: [...] } or array",
        },
        { status: 400 }
      );
    }

    await dashboardStore.setCampaigns(campaigns);

    return NextResponse.json({
      success: true,
      message: `Received ${campaigns.length} campaigns`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Campaigns webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const campaigns = await dashboardStore.getCampaigns();
  const lastUpdated = await dashboardStore.getLastUpdated();

  return NextResponse.json({
    campaigns,
    count: campaigns.length,
    lastUpdated,
  });
}
