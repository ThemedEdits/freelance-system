import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("client_id");
    const status = searchParams.get("status");

    let sql = `
      SELECT inv.*, c.name as client_name, c.business_name as client_business, c.category as client_category,
             c.email as client_email, c.phone as client_phone, p.title as project_title
      FROM invoices inv
      JOIN clients c ON inv.client_id = c.id
      LEFT JOIN projects p ON inv.project_id = p.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (clientId) {
      sql += " AND inv.client_id = ?";
      args.push(clientId);
    }
    if (status) {
      sql += " AND inv.status = ?";
      args.push(status);
    }

    sql += " ORDER BY inv.issue_date DESC, inv.created_at DESC";

    const res = await db.execute({ sql, args });

    const invoices = res.rows.map((row) => {
      let items = [];
      try {
        if (row.items_json) {
          items = JSON.parse(row.items_json as string);
        }
      } catch (e) {
        items = [];
      }
      return {
        ...row,
        items,
      };
    });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      client_id,
      project_id,
      cycle_id,
      issue_date,
      due_date,
      items = [],
      subtotal = 0,
      discount = 0,
      grand_total = 0,
      paid_amount = 0,
      currency = "PKR",
      show_breakdown = 1,
      include_bank_info = 1,
      include_monthly_retainer = 0,
      notes,
    } = body;

    if (!client_id) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    // Generate unique sequential invoice number
    const countRes = await db.execute("SELECT COUNT(*) as count FROM invoices");
    const nextSeq = ((countRes.rows[0].count as number) || 0) + 1;
    const year = new Date().getFullYear();
    const invoiceNumber = `TE-INV-${year}-${String(nextSeq).padStart(3, "0")}`;

    const invoiceId = crypto.randomUUID();
    const now = new Date().toISOString();

    const finalIssueDate = issue_date || now.split("T")[0];
    const finalDueDate =
      due_date ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const balanceDue = Math.max(0, grand_total - (parseFloat(paid_amount) || 0));
    const status =
      balanceDue === 0
        ? "paid"
        : (parseFloat(paid_amount) || 0) > 0
        ? "partial"
        : "sent";

    await db.execute({
      sql: `INSERT INTO invoices (
        id, invoice_number, client_id, project_id, cycle_id, issue_date, due_date,
        status, subtotal, discount, grand_total, paid_amount, currency,
        show_breakdown, include_bank_info, include_monthly_retainer,
        items_json, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        invoiceId,
        invoiceNumber,
        client_id,
        project_id || null,
        cycle_id || null,
        finalIssueDate,
        finalDueDate,
        status,
        parseFloat(subtotal) || 0,
        parseFloat(discount) || 0,
        parseFloat(grand_total) || 0,
        parseFloat(paid_amount) || 0,
        currency,
        show_breakdown ? 1 : 0,
        include_bank_info ? 1 : 0,
        include_monthly_retainer ? 1 : 0,
        JSON.stringify(items),
        notes || null,
        now,
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoiceId,
        invoice_number: invoiceNumber,
        grand_total,
      },
    });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice", details: error.message },
      { status: 500 }
    );
  }
}
