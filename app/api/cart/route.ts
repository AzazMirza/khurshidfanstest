import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid"; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET → Fetch user's cart
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const guestId = searchParams.get("guestId");

    if (!userId && !guestId) {
      return NextResponse.json(
        { error: "userId or guestId required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        ...(userId ? { userId: Number(userId) } : { guestId }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            sku: true,
          },
        },
      },
    });

    // Flatten product fields to top-level
    const formattedCart = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      productId: item.product.id,
      sku: item.product.sku,
    }));

    return NextResponse.json(formattedCart, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get cart" },
      { status: 500, headers: corsHeaders }
    );
  }
}


// POST → Add item to cart
export async function POST(req: Request) {
  try {
    const { userId, productId, quantity, size, color, guestId } = await req.json();

    if (!productId)
      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400, headers: corsHeaders }
      );

    let finalGuestId = guestId;

    // If user not logged in, we create guest session
    if (!userId) {
      if (!guestId) {
        finalGuestId = uuid(); 
      }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product)
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers: corsHeaders }
      );

    // Find existing cart item (depending on user state)
    const existing = await prisma.cartItem.findFirst({
      where: {
        productId,
        ...(userId ? { userId } : { guestId: finalGuestId }),
      },
    });

    let cartItem;

    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (quantity || 1) },
        include: { product: true },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: userId || null,
          guestId: userId ? null : finalGuestId,
          productId,
          size,
          color,
          quantity: quantity || 1,
        },
        include: { product: true },
      });
    }

    return NextResponse.json(
      { cartItem, guestId: finalGuestId },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add to cart" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT → Update cart item quantity or other fields
// export async function PUT(req: Request) {
//   try {
//     const { cartItemId, quantity, color, size } = await req.json();

//     if (!cartItemId)
//       return NextResponse.json(
//         { error: "Missing cartItemId" },
//         { status: 400, headers: corsHeaders }
//       );

//     const existing = await prisma.cartItem.findUnique({
//       where: { id: cartItemId },
//     });

//     if (!existing)
//       return NextResponse.json(
//         { error: "Cart item not found" },
//         { status: 404, headers: corsHeaders }
//       );

//     const updated = await prisma.cartItem.update({
//       where: { id: cartItemId },
//       data: {
//         quantity: quantity ?? existing.quantity,
//         color: color ?? existing.color,
//         size: size ?? existing.size,
//       },
//       include: { product: true },
//     });

//     return NextResponse.json(updated, { headers: corsHeaders });
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || "Failed to update cart item" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }
// PUT → Update cart item (with ownership check)
export async function PUT(req: Request) {
  try {
    const { id, change, userId, guestId } = await req.json();

    if (!id || !change)
      return NextResponse.json(
        { error: "id and change (+1 or -1) required" },
        { status: 400, headers: corsHeaders }
      );

    const item = await prisma.cartItem.findUnique({ where: { id } });

    if (!item)
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404, headers: corsHeaders }
      );

    // Protect ownership
    if (item.userId && String(item.userId) !== userId) {
      return NextResponse.json(
        { error: "Unauthorized update attempt" },
        { status: 403, headers: corsHeaders }
      );
    }

    if (item.guestId && item.guestId !== guestId) {
      return NextResponse.json(
        { error: "Unauthorized update attempt" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Calculate new quantity
    const updatedQty = item.quantity + change;

    // Quantity cannot go below 1
    if (updatedQty < 1) {
      return NextResponse.json(
        { error: "Minimum quantity is 1" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: updatedQty },
    });

    return NextResponse.json(
      { success: true, item: updated },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update quantity" },
      { status: 500, headers: corsHeaders }
    );
  }
}




// // PUT → Update quantity
// export async function PUT(req: Request) {
//   try {
//     const { cartItemId, quantity } = await req.json();

//     if (!cartItemId || quantity < 1)
//       return NextResponse.json(
//         { error: "Invalid data" },
//         { status: 400, headers: corsHeaders }
//       );

//     const updated = await prisma.cartItem.update({
//       where: { id: cartItemId },
//       data: { quantity },
//       include: { product: true },
//     });

//     return NextResponse.json(updated, { headers: corsHeaders });
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || "Failed to update item" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// DELETE → Remove single item
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = Number(searchParams.get("id"));
    const userId = searchParams.get("userId");
    const guestId = searchParams.get("guestId");

    if (!id)
      return NextResponse.json(
        { success: false, error: "cartItem id required" },
        { status: 400, headers: corsHeaders }
      );

    // Find item first
    const item = await prisma.cartItem.findUnique({ where: { id } });

    if (!item)
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404, headers: corsHeaders }
      );

    // Protect ownership
    if (item.userId && String(item.userId) !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized delete attempt" },
        { status: 403, headers: corsHeaders }
      );
    }

    if (item.guestId && item.guestId !== guestId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized delete attempt" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Safe delete
    await prisma.cartItem.delete({ where: { id } });

    return NextResponse.json(
      {
        success: true,
        message: "Item deleted successfully",
        deletedItemId: id,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete item" },
      { status: 500, headers: corsHeaders }
    );
  }
}

