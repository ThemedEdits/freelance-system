import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Client
    const clientRes = await db.execute({
      sql: `SELECT * FROM clients WHERE id = ?`,
      args: [id],
    });

    if (clientRes.rows.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const client = clientRes.rows[0];

    // Projects
    const projectsRes = await db.execute({
      sql: `SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC`,
      args: [id],
    });

    // Monthly Cycles
    const cyclesRes = await db.execute({
      sql: `SELECT * FROM monthly_cycles WHERE client_id = ? ORDER BY period_start DESC`,
      args: [id],
    });

    // Invoices
    const invoicesRes = await db.execute({
      sql: `SELECT * FROM invoices WHERE client_id = ? ORDER BY issue_date DESC`,
      args: [id],
    });

    return NextResponse.json({
      client,
      projects: projectsRes.rows,
      cycles: cyclesRes.rows,
      invoices: invoicesRes.rows,
    });
  } catch (error: any) {
    console.error("Error fetching client details:", error);
    return NextResponse.json(
      { error: "Failed to fetch client details", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      name,
      email,
      phone,
      business_name,
      category,
      billing_type,
      monthly_amount,
      cycle_reset_day,
      status,
      notes,
    } = body;

    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE clients SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        business_name = COALESCE(?, business_name),
        category = COALESCE(?, category),
        billing_type = COALESCE(?, billing_type),
        monthly_amount = COALESCE(?, monthly_amount),
        cycle_reset_day = COALESCE(?, cycle_reset_day),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = ?
      WHERE id = ?`,
      args: [
        name,
        email,
        phone,
        business_name,
        category,
        billing_type,
        monthly_amount !== undefined ? parseFloat(monthly_amount) : null,
        cycle_reset_day !== undefined ? parseInt(cycle_reset_day, 10) : null,
        status,
        notes,
        now,
        id,
      ],
    });

    return NextResponse.json({ success: true, message: "Client updated successfully" });
  } catch (error: any) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await db.execute({
      sql: `DELETE FROM clients WHERE id = ?`,
      args: [id],
    });
    return NextResponse.json({ success: true, message: "Client deleted" });
  } catch (error: any) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client", details: error.message },
      { status: 500 }
    );
  }
}
