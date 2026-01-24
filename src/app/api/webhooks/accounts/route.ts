import { NextRequest, NextResponse } from "next/server";
import { dashboardStore } from "@/lib/store";
import { EmailAccount } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle multiple formats from n8n:
    // 1. { items: [...] } - direct format
    // 2. [{ items: [...] }] - wrapped in array
    // 3. [{ items: [{ items: [...] }] }] - doubly nested from n8n
    // 4. Direct array of accounts
    let accounts: EmailAccount[];

    if (Array.isArray(body)) {
      // Check if it's an array wrapper
      if (body[0]?.items) {
        // Check for doubly nested structure: [{ items: [{ items: [...] }] }]
        if (Array.isArray(body[0].items) && body[0].items[0]?.items) {
          accounts = body[0].items[0].items;
        } else {
          accounts = body[0].items;
        }
      } else {
        accounts = body;
      }
    } else if (body.items) {
      // Check for nested items: { items: [{ items: [...] }] }
      if (Array.isArray(body.items) && body.items[0]?.items) {
        accounts = body.items[0].items;
      } else {
        accounts = body.items;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid payload format. Expected { items: [...] } or array" },
        { status: 400 }
      );
    }

    await dashboardStore.setAccounts(accounts);

    return NextResponse.json({
      success: true,
      message: `Received ${accounts.length} accounts`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Accounts webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const accounts = await dashboardStore.getAccounts();
  const lastUpdated = await dashboardStore.getLastUpdated();

  return NextResponse.json({
    accounts,
    count: accounts.length,
    lastUpdated,
  });
}
