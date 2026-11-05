import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncMonthlyCycles } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await syncMonthlyCycles();

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("client_id");
    const status = searchParams.get("status");

    let sql = `
      SELECT mc.*, c.name as client_name, c.business_name as client_business, c.category, c.cycle_reset_day
      FROM monthly_cycles mc
      JOIN clients c ON mc.client_id = c.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (clientId) {
      sql += " AND mc.client_id = ?";
      args.push(clientId);
    }
    if (status) {
      sql += " AND mc.payment_status = ?";
      args.push(status);
    }

    sql += " ORDER BY mc.period_start DESC, mc.due_date ASC";

    const res = await db.execute({ sql, args });
    return NextResponse.json({ cycles: res.rows });
  } catch (error: any) {
    console.error("Error fetching monthly cycles:", error);
    return NextResponse.json(
      { error: "Failed to fetch cycles", details: error.message },
      { status: 500 }
    );
  }
}
