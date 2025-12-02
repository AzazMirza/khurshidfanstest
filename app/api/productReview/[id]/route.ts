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
    const { userId, reviewTitle, reviewDec, rating } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find the review
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check ownership
    if (review.userId !== Number(userId)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Update review
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
    console.error("User Update Review Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = Number(params.id);
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
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

    if (review.userId !== Number(userId)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403, headers: corsHeaders }
      );
    }

    await prisma.productReview.delete({ where: { id: reviewId } });

    return NextResponse.json(
      { success: true, message: "Review deleted" },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Delete Review Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
