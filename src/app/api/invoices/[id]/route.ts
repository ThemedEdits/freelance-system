import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const res = await db.execute({
      sql: `
        SELECT inv.*, c.name as client_name, c.business_name as client_business,
               c.email as client_email, c.phone as client_phone, c.category as client_category,
               p.title as project_title
        FROM invoices inv
        JOIN clients c ON inv.client_id = c.id
        LEFT JOIN projects p ON inv.project_id = p.id
        WHERE inv.id = ?
      `,
      args: [id],
    });

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const row = res.rows[0];
    let items = [];
    try {
      if (row.items_json) {
        items = JSON.parse(row.items_json as string);
      }
    } catch (e) {
      items = [];
    }

    // Also fetch company settings
    const settingsRes = await db.execute(
      "SELECT * FROM company_settings WHERE id = 'default'"
    );

    return NextResponse.json({
      invoice: {
        ...row,
        items,
      },
      settings: settingsRes.rows[0] || null,
    });
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice", details: error.message },
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
    const { status, paid_amount, notes } = body;

    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE invoices SET
        status = COALESCE(?, status),
        paid_amount = COALESCE(?, paid_amount),
        notes = COALESCE(?, notes),
        updated_at = ?
      WHERE id = ?`,
      args: [
        status,
        paid_amount !== undefined ? parseFloat(paid_amount) : null,
        notes,
        now,
        id,
      ],
    });

    return NextResponse.json({ success: true, message: "Invoice updated" });
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice", details: error.message },
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
      sql: `DELETE FROM invoices WHERE id = ?`,
      args: [id],
    });
    return NextResponse.json({ success: true, message: "Invoice deleted" });
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice", details: error.message },
      { status: 500 }
    );
  }
}
