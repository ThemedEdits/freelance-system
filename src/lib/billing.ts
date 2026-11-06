import { db } from "./db";
import crypto from "crypto";
export { formatPKR, formatDate } from "./utils";

/**
 * Calculates start and end dates of a client's completed monthly cycle based on their reset day.
 * Arrears billing model:
 * On or after the reset day, payment is requested for the service period that JUST concluded.
 *
 * Example 1: resetDay = 1, today is Nov 7, 2026:
 * - The most recent reset day reached is Nov 1, 2026.
 * - The period being billed is the completed month of October:
 *   Period Start: 2026-10-01
 *   Period End:   2026-10-31
 *   Due Date:     2026-11-08 (7 days after Nov 1)
 *
 * Example 2: resetDay = 21, today is Nov 7, 2026:
 * - Nov 21 has not arrived yet. The most recent reset day reached is Oct 21, 2026.
 * - The period being billed is:
 *   Period Start: 2026-09-21
 *   Period End:   2026-10-20
 *   Due Date:     2026-10-28 (7 days after Oct 21)
 * - Once Nov 21 arrives, the cycle shifts to:
 *   Period Start: 2026-10-21
 *   Period End:   2026-11-20
 *   Due Date:     2026-11-28
 */
export function calculateCurrentCycle(resetDay: number, refDate = new Date()): {
  periodStart: string;
  periodEnd: string;
  dueDate: string;
} {
  const year = refDate.getUTCFullYear();
  const month = refDate.getUTCMonth(); // 0-11
  const day = refDate.getUTCDate();

  // Find the anchor reset date that has already arrived (<= refDate)
  let anchorYear = year;
  let anchorMonth = month;

  if (day < resetDay) {
    // Current date hasn't reached resetDay this month yet,
    // so the last reached reset day was in the previous calendar month
    anchorMonth = month - 1;
    if (anchorMonth < 0) {
      anchorMonth = 11;
      anchorYear = year - 1;
    }
  }

  // Anchor reset day in anchorMonth (e.g., Nov 1 or Oct 21)
  const daysInAnchorMonth = new Date(Date.UTC(anchorYear, anchorMonth + 1, 0)).getUTCDate();
  const actualAnchorDay = Math.min(resetDay, daysInAnchorMonth);
  const anchorResetDate = new Date(Date.UTC(anchorYear, anchorMonth, actualAnchorDay));

  // The completed period ended exactly 1 day before the anchor reset date:
  const periodEndDate = new Date(anchorResetDate);
  periodEndDate.setUTCDate(periodEndDate.getUTCDate() - 1);

  // The completed period started 1 month prior to the anchor reset date:
  let startMonth = anchorMonth - 1;
  let startYear = anchorYear;
  if (startMonth < 0) {
    startMonth = 11;
    startYear = anchorYear - 1;
  }
  const daysInStartMonth = new Date(Date.UTC(startYear, startMonth + 1, 0)).getUTCDate();
  const actualStartDay = Math.min(resetDay, daysInStartMonth);
  const periodStartDate = new Date(Date.UTC(startYear, startMonth, actualStartDay));

  // Payment Due date: 7 days after the cycle reset day
  const dueDateObj = new Date(anchorResetDate);
  dueDateObj.setUTCDate(dueDateObj.getUTCDate() + 7);

  const toYMD = (d: Date) => d.toISOString().split("T")[0];

  return {
    periodStart: toYMD(periodStartDate),
    periodEnd: toYMD(periodEndDate),
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
