// app/api/google-signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { credential } = await req.json();
    const decoded: any = jwt.decode(credential);
    if (!decoded?.email) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

    let user = await prisma.user.findUnique({ where: { email: decoded.email } });

    if (!user) {
      user = await prisma.user.create({
        data: { name: decoded.name, email: decoded.email, password: "google-oauth" },
      });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
