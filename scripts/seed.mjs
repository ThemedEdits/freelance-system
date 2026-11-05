import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seed() {
  console.log("Checking if seeding is needed...");
  const count = await db.execute("SELECT COUNT(*) as count FROM clients");
  if (count.rows[0].count > 0) {
    console.log("Database already has clients. Skipping seed.");
    return;
  }

  console.log("Seeding initial clients, projects, cycles, and notifications...");

  const now = new Date();
  const isoNow = now.toISOString();

  // Client 1: Monthly Graphic Design Client (Reset day 18)
  const c1Id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO clients (id, name, email, phone, business_name, category, billing_type, monthly_amount, cycle_reset_day, status, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      c1Id,
      "Taha Siddiqui",
      "taha@apexbrands.pk",
      "03219876543",
      "Apex Brands",
      "graphic_design",
      "monthly",
      45000,
      18,
      "active",
      "Regular monthly graphic design retainer. Deliverables: 15 social posts + 4 stories per month.",
      isoNow,
      isoNow,
    ],
  });

  // Client 1 Monthly cycle (Oct 18 - Nov 17: Due / Unpaid)
  const cyc1Id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO monthly_cycles (id, client_id, period_start, period_end, amount, paid_amount, payment_status, due_date, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      cyc1Id,
      c1Id,
      "2026-10-18",
      "2026-11-17",
      45000,
      0,
      "unpaid",
      "2026-10-25",
      "Cycle reset on 18th Oct. Payment due.",
      isoNow,
      isoNow,
    ],
  });

  // Client 2: Hybrid Client (Software & Graphic Design, Monthly + Extra Project)
  const c2Id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO clients (id, name, email, phone, business_name, category, billing_type, monthly_amount, cycle_reset_day, status, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      c2Id,
      "Bilal Farooq",
      "bilal@novatech.io",
      "03001234567",
      "Nova Tech Labs",
      "software_engineering",
      "hybrid",
      75000,
      1,
      "active",
      "Monthly maintenance retainer Rs. 75,000 + separate billable software features.",
      isoNow,
      isoNow,
    ],
  });

  // Client 2 Monthly cycle (Nov 1 - Nov 30: Paid Complete)
  const cyc2Id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO monthly_cycles (id, client_id, period_start, period_end, amount, paid_amount, payment_status, due_date, paid_at, days_late, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      cyc2Id,
      c2Id,
      "2026-11-01",
      "2026-11-30",
      75000,
      75000,
      "paid",
      "2026-11-05",
      "2026-11-02",
      0,
      "Paid on time via Meezan Bank",
      isoNow,
      isoNow,
    ],
  });

  // Client 2 Extra Project: "Custom Portal Microservice"
  const p2Id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO projects (id, client_id, title, category, description, is_extra_project, status, discount, discount_type, total_amount, paid_amount, payment_status, due_date, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      p2Id,
      c2Id,
      "Custom Portal Microservice",
      "software_engineering",
      "Extra backend module requested outside of the monthly retainer scope.",
      1,
      "in_progress",
      5000,
      "fixed",
      85000,
      35000,
      "partial",
      "2026-11-20",
      isoNow,
      isoNow,
    ],
  });

  // Project 2 Items
  await db.execute({
    sql: `INSERT INTO project_items (id, project_id, item_type, quantity, unit_price, total_price, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      p2Id,
      "API Auth & RBAC Module",
      1,
      40000,
      40000,
      "OAuth2 + JWT integration",
      isoNow,
    ],
  });
  await db.execute({
    sql: `INSERT INTO project_items (id, project_id, item_type, quantity, unit_price, total_price, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      p2Id,
      "Data Synchronization Cron Engine",
      1,
      50000,
      50000,
      "Scheduled jobs & sync pipelines",
      isoNow,
    ],
  });

  // Client 3: Per Project Graphic Design Client
  const c3Id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO clients (id, name, email, phone, business_name, category, billing_type, monthly_amount, cycle_reset_day, status, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      c3Id,
      "Ayesha Tariq",
      "ayesha@zeenatcare.com",
      "03335557788",
      "Zeenat Naturals",
      "graphic_design",
      "per_project",
      0,
      1,
      "active",
      "Organic skincare brand. Projects charged strictly per post & asset count.",
      isoNow,
      isoNow,
    ],
  });

  // Project for Client 3: "Fall Festive Campaign"
  const p3Id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO projects (id, client_id, title, category, description, is_extra_project, status, discount, discount_type, total_amount, paid_amount, payment_status, due_date, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      p3Id,
      c3Id,
      "Fall Festive Social Campaign",
      "graphic_design",
      "Complete social media graphics pack for product launch across Instagram & Facebook.",
      0,
      "in_progress",
      3000,
      "fixed",
      54000,
      20000,
      "partial",
      "2026-11-15",
      isoNow,
      isoNow,
    ],
  });

  // Deliverables breakdown for Project 3
  await db.execute({
    sql: `INSERT INTO project_items (id, project_id, item_type, quantity, unit_price, total_price, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      p3Id,
      "Multi-Slide Carousel Post",
      6,
      3500,
      21000,
      "5-7 slides each with typography & 3D mockups",
      isoNow,
    ],
  });
  await db.execute({
    sql: `INSERT INTO project_items (id, project_id, item_type, quantity, unit_price, total_price, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      p3Id,
      "Single Feed Static Graphic",
      10,
      1800,
      18000,
      "Product showcase & discount announcements",
      isoNow,
    ],
  });
  await db.execute({
    sql: `INSERT INTO project_items (id, project_id, item_type, quantity, unit_price, total_price, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      p3Id,
      "Animated Reel / Motion Asset",
      3,
      6000,
      18000,
      "15-second kinetic text promo reel",
      isoNow,
    ],
  });

  // Client 4: Graphic Design Client who pays late (Reset day 21)
  const c4Id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO clients (id, name, email, phone, business_name, category, billing_type, monthly_amount, cycle_reset_day, status, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      c4Id,
      "Hamza Zubair",
      "hamza@urbanbites.pk",
      "03456789012",
      "Urban Bites Cafe",
      "graphic_design",
      "monthly",
      38000,
      21,
      "active",
      "Food chain social media retainers. Usually requires follow-up reminders.",
      isoNow,
      isoNow,
    ],
  });

  // Client 4 Past Cycle (Late Paid - 11 days late)
  await db.execute({
    sql: `INSERT INTO monthly_cycles (id, client_id, period_start, period_end, amount, paid_amount, payment_status, due_date, paid_at, days_late, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      c4Id,
      "2026-09-21",
      "2026-10-20",
      38000,
      38000,
      "late_paid",
      "2026-09-28",
      "2026-10-09",
      11,
      "Paid 11 days late after repeated follow-up.",
      isoNow,
      isoNow,
    ],
  });

  // Client 4 Current Cycle (Oct 21 - Nov 20: Unpaid, Overdue)
  await db.execute({
    sql: `INSERT INTO monthly_cycles (id, client_id, period_start, period_end, amount, paid_amount, payment_status, due_date, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      c4Id,
      "2026-10-21",
      "2026-11-20",
      38000,
      0,
      "unpaid",
      "2026-10-28",
      "Cycle reset on 21st Oct. Payment overdue.",
      isoNow,
      isoNow,
    ],
  });

  // Client 5: Website Development Client
  const c5Id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO clients (id, name, email, phone, business_name, category, billing_type, monthly_amount, cycle_reset_day, status, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      c5Id,
      "Dr. Zeeshan Haider",
      "zeeshan@haiderclinic.pk",
      "03014433221",
      "Haider Aesthetic Clinic",
      "web_development",
      "per_project",
      0,
      1,
      "active",
      "Full stack clinic appointment booking & portfolio website.",
      isoNow,
      isoNow,
    ],
  });

  const p5Id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO projects (id, client_id, title, category, description, is_extra_project, status, discount, discount_type, total_amount, paid_amount, payment_status, due_date, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      p5Id,
      c5Id,
      "Next.js Aesthetic Clinic Booking Platform",
      "web_development",
      "Modern responsive website with patient calendar booking, WhatsApp chat integration, and treatment galleries.",
      0,
      "in_progress",
      10000,
      "fixed",
      140000,
      70000,
      "partial",
      "2026-11-25",
      isoNow,
      isoNow,
    ],
  });

  await db.execute({
    sql: `INSERT INTO project_items (id, project_id, item_type, quantity, unit_price, total_price, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      p5Id,
      "Responsive UI & Landing Pages",
      5,
      18000,
      90000,
      "Home, Treatments, About, Gallery, Contact",
      isoNow,
    ],
  });
  await db.execute({
    sql: `INSERT INTO project_items (id, project_id, item_type, quantity, unit_price, total_price, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      p5Id,
      "Doctor Appointment Scheduling System",
      1,
      60000,
      60000,
      "Interactive time-slot selector and SMS/WhatsApp booking confirmation",
      isoNow,
    ],
  });

  // Create notifications for reset cycles
  await db.execute({
    sql: `INSERT INTO notifications (id, type, client_id, title, message, link, is_read, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      "cycle_reset",
      c1Id,
      "Monthly Cycle Reset: Apex Brands",
      "Apex Brands monthly cycle reset on Oct 18. Payment of Rs. 45,000 is due and has not been marked as received.",
      `/clients/${c1Id}`,
      0,
      "2026-10-18T00:00:00.000Z",
    ],
  });

  await db.execute({
    sql: `INSERT INTO notifications (id, type, client_id, title, message, link, is_read, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      "payment_late",
      c4Id,
      "Payment Overdue: Urban Bites Cafe",
      "Urban Bites Cafe monthly cycle reset on Oct 21. Payment of Rs. 38,000 is now overdue.",
      `/clients/${c4Id}`,
      0,
      "2026-10-29T00:00:00.000Z",
    ],
  });

  // Seed sample invoice
  const invId = crypto.randomUUID();
  const invoiceItems = [
    { name: "Multi-Slide Carousel Post", quantity: 6, unitPrice: 3500, total: 21000 },
    { name: "Single Feed Static Graphic", quantity: 10, unitPrice: 1800, total: 18000 },
    { name: "Animated Reel / Motion Asset", quantity: 3, unitPrice: 6000, total: 18000 },
  ];
  await db.execute({
    sql: `INSERT INTO invoices (
      id, invoice_number, client_id, project_id, issue_date, due_date,
      status, subtotal, discount, grand_total, paid_amount, currency,
      show_breakdown, include_bank_info, include_monthly_retainer, items_json, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      invId,
      "TE-INV-2026-001",
      c3Id,
      p3Id,
      "2026-11-01",
      "2026-11-15",
      "partial",
      57000,
      3000,
      54000,
      20000,
      "PKR",
      1,
      1,
      0,
      JSON.stringify(invoiceItems),
      "Thank you for your business. Please settle the remaining balance by the due date.",
      isoNow,
      isoNow,
    ],
  });

  console.log("Seeding completed successfully!");
}

seed();
