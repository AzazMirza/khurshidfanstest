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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviewId = Number(id);

  if (isNaN(reviewId)) {
    return NextResponse.json(
      { error: "Invalid review ID" },
      { status: 400, headers: corsHeaders }
    );
  }

  const review = await prisma.productReview.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    return NextResponse.json(
      { error: "Review not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  await prisma.productReview.delete({ where: { id: reviewId } });

  return NextResponse.json(
    { success: true, message: "Review deleted by admin" },
    { headers: corsHeaders }
  );
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { reviewTitle, reviewDec, rating } = body;

    // At least one field is required
    if (!reviewTitle && !reviewDec && rating === undefined) {
      return NextResponse.json(
        { error: "At least one field is required to update" },
        { status: 400, headers: corsHeaders }
      );
    }

    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Admin can update any review
    const updatedReview = await prisma.productReview.update({
      where: { id: reviewId },
      data: {
        reviewTitle: reviewTitle ?? review.reviewTitle,
        reviewDec: reviewDec ?? review.reviewDec,
        rating: rating ?? review.rating,
      },
    });

    return NextResponse.json(
      { success: true, review: updatedReview },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Admin Update Review Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
