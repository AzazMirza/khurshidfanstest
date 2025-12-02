import { NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Global theme variable
let theme = {
  pr: "#009395",
  se: "#fef534",
  tx: "#000000",
  bg: "#ffffff",
};

// Handle OPTIONS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST → update theme colors
export async function POST(req: Request) {
  try {
    const { pr, se, tx, bg } = await req.json();

    if (!pr || !se || !tx || !bg) {
      return NextResponse.json(
        { error: "All 4 colors (pr, se, tx, bg) are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    theme = { pr, se, tx, bg };

    return NextResponse.json(
      { success: true, message: "Theme updated", theme },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: corsHeaders }
    );
  }
}

// GET → return current theme
export async function GET() {
  return NextResponse.json(
    { success: true, theme },
    { headers: corsHeaders }
  );
}
