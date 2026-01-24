import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await prisma.campaign.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} campaigns`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error clearing campaigns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear campaigns" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to clear all campaign data",
  });
}
