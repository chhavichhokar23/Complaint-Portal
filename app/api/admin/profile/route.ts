import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function getAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")
  if (!session) return null

  const user = await prisma.user.findUnique({ where: { id: session.value } })
  if (!user || user.role !== "ADMIN") return null
  return user
}

// PATCH — update profile (name, mobileNumber)
export async function PATCH(req: Request) {
  try {
    const user = await getAdmin()
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { name, mobileNumber } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        mobileNumber: mobileNumber?.trim() || null,
      },
    })

    return NextResponse.json({ success: true, user: { name: updated.name, mobileNumber: updated.mobileNumber } })
  } catch {
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 })
  }
}

// PUT — change password
export async function PUT(req: Request) {
  try {
    const user = await getAdmin()
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new password are required." }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 })
    }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 })
  }
}
