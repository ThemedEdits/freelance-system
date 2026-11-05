import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log("Connecting to Turso database:", url);

const db = createClient({
  url,
  authToken,
});

async function main() {
  try {
    console.log("Creating tables if they don't exist...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        business_name TEXT,
        category TEXT NOT NULL DEFAULT 'graphic_design',
        billing_type TEXT NOT NULL DEFAULT 'monthly',
        monthly_amount REAL DEFAULT 0,
        cycle_reset_day INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active',
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'graphic_design',
        description TEXT,
        is_extra_project INTEGER DEFAULT 0,
        status TEXT DEFAULT 'in_progress',
        discount REAL DEFAULT 0,
        discount_type TEXT DEFAULT 'fixed',
        total_amount REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        payment_status TEXT DEFAULT 'unpaid',
        due_date TEXT,
        paid_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS project_items (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        item_type TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        total_price REAL NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS monthly_cycles (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        amount REAL NOT NULL,
        paid_amount REAL DEFAULT 0,
        payment_status TEXT DEFAULT 'unpaid',
        due_date TEXT NOT NULL,
        paid_at TEXT,
        days_late INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoice_number TEXT NOT NULL UNIQUE,
        client_id TEXT NOT NULL,
        project_id TEXT,
        cycle_id TEXT,
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT DEFAULT 'sent',
        subtotal REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        grand_total REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        currency TEXT DEFAULT 'PKR',
        show_breakdown INTEGER DEFAULT 1,
        include_bank_info INTEGER DEFAULT 1,
        include_monthly_retainer INTEGER DEFAULT 0,
        items_json TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        client_id TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        company_name TEXT DEFAULT 'Themed Edits',
        tagline TEXT DEFAULT 'Graphic Design • Web Development • Software Engineering',
        email TEXT DEFAULT 'themed.edits.co@gmail.com',
        whatsapp TEXT DEFAULT '03323954620',
        instagram TEXT DEFAULT 'themed.edits.te',
        bank_name TEXT DEFAULT 'Meezan Bank',
        account_title TEXT DEFAULT 'Themed Edits',
        account_number TEXT DEFAULT '01020304050607',
        iban TEXT DEFAULT 'PK64MEZN0000000102030405',
        easypaisa_title TEXT DEFAULT 'Hammad Ahmed',
        easypaisa_number TEXT DEFAULT '03323954620',
        currency TEXT DEFAULT 'PKR',
        currency_symbol TEXT DEFAULT 'Rs.',
        updated_at TEXT NOT NULL
      );
    `);

    // Insert default settings if not exists
    const settingsCheck = await db.execute("SELECT id FROM company_settings WHERE id = 'default'");
    if (settingsCheck.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO company_settings (
          id, company_name, tagline, email, whatsapp, instagram,
          bank_name, account_title, account_number, iban,
          easypaisa_title, easypaisa_number, currency, currency_symbol, updated_at
        ) VALUES (
          'default', 'Themed Edits', 'Graphic Design • Web Development • Software Engineering',
          'themed.edits.co@gmail.com', '03323954620', 'themed.edits.te',
          'Meezan Bank', 'Themed Edits', '01020304050607', 'PK64MEZN0000000102030405',
          'Hammad Ahmed', '03323954620', 'PKR', 'Rs.', ?
        )`,
        args: [new Date().toISOString()],
      });
      console.log("Default company settings seeded.");
    }

    console.log("Database schema successfully verified and initialized on Turso!");
  } catch (err) {
    console.error("Database initialization error:", err);
    process.exit(1);
  }
}

main();
