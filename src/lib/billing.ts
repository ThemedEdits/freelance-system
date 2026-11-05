import { db } from "./db";
import crypto from "crypto";
export { formatPKR, formatDate } from "./utils";

/**
 * Calculates start and end dates of a client's monthly cycle based on their reset day.
 * e.g., if resetDay is 18, and today is Nov 5, 2026:
 * Period start: Oct 18, 2026
 * Period end: Nov 17, 2026
 * If today is Nov 20, 2026:
 * Period start: Nov 18, 2026
 * Period end: Dec 17, 2026
 */
export function calculateCurrentCycle(resetDay: number, refDate = new Date()): {
  periodStart: string;
  periodEnd: string;
  dueDate: string;
} {
  const year = refDate.getFullYear();
  const month = refDate.getMonth(); // 0-11
  const day = refDate.getDate();

  let startYear = year;
  let startMonth = month;

  if (day < resetDay) {
    // Current date is before the reset day of this calendar month,
    // so cycle started last month on resetDay
    startMonth = month - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear = year - 1;
    }
  }

  // Adjust resetDay if month has fewer days
  const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
  const actualResetDay = Math.min(resetDay, daysInStartMonth);

  const startDate = new Date(startYear, startMonth, actualResetDay);

  // Period end is 1 month later minus 1 day
  let endMonth = startMonth + 1;
  let endYear = startYear;
  if (endMonth > 11) {
    endMonth = 0;
    endYear = startYear + 1;
  }

  const daysInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
  const endDay = Math.min(actualResetDay - 1 || daysInEndMonth, daysInEndMonth);
  const endDate = new Date(endYear, endMonth, endDay);

  // Due date is typically 7 days after period starts
  const dueDateObj = new Date(startDate);
  dueDateObj.setDate(dueDateObj.getDate() + 7);

  const toYMD = (d: Date) => d.toISOString().split("T")[0];

  return {
    periodStart: toYMD(startDate),
    periodEnd: toYMD(endDate),
    dueDate: toYMD(dueDateObj),
  };
}

/**
 * Ensures monthly client cycles are generated and notifications dispatched when cycle resets.
 */
export async function syncMonthlyCycles() {
  const now = new Date();
  const clientsRes = await db.execute(`
    SELECT * FROM clients 
    WHERE (billing_type = 'monthly' OR billing_type = 'hybrid')
    AND status = 'active'
  `);

  for (const client of clientsRes.rows) {
    const resetDay = (client.cycle_reset_day as number) || 1;
    const { periodStart, periodEnd, dueDate } = calculateCurrentCycle(resetDay, now);

    // Check if cycle already exists
    const existing = await db.execute({
      sql: `SELECT id FROM monthly_cycles WHERE client_id = ? AND period_start = ?`,
      args: [client.id, periodStart],
    });

    if (existing.rows.length === 0) {
      const cycleId = crypto.randomUUID();
      const amount = (client.monthly_amount as number) || 0;

      await db.execute({
        sql: `INSERT INTO monthly_cycles (
          id, client_id, period_start, period_end, amount, paid_amount,
          payment_status, due_date, days_late, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, 'unpaid', ?, 0, ?, ?, ?)`,
        args: [
          cycleId,
          client.id,
          periodStart,
          periodEnd,
          amount,
          dueDate,
          `Cycle auto-generated for period ${periodStart} to ${periodEnd}`,
          now.toISOString(),
          now.toISOString(),
        ],
      });

      // Insert notification
      await db.execute({
        sql: `INSERT INTO notifications (
          id, type, client_id, title, message, link, is_read, created_at
        ) VALUES (?, 'cycle_reset', ?, ?, ?, ?, 0, ?)`,
        args: [
          crypto.randomUUID(),
          client.id,
          `Monthly Cycle Reset: ${client.business_name || client.name}`,
          `${client.business_name || client.name}'s monthly cycle has reset (${periodStart} to ${periodEnd}). Payment of Rs. ${amount.toLocaleString()} is due.`,
          `/clients/${client.id}`,
          now.toISOString(),
        ],
      });
    }
  }
}
