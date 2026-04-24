import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await getCurrentUser("ADMIN")
    const pending = await prisma.user.findMany({
      where: { registrationStatus: "PENDING" },
      select: {
        id: true,
        name: true,
        email: true,
        organisation: true,
        mobileNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ pending })
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { id, status } = await req.json()

    if (!id || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { registrationStatus: status },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}