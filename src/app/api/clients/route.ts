import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncMonthlyCycles } from "@/lib/billing";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await syncMonthlyCycles();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const billingType = searchParams.get("billing_type");
    const status = searchParams.get("status") || "active";

    let sql = `
      SELECT c.*,
        (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) as total_projects,
        (SELECT COALESCE(SUM(total_amount), 0) FROM projects p WHERE p.client_id = c.id) as projects_total,
        (SELECT COALESCE(SUM(amount), 0) FROM monthly_cycles mc WHERE mc.client_id = c.id AND mc.payment_status = 'paid') as retainer_paid_total,
        (SELECT COALESCE(SUM(amount), 0) FROM monthly_cycles mc WHERE mc.client_id = c.id AND mc.payment_status != 'paid') as retainer_due_total
      FROM clients c
      WHERE 1=1
    `;
    const args: any[] = [];

    if (category) {
      sql += " AND c.category = ?";
      args.push(category);
    }
    if (billingType) {
      sql += " AND c.billing_type = ?";
      args.push(billingType);
    }
    if (status !== "all") {
      sql += " AND c.status = ?";
      args.push(status);
    }

    sql += " ORDER BY c.created_at DESC";

    const res = await db.execute({ sql, args });
    return NextResponse.json({ clients: res.rows });
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      business_name,
      category = "graphic_design",
      billing_type = "monthly",
      monthly_amount = 0,
      cycle_reset_day = 1,
      notes,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    const clientId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO clients (
        id, name, email, phone, business_name, category, billing_type,
        monthly_amount, cycle_reset_day, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      args: [
        clientId,
        name,
        email || null,
        phone || null,
        business_name || null,
        category,
        billing_type,
        parseFloat(monthly_amount) || 0,
        parseInt(cycle_reset_day, 10) || 1,
        notes || null,
        now,
        now,
      ],
    });

    // If monthly or hybrid, trigger sync to generate initial cycle
    if (billing_type === "monthly" || billing_type === "hybrid") {
      await syncMonthlyCycles();
    }

    return NextResponse.json({
      success: true,
      client: { id: clientId, name, business_name, category, billing_type },
    });
  } catch (error: any) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client", details: error.message },
      { status: 500 }
    );
  }
}
