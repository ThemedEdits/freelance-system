import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncMonthlyCycles } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await syncMonthlyCycles();

    const res = await db.execute(`
      SELECT * FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    return NextResponse.json({ notifications: res.rows });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, markAllAsRead } = body;

    if (markAllAsRead) {
      await db.execute(`UPDATE notifications SET is_read = 1 WHERE is_read = 0`);
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (id) {
      await db.execute({
        sql: `UPDATE notifications SET is_read = 1 WHERE id = ?`,
        args: [id],
      });
      return NextResponse.json({ success: true, message: "Marked as read" });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notification", details: error.message },
      { status: 500 }
    );
  }
}
