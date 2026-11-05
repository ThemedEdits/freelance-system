import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const projectRes = await db.execute({
      sql: `SELECT p.*, c.name as client_name, c.business_name as client_business, c.category as client_category
            FROM projects p
            JOIN clients c ON p.client_id = c.id
            WHERE p.id = ?`,
      args: [id],
    });

    if (projectRes.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const itemsRes = await db.execute({
      sql: `SELECT * FROM project_items WHERE project_id = ? ORDER BY created_at ASC`,
      args: [id],
    });

    return NextResponse.json({
      project: {
        ...projectRes.rows[0],
        items: itemsRes.rows,
      },
    });
  } catch (error: any) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project", details: error.message },
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
      title,
      category,
      description,
      is_extra_project,
      status,
      discount,
      discount_type,
      paid_amount,
      payment_status,
      due_date,
      paid_at,
      items,
    } = body;

    const now = new Date().toISOString();

    // If items are provided, replace them and recalculate total
    let totalAmount: number | null = null;
    if (Array.isArray(items)) {
      // Delete old items
      await db.execute({
        sql: `DELETE FROM project_items WHERE project_id = ?`,
        args: [id],
      });

      let subtotal = 0;
      for (const item of items) {
        const q = parseInt(item.quantity, 10) || 1;
        const u = parseFloat(item.unit_price) || 0;
        subtotal += q * u;

        await db.execute({
          sql: `INSERT INTO project_items (
            id, project_id, item_type, quantity, unit_price, total_price, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            item.id && !item.id.startsWith("item-") ? item.id : crypto.randomUUID(),
            id,
            item.item_type || "Deliverable",
            q,
            u,
            q * u,
            item.notes || null,
            now,
          ],
        });
      }

      const dVal = parseFloat(discount !== undefined ? discount : 0) || 0;
      const dType = discount_type || "fixed";
      const discountAmt =
        dType === "percentage"
          ? (subtotal * Math.min(100, Math.max(0, dVal))) / 100
          : Math.min(subtotal, Math.max(0, dVal));
      totalAmount = Math.max(0, subtotal - discountAmt);
    }

    await db.execute({
      sql: `UPDATE projects SET
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        is_extra_project = COALESCE(?, is_extra_project),
        status = COALESCE(?, status),
        discount = COALESCE(?, discount),
        discount_type = COALESCE(?, discount_type),
        total_amount = COALESCE(?, total_amount),
        paid_amount = COALESCE(?, paid_amount),
        payment_status = COALESCE(?, payment_status),
        due_date = COALESCE(?, due_date),
        paid_at = COALESCE(?, paid_at),
        updated_at = ?
      WHERE id = ?`,
      args: [
        title,
        category,
        description,
        is_extra_project !== undefined ? (is_extra_project ? 1 : 0) : null,
        status,
        discount !== undefined ? parseFloat(discount) : null,
        discount_type,
        totalAmount,
        paid_amount !== undefined ? parseFloat(paid_amount) : null,
        payment_status,
        due_date,
        paid_at,
        now,
        id,
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project", details: error.message },
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
      sql: `DELETE FROM projects WHERE id = ?`,
      args: [id],
    });
    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project", details: error.message },
      { status: 500 }
    );
  }
}
