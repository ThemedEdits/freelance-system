import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncMonthlyCycles } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await syncMonthlyCycles();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentMonthPrefix = `${currentYear}-${currentMonth}`;

    // 1. Projects financials
    const projectsFin = await db.execute(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_project_value,
        COALESCE(SUM(paid_amount), 0) as total_project_paid,
        COALESCE(SUM(CASE WHEN payment_status != 'paid' THEN (total_amount - paid_amount) ELSE 0 END), 0) as project_due
      FROM projects
    `);

    // 2. Monthly Cycles financials
    const cyclesFin = await db.execute(`
      SELECT
        COALESCE(SUM(amount), 0) as total_cycles_value,
        COALESCE(SUM(paid_amount), 0) as total_cycles_paid,
        COALESCE(SUM(CASE WHEN payment_status != 'paid' THEN (amount - paid_amount) ELSE 0 END), 0) as cycles_due
      FROM monthly_cycles
    `);

    const totalProjectPaid = (projectsFin.rows[0].total_project_paid as number) || 0;
    const totalCyclesPaid = (cyclesFin.rows[0].total_cycles_paid as number) || 0;
    const totalEarnings = totalProjectPaid + totalCyclesPaid;

    const projectDue = (projectsFin.rows[0].project_due as number) || 0;
    const cyclesDue = (cyclesFin.rows[0].cycles_due as number) || 0;
    const paymentsDue = projectDue + cyclesDue;

    // 3. Earned this month
    const earnedThisMonthCycles = await db.execute({
      sql: `
        SELECT COALESCE(SUM(paid_amount), 0) as earned_month
        FROM monthly_cycles
        WHERE (paid_at LIKE ? OR (paid_at IS NULL AND period_start LIKE ? AND payment_status = 'paid'))
      `,
      args: [`${currentMonthPrefix}%`, `${currentMonthPrefix}%`],
    });

    const earnedThisMonthProjects = await db.execute({
      sql: `
        SELECT COALESCE(SUM(paid_amount), 0) as earned_month
        FROM projects
        WHERE (paid_at LIKE ? OR (paid_at IS NULL AND created_at LIKE ? AND paid_amount > 0))
      `,
      args: [`${currentMonthPrefix}%`, `${currentMonthPrefix}%`],
    });

    const earnedThisMonth =
      ((earnedThisMonthCycles.rows[0].earned_month as number) || 0) +
      ((earnedThisMonthProjects.rows[0].earned_month as number) || 0);

    // 4. Clients counts & category breakdown
    const clientsRes = await db.execute(`
      SELECT 
        COUNT(*) as total_clients,
        SUM(CASE WHEN category = 'graphic_design' THEN 1 ELSE 0 END) as count_graphic,
        SUM(CASE WHEN category = 'web_development' THEN 1 ELSE 0 END) as count_web,
        SUM(CASE WHEN category = 'software_engineering' THEN 1 ELSE 0 END) as count_software,
        SUM(CASE WHEN billing_type IN ('monthly', 'hybrid') THEN monthly_amount ELSE 0 END) as total_monthly_retainers
      FROM clients
      WHERE status = 'active'
    `);

    const cRow = clientsRes.rows[0];
    const totalClients = (cRow.total_clients as number) || 0;
    const countGraphic = (cRow.count_graphic as number) || 0;
    const countWeb = (cRow.count_web as number) || 0;
    const countSoftware = (cRow.count_software as number) || 0;
    const averageMonthlyEarning = (cRow.total_monthly_retainers as number) || 0;

    // 5. Late Payment Behavior & Client Reliability Ranking
    // Queries each client's history of payment timing
    const reliabilityRes = await db.execute(`
      SELECT 
        c.id as client_id,
        c.name as client_name,
        c.business_name,
        c.category,
        c.cycle_reset_day,
        COUNT(mc.id) as total_cycles,
        SUM(CASE WHEN mc.payment_status = 'paid' AND mc.days_late <= 0 THEN 1 ELSE 0 END) as on_time_count,
        SUM(CASE WHEN mc.payment_status = 'late_paid' OR mc.days_late > 0 THEN 1 ELSE 0 END) as late_count,
        COALESCE(AVG(CASE WHEN mc.days_late > 0 THEN mc.days_late ELSE 0 END), 0) as avg_days_late,
        MAX(mc.days_late) as max_days_late
      FROM clients c
      JOIN monthly_cycles mc ON c.id = mc.client_id
      GROUP BY c.id
    `);

    const clientReliability = reliabilityRes.rows.map((row) => {
      const total = (row.total_cycles as number) || 1;
      const onTime = (row.on_time_count as number) || 0;
      const avgDays = Math.round(((row.avg_days_late as number) || 0) * 10) / 10;
      const onTimeRatio = Math.round((onTime / total) * 100);

      let status: "prompt" | "moderate" | "frequently_late" = "prompt";
      if (avgDays >= 5 || onTimeRatio < 50) {
        status = "frequently_late";
      } else if (avgDays > 1 || onTimeRatio < 80) {
        status = "moderate";
      }

      return {
        client_id: row.client_id,
        client_name: row.client_name,
        business_name: row.business_name || row.client_name,
        category: row.category,
        cycle_reset_day: row.cycle_reset_day,
        average_days_late: avgDays,
        max_days_late: row.max_days_late || 0,
        on_time_ratio: onTimeRatio,
        total_cycles_paid: total,
        status,
      };
    });

    // Overall average days late
    const overallAvgDaysLate =
      clientReliability.length > 0
        ? Math.round(
            (clientReliability.reduce((acc, c) => acc + c.average_days_late, 0) /
              clientReliability.length) *
              10
          ) / 10
        : 0;

    // Upcoming or Overdue cycles
    const overdueCyclesRes = await db.execute(`
      SELECT COUNT(*) as count 
      FROM monthly_cycles 
      WHERE payment_status = 'unpaid' AND due_date < date('now')
    `);
    const overdueCyclesCount = (overdueCyclesRes.rows[0].count as number) || 0;

    // Active projects count
    const activeProjectsRes = await db.execute(`
      SELECT COUNT(*) as count FROM projects WHERE status = 'in_progress'
    `);
    const activeProjectsCount = (activeProjectsRes.rows[0].count as number) || 0;

    return NextResponse.json({
      totalEarnings,
      earnedThisMonth,
      paymentsDue,
      totalClients,
      activeClientsCount: totalClients,
      categoryCounts: {
        graphic_design: countGraphic,
        web_development: countWeb,
        software_engineering: countSoftware,
      },
      averageMonthlyEarning,
      averageDaysLate: overallAvgDaysLate,
      overdueCyclesCount,
      activeProjectsCount,
      clientReliability,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: error.message },
      { status: 500 }
    );
  }
}
