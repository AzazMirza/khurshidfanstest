import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Function to update average rating
async function updateProductAverageRating(productId: number) {
  const reviews = await prisma.productReview.findMany({
    where: { productId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { rating: 0 },
    });
    return;
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const roundedRating = Math.round(avgRating * 10) / 10;

  await prisma.product.update({
    where: { id: productId },
    data: { rating: roundedRating },
  });
}

// POST — Create Review (with required userId)
export async function POST(req: Request) {
  try {
    const { productId, rating, reviewTitle, reviewDec, userId } =
      await req.json();

    // Validate required fields
    if (!productId || !rating || !userId) {
      return NextResponse.json(
        { error: "productId, rating, and userId are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please login" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Prevent duplicate reviews
    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId: Number(productId),
        userId: Number(userId),
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create review
    const review = await prisma.productReview.create({
      data: {
        productId: Number(productId),
        rating: numericRating,
        reviewTitle,
        reviewDec,
        userId: Number(userId),
      },
    });

    await updateProductAverageRating(Number(productId));

    return NextResponse.json(review, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Review Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add review" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET — Get reviews for a product (with avatars)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const productId = Number(searchParams.get("productId"));
    const currentPage = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (currentPage - 1) * limit;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get total review count
    const totalReviews = await prisma.productReview.count({
      where: { productId },
    });

    // Get paginated reviews
    const reviews = await prisma.productReview.findMany({
      where: { productId },
      orderBy: { id: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    const data = reviews.map((review) => {
      const seed = encodeURIComponent(
        review.user?.name || `Review ${review.id}`
      );
      const avatar = `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&size=64&backgroundColor=0891b2`;

      return { ...review, avatar };
    });

    const totalPages = Math.ceil(totalReviews / limit);

    return NextResponse.json(
      {
        data,
        totalReviews,
        currentPage,
        totalPages,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("GET Review Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";
// import { Prisma } from "@prisma/client";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// // Handle CORS
// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// // Function to update average rating
// async function updateProductAverageRating(productId: number) {
//   // Get all reviews for this product
//   const reviews = await prisma.productReview.findMany({
//     where: { productId },
//     select: { rating: true },
//   });

//   // If no reviews, set rating to 0
//   if (reviews.length === 0) {
//     await prisma.product.update({
//       where: { id: productId },
//       data: { rating: 0 },
//     });
//     return;
//   }

//   // Calculate average rating
//   const avgRating =
//     reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

//     // Round to 1 decimal place
//   const roundedRating = Math.round(avgRating * 10) / 10;

//   // Update product.rating
//   await prisma.product.update({
//     where: { id: productId },
//     data: { rating: roundedRating },
//   });
// }

// // POST — Create Review
// export async function POST(req: Request) {
//   try {
//     const { productId, rating, reviewTitle, reviewDec } = await req.json();

//     if (!productId || !rating) {
//       return NextResponse.json(
//         { error: "productId and rating are required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const numericRating = Number(rating);

//     if (numericRating < 1 || numericRating > 5) {
//       return NextResponse.json(
//         { error: "Rating must be between 1 and 5" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Ensure product exists
//     const product = await prisma.product.findUnique({
//       where: { id: Number(productId) },
//     });

//     if (!product) {
//       return NextResponse.json(
//         { error: "Product not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // Create review
//     const review = await prisma.productReview.create({
//       data: {
//         productId: Number(productId),
//         rating: numericRating,
//         reviewTitle,
//         reviewDec,
//       },
//     });

//     // Update product average rating
//     await updateProductAverageRating(Number(productId));

//     return NextResponse.json(review, {
//       status: 201,
//       headers: corsHeaders,
//     });

//   } catch (error: any) {
//     console.error("Review Error:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to add review" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// // GET — Get All Reviews for a Product (with DiceBear avatar)
// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const productId = Number(searchParams.get("productId"));

//     if (!productId) {
//       return NextResponse.json(
//         { error: "productId is required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const reviews = await prisma.productReview.findMany({
//       where: { productId },
//       orderBy: { id: "desc" },
//     });

//     // Add DiceBear avatar to each review
//     const reviewsWithAvatar = reviews.map((review) => {
//       const seed = encodeURIComponent(review.reviewTitle || `Review ${review.id}`);
//       const avatar = `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&size=64&backgroundColor=0891b2`;

//       return {
//         ...review,
//         avatar,
//       };
//     });

//     return NextResponse.json(reviewsWithAvatar, {
//       status: 200,
//       headers: corsHeaders,
//     });
//   } catch (error: any) {
//     console.error("GET Review Error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch reviews" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }
