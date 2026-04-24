import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await getCurrentUser("ADMIN")
    const organisations = await prisma.organisationMaster.findMany({
      include: { defaultPriority: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ organisations })
  } catch {
    return NextResponse.json({ error: "Failed to fetch organisations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { name, defaultPriorityId } = await req.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Organisation name is required." }, { status: 400 })
    }

    const organisation = await prisma.organisationMaster.create({
      data: {
        name: name.trim(),
        defaultPriorityId: defaultPriorityId || null,
      },
      include: { defaultPriority: true },
    })

    return NextResponse.json({ success: true, organisation }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Organisation already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create organisation" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Organisation id is required." }, { status: 400 })
    }

    await prisma.organisationMaster.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete organisation" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { id, name, defaultPriorityId } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Id is required." }, { status: 400 })
    }

    const updated = await prisma.organisationMaster.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(defaultPriorityId !== undefined ? { defaultPriorityId } : {}),
      },
      include: { defaultPriority: true },
    })

    return NextResponse.json({ success: true, organisation: updated })
  } catch {
    return NextResponse.json({ error: "Failed to update organisation" }, { status: 500 })
  }
}