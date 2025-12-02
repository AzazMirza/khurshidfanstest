import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// export async function POST(req: Request) {
//   try {
//     const { userId, guestId, address, phoneNumber, firstName,lastName, email, shippingMethod} = await req.json();

//     if (!userId && !guestId) {
//       return NextResponse.json(
//         { error: "Missing userId or guestId" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!address || !phoneNumber) {
//       return NextResponse.json(
//         { error: "Address and phoneNumber are required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Fetch cart items
//     const cartItems = await prisma.cartItem.findMany({
//       where: userId != null ? { userId } : { guestId },
//       include: { product: true },
//     });

//     if (cartItems.length === 0) {
//       return NextResponse.json(
//         { error: "Cart is empty" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Calculate total
//     const totalAmount = cartItems.reduce(
//       (sum, item) => sum + item.product.price * item.quantity,
//       0
//     );

//     // Create order
//     const order = await prisma.order.create({
//       data: {
//         userId: userId || null,
//         guestId: guestId || null,
//         totalAmount,
//         firstName,
//         lastName,
//         address,
//         phoneNumber,
//         email,
//         shippingMethod,
//         orderItems: {
//           create: cartItems.map((item) => ({
//             productId: item.productId,
//             quantity: item.quantity,
//             price: item.product.price,
//           })),
//         },
//       },
//       include: { orderItems: { include: { product: true } } },
//     });

//     const orderId = order.id;

//     // Generate WhatsApp message
//     const message = `Send to confirm your order!\nOrder ID: ${orderId}\nFirstName: ${firstName}\nLastName: ${lastName}\nPhoneNumber: ${phoneNumber}\nTotal Amount: Rs. ${totalAmount}`;
//     const encodedMessage = encodeURIComponent(message);

//     // Admin WhatsApp number
//     const waLink = `https://wa.me/923058491064?text=${encodedMessage}`;

//     // Delete cart items AFTER order success
//     await prisma.cartItem.deleteMany({
//       where: userId != null ? { userId } : { guestId },
//     });

//     // FINAL RESPONSE
//     return NextResponse.json(
//       {
//         success: true,
//         message: "Checkout successful",
//         order,
//         waLink,
//       },
//       { headers: corsHeaders }
//     );
//   } catch (error: any) {
//     console.error("Checkout Error:", error);
//     return NextResponse.json(
//       { error: error.message || "Checkout failed" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

export async function POST(req: Request) {
  try {
    const { userId, guestId, email, address, phoneNumber, firstName, lastName } = await req.json();

    if (!userId && !guestId) {
      return NextResponse.json(
        { error: "Missing userId or guestId" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!email || !address || !phoneNumber) {
      return NextResponse.json(
        { error: "Email, address and phoneNumber are required" },
        { status: 400, headers: corsHeaders }
      );
    }
 
    // Fetch cart items
    const cartItems = await prisma.cartItem.findMany({
      where: userId != null ? { userId } : { guestId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        guestId: guestId || null,
        totalAmount,
        firstName,
        lastName,
        email,
        address,
        phoneNumber,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { orderItems: { include: { product: true } } },
    });

    const orderId = order.id;

    // Generate WhatsApp message (optional)
    const waMessage = `Send to confirm your order!\nOrder ID: ${orderId}\nFirstName: ${firstName}\nLastName: ${lastName}\nPhoneNumber: ${phoneNumber}\nTotal Amount: Rs. ${totalAmount}`;
    const encodedMessage = encodeURIComponent(waMessage);
    const waLink = `https://wa.me/923058491064?text=${encodedMessage}`;

    // Delete cart items
    await prisma.cartItem.deleteMany({
      where: userId != null ? { userId } : { guestId },
    });

    // SEND EMAIL TO CUSTOMER
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const emailHtml = `
        <h2>Order Confirmation - Khurshid Fans</h2>
        <p>Hi <strong>${firstName} ${lastName}</strong>, thank you for your order.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total Amount:</strong> Rs. ${totalAmount}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>
        <p><strong>Address:</strong> ${address}</p>
        <br/>
        <h3>Order Items</h3>
        <ul>
          ${order.orderItems
            .map(
              (item) => `<li>${item.product.name} - Qty: ${item.quantity} - Rs. ${item.price}</li>`
            )
            .join("")}
        </ul>
      `;

      await transporter.sendMail({
        from: `"Khurshid Fans" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Order Confirmation - ID ${orderId}`,
        html: emailHtml,
      });

      console.log("✓ Email sent to customer successfully");
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }

    // FINAL RESPONSE
    return NextResponse.json(
      {
        success: true,
        message: "Checkout successful",
        order,
        waLink,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const guestId = url.searchParams.get("guestId");

    const whereClause: any = {};
    if (userId) whereClause.userId = Number(userId);
    if (guestId) whereClause.guestId = guestId;

    const orders = await prisma.order.findMany({
      where: Object.keys(whereClause).length ? whereClause : undefined,
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500, headers: corsHeaders }
    );
  }
}
