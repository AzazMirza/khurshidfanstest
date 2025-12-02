import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const currentPage = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (currentPage - 1) * limit;

    // Count total reviews
    const totalReviews = await prisma.productReview.count();

    // Fetch paginated reviews
    const data = await prisma.productReview.findMany({
      orderBy: { id: "desc" },
      skip,
      take: limit,
      include: {
        product: true,
        user: true,
      },
    });

    const totalPages = Math.ceil(totalReviews / limit);

    return NextResponse.json(
      {
        success: true,
        data,
        totalReviews,
        currentPage,
        totalPages,
      },
      { headers: corsHeaders }
    );

  } catch (err: any) {
    console.error("Admin Get All Reviews Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
