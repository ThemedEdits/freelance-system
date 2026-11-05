import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const res = await db.execute(
      "SELECT * FROM company_settings WHERE id = 'default'"
    );

    if (res.rows.length === 0) {
      return NextResponse.json({
        settings: {
          id: "default",
          company_name: "Themed Edits",
          tagline: "Graphic Design • Web Development • Software Engineering",
          email: "themed.edits.co@gmail.com",
          whatsapp: "03323954620",
          instagram: "themed.edits.te",
          bank_name: "Meezan Bank",
          account_title: "Themed Edits",
          account_number: "01020304050607",
          iban: "PK64MEZN0000000102030405",
          easypaisa_title: "Hammad Ahmed",
          easypaisa_number: "03323954620",
          currency: "PKR",
          currency_symbol: "Rs.",
        },
      });
    }

    return NextResponse.json({ settings: res.rows[0] });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      company_name,
      tagline,
      email,
      whatsapp,
      instagram,
      bank_name,
      account_title,
      account_number,
      iban,
      easypaisa_title,
      easypaisa_number,
      currency,
      currency_symbol,
    } = body;

    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE company_settings SET
        company_name = COALESCE(?, company_name),
        tagline = COALESCE(?, tagline),
        email = COALESCE(?, email),
        whatsapp = COALESCE(?, whatsapp),
        instagram = COALESCE(?, instagram),
        bank_name = COALESCE(?, bank_name),
        account_title = COALESCE(?, account_title),
        account_number = COALESCE(?, account_number),
        iban = COALESCE(?, iban),
        easypaisa_title = COALESCE(?, easypaisa_title),
        easypaisa_number = COALESCE(?, easypaisa_number),
        currency = COALESCE(?, currency),
        currency_symbol = COALESCE(?, currency_symbol),
        updated_at = ?
      WHERE id = 'default'`,
      args: [
        company_name,
        tagline,
        email,
        whatsapp,
        instagram,
        bank_name,
        account_title,
        account_number,
        iban,
        easypaisa_title,
        easypaisa_number,
        currency,
        currency_symbol,
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Company settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: error.message },
      { status: 500 }
    );
  }
}
