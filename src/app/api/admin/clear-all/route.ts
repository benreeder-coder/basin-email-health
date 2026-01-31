import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Delete in order to respect foreign key constraints if any
    const campaignsResult = await prisma.campaign.deleteMany({});
    const accountsResult = await prisma.emailAccount.deleteMany({});
    const syncResult = await prisma.syncMetadata.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "All data cleared successfully",
      deleted: {
        campaigns: campaignsResult.count,
        emailAccounts: accountsResult.count,
        syncMetadata: syncResult.count,
      },
    });
  } catch (error) {
    console.error("Error clearing all data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear all data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to clear all data (campaigns, accounts, sync metadata)",
  });
}
