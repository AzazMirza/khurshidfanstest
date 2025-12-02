import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = Number(searchParams.get("orderId"));

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { phoneNumber, totalAmount } = order;

    const message = `Send to confirm your order!\nOrder ID: ${orderId}\nTotal Amount: Rs. ${totalAmount}`;
    const encodedMessage = encodeURIComponent(message);

    const waLink = `https://wa.me/923058491064?text=${encodedMessage}`;

    return NextResponse.json({ waLink });
  } catch (error) {
    console.error("WhatsApp link error:", error);
    return NextResponse.json(
      { error: "Failed to generate link" },
      { status: 500 }
    );
  }
}
