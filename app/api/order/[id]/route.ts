import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ID
    const orderId = Number(id);
    if (isNaN(orderId) || orderId <= 0 || !Number.isInteger(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID. Must be a positive integer." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch single order — NO user, but include orderItems + product
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                category: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ order }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Single order fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { address, phoneNumber, items, status } = body; 

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Handle items update
    let orderItemsUpdate: any = {};
    let newTotal = 0;

    if (items && items.length > 0) {
      orderItemsUpdate = {
        deleteMany: {}, // remove old items
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.price,
        })),
      };

      newTotal = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
    }

    // Update order including status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(address && { address }),
        ...(phoneNumber && { phoneNumber }),
        ...(items && { totalAmount: newTotal }),
        ...(items && { orderItems: orderItemsUpdate }),
        ...(status && { status }), // ⬅️ Status update here
      },
      include: {
        user: true,
        orderItems: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order updated successfully by admin",
        order: updatedOrder,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Admin Update Order Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500, headers: corsHeaders }
    );
  }
}





// no status update in this code only update fields
// export async function PUT(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const orderId = Number(id);

//     if (isNaN(orderId)) {
//       return NextResponse.json(
//         { error: "Invalid order ID" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const body = await req.json();
//     const { address, phoneNumber, items } = body; // ⬅️ Removed "status" from here

//     // Handle items update
//     let orderItemsUpdate = {};
//     let newTotal = 0;

//     if (items && items.length > 0) {
//       orderItemsUpdate = {
//         deleteMany: {}, // remove old items
//         create: items.map((item: any) => ({
//           productId: item.productId,
//           quantity: item.quantity,
//           size: item.size,
//           color: item.color,
//           price: item.price,
//         })),
//       };

//       newTotal = items.reduce(
//         (sum: number, item: any) => sum + item.price * item.quantity,
//         0
//       );
//     }

//     // Update order WITHOUT status
//     const updatedOrder = await prisma.order.update({
//       where: { id: orderId },
//       data: {
//         ...(address && { address }),
//         ...(phoneNumber && { phoneNumber }),
//         ...(items && { totalAmount: newTotal }),
//         ...(items && { orderItems: orderItemsUpdate }),
//       },
//       include: {
//         user: true,
//         orderItems: true,
//       },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Order updated successfully by admin (excluding status)",
//         order: updatedOrder,
//       },
//       { headers: corsHeaders }
//     );
//   } catch (error: any) {
//     console.error("Admin Update Order Error:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to update order" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }
