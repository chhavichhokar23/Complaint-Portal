import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await getCurrentUser("ADMIN")
    const [slaRules, settings] = await Promise.all([
      prisma.slaMaster.findMany({
        include: { organisation: true, priority: true },
        orderBy: { organisation: { name: "asc" } },
      }),
      prisma.systemSettings.findUnique({ 
        where: { id: "system" },
        include: { defaultPriority: true }
      }),
    ])
    return NextResponse.json({ slaRules, settings })
  } catch {
    return NextResponse.json({ error: "Failed to fetch SLA rules" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { organisationId, priorityId, timeline } = await req.json()

    if (!organisationId || !priorityId || !timeline) {
      return NextResponse.json({ error: "Organisation, priority and timeline are required." }, { status: 400 })
    }
    if (typeof timeline !== "number" || timeline <= 0) {
      return NextResponse.json({ error: "Timeline must be a positive number of hours." }, { status: 400 })
    }

    const slaRule = await prisma.slaMaster.create({
      data: { organisationId, priorityId, timeline },
      include: { organisation: true, priority: true },
    })

    return NextResponse.json({ success: true, slaRule }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "SLA rule already exists for this organisation and priority." }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create SLA rule" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "SLA rule id is required." }, { status: 400 })
    }

    await prisma.slaMaster.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete SLA rule" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { id, timeline, defaultSlaHours, defaultPriorityId } = await req.json()

    // updating system settings
    if (defaultSlaHours !== undefined || defaultPriorityId !== undefined) {
      const updated = await prisma.systemSettings.upsert({
        where: { id: "system" },
        create: {
          id: "system",
          defaultSlaHours: defaultSlaHours ?? 72,
          defaultPriorityId: defaultPriorityId ?? null,
        },
        update: {
          ...(defaultSlaHours !== undefined ? { defaultSlaHours } : {}),
          ...(defaultPriorityId !== undefined ? { defaultPriorityId } : {}),
        },
        include: { defaultPriority: true }
      })
      return NextResponse.json({ success: true, settings: updated })
    }

    // updating a specific SLA rule
    if (!id || !timeline) {
      return NextResponse.json({ error: "Id and timeline are required." }, { status: 400 })
    }

    const updated = await prisma.slaMaster.update({
      where: { id },
      data: { timeline },
      include: { organisation: true, priority: true },
    })

    return NextResponse.json({ success: true, slaRule: updated })
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}