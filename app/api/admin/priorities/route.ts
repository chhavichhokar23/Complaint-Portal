import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await getCurrentUser("ADMIN")

    const priorities = await prisma.priorityMaster.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ priorities })
  } catch {
    return NextResponse.json({ error: "Failed to fetch priorities" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { name, slaHours } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: "Priority name is required." }, { status: 400 })
    }

    const priority = await prisma.priorityMaster.create({
      data: {
        name: name.trim().toUpperCase(),
        slaHours: slaHours ? Number(slaHours) : null,
      },
    })

    return NextResponse.json({ success: true, priority }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Priority already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create priority" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { id, name, slaHours } = await req.json()

    if (!id || !name?.trim()) {
      return NextResponse.json({ error: "Id and name are required." }, { status: 400 })
    }

    const updated = await prisma.priorityMaster.update({
      where: { id },
      data: {
        name: name.trim().toUpperCase(),
        slaHours: slaHours ? Number(slaHours) : null,
      },
    })

    return NextResponse.json({ success: true, priority: updated })
  } catch {
    return NextResponse.json({ error: "Failed to update priority" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Priority id is required." }, { status: 400 })
    }

    await prisma.priorityMaster.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete priority" }, { status: 500 })
  }
}