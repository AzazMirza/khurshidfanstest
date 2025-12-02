import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight (CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const skip = (currentPage - 1) * limit;

    // Build the filter
    const where: any = search
      ? {
          OR: [
            { phoneNumber: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined;

    // Handle enum status search separately
    const statusValues = ["PENDING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"];
    const upperSearch = search.toUpperCase();
    if (statusValues.includes(upperSearch)) {
      if (!where?.OR) where.OR = [];
      where.OR.push({ status: upperSearch });
    }

    // Fetch orders and total count in parallel
    const [data, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json(
      {
        data,
        totalOrders,
        currentPage,
        totalPages,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("GET /orders error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500, headers: corsHeaders }
    );
  }
}




// PUT → Update order status
// export async function PUT(req: Request) {
//   try {
//     const { orderId, status } = await req.json();

//     if (!orderId || !status)
//       return NextResponse.json({ error: "Missing orderId or status" }, { status: 400, headers: corsHeaders });

//     const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];
//     if (!validStatuses.includes(status))
//       return NextResponse.json({ error: "Invalid status" }, { status: 400, headers: corsHeaders });

//     const updatedOrder = await prisma.order.update({
//       where: { id: orderId },
//       data: { status },
//       include: {
//         user: {
//           select: { id: true, name: true, email: true, phone: true },
//         },
//         orderItems: {
//           include: { product: true },
//         },
//       },
//     });

//     return NextResponse.json(
//       { message: `Order status updated to ${status}`, order: updatedOrder },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     console.error("Error updating order status:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to update status" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }



export async function PUT(req: Request) {
  try {
    const { orderId, status } = await req.json();

    if (!orderId || !status)
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400, headers: corsHeaders });

    const validStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400, headers: corsHeaders });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        orderItems: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(
      { message: `Order status updated to ${status}`, order: updatedOrder },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update status" },
      { status: 500, headers: corsHeaders }
    );
  }
}
