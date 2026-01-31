import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await prisma.emailAccount.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} email accounts`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error clearing email accounts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear email accounts" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to clear all email account data",
  });
}
