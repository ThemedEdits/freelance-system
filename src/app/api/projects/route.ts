import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("client_id");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let sql = `
      SELECT p.*, c.name as client_name, c.business_name as client_business, c.category as client_category
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (clientId) {
      sql += " AND p.client_id = ?";
      args.push(clientId);
    }
    if (category) {
      sql += " AND p.category = ?";
      args.push(category);
    }
    if (status) {
      sql += " AND p.status = ?";
      args.push(status);
    }

    sql += " ORDER BY p.created_at DESC";

    const res = await db.execute({ sql, args });

    // Fetch items for each project
    const projectsWithItems = await Promise.all(
      res.rows.map(async (project) => {
        const itemsRes = await db.execute({
          sql: `SELECT * FROM project_items WHERE project_id = ? ORDER BY created_at ASC`,
          args: [project.id],
        });
        return {
          ...project,
          items: itemsRes.rows,
        };
      })
    );

    return NextResponse.json({ projects: projectsWithItems });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      client_id,
      title,
      category = "graphic_design",
      description,
      is_extra_project = 0,
      status = "in_progress",
      discount = 0,
      discount_type = "fixed",
      paid_amount = 0,
      payment_status = "unpaid",
      due_date,
      items = [],
    } = body;

    if (!client_id || !title) {
      return NextResponse.json(
        { error: "Client ID and Title are required" },
        { status: 400 }
      );
    }

    // Calculate subtotal from items
    let subtotal = 0;
    for (const item of items) {
      const q = parseInt(item.quantity, 10) || 1;
      const u = parseFloat(item.unit_price) || 0;
      subtotal += q * u;
    }

    const dVal = parseFloat(discount) || 0;
    const discountAmt =
      discount_type === "percentage"
        ? (subtotal * Math.min(100, Math.max(0, dVal))) / 100
        : Math.min(subtotal, Math.max(0, dVal));
    const totalAmount = Math.max(0, subtotal - discountAmt);

    const projectId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO projects (
        id, client_id, title, category, description, is_extra_project,
        status, discount, discount_type, total_amount, paid_amount,
        payment_status, due_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        projectId,
        client_id,
        title,
        category,
        description || null,
        is_extra_project ? 1 : 0,
        status,
        dVal,
        discount_type,
        totalAmount,
        parseFloat(paid_amount) || 0,
        payment_status,
        due_date || null,
        now,
        now,
      ],
    });

    // Insert items
    for (const item of items) {
      const q = parseInt(item.quantity, 10) || 1;
      const u = parseFloat(item.unit_price) || 0;
      await db.execute({
        sql: `INSERT INTO project_items (
          id, project_id, item_type, quantity, unit_price, total_price, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          projectId,
          item.item_type || "Post Deliverable",
          q,
          u,
          q * u,
          item.notes || null,
          now,
        ],
      });
    }

    return NextResponse.json({
      success: true,
      project: { id: projectId, title, total_amount: totalAmount },
    });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project", details: error.message },
      { status: 500 }
    );
  }
}
