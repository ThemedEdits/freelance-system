import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { payment_status, paid_amount, paid_at, notes } = body;

    // Fetch existing cycle to get due_date and amount
    const cycleRes = await db.execute({
      sql: `SELECT * FROM monthly_cycles WHERE id = ?`,
      args: [id],
    });

    if (cycleRes.rows.length === 0) {
      return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
    }

    const cycle = cycleRes.rows[0];
    const dueDate = new Date(cycle.due_date as string);
    let daysLate = 0;

    if (paid_at) {
      const paidDate = new Date(paid_at);
      const diffMs = paidDate.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        daysLate = diffDays;
      }
    }

    let finalStatus = payment_status || cycle.payment_status;
    // If marked late_paid but daysLate not set, or if paid_at after due date
    if (finalStatus === "late_paid" && daysLate === 0 && paid_at) {
      daysLate = Math.max(1, daysLate);
    }

    let finalPaidAmount = paid_amount !== undefined ? parseFloat(paid_amount) : cycle.paid_amount;
    if (finalStatus === "paid" && (paid_amount === undefined || paid_amount === null)) {
      finalPaidAmount = cycle.amount;
    }

    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE monthly_cycles SET
        payment_status = ?,
        paid_amount = ?,
        paid_at = ?,
        days_late = ?,
        notes = COALESCE(?, notes),
        updated_at = ?
      WHERE id = ?`,
      args: [
        finalStatus,
        finalPaidAmount,
        paid_at || null,
        daysLate,
        notes || null,
        now,
        id,
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Cycle payment status updated",
      days_late: daysLate,
    });
  } catch (error: any) {
    console.error("Error updating cycle:", error);
    return NextResponse.json(
      { error: "Failed to update cycle", details: error.message },
      { status: 500 }
    );
  }
}
