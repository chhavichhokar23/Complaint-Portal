import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    if (user.registrationStatus === "PENDING") {
      return NextResponse.json({ message: "Your account is awaiting admin approval." }, { status: 403 })
    }
    if (user.registrationStatus === "REJECTED") {
      return NextResponse.json({ message: "Your account has been rejected. Please contact support." }, { status: 403 })
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }
    const response = NextResponse.json({
      message: "Login successful",
      id: user.id,
      role: user.role,
    });
    response.cookies.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/" });

    return response;


  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}