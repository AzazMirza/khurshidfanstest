import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Google Sign-up Flow
    if (body.credential) {
      const { credential } = body;

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload?.email) {
        return NextResponse.json(
          { error: "Invalid Google credential" },
          { status: 400 }
        );
      }

      const { email, name, picture } = payload;

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: { name: name || "Google User", email, password: "" },
        });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const cookieStore = await cookies();
      cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        type: "google",
        user: { id: user.id, name: user.name, email: user.email, image: picture },
      });
    }

    // ✅ Normal Signup
    const { name, identifier, password } = body;
    if (!name || !identifier || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const existingUser = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier },
    });

    if (existingUser)
      return NextResponse.json({ error: "User already exists" }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: isEmail ? identifier : null,
        phone: !isEmail ? identifier : null,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      type: "normal",
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error: any) {
    console.error("Signup Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
