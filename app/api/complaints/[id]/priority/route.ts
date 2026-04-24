import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { priorityId } = await req.json()

    if (!priorityId) {
      return NextResponse.json({ error: "Priority is required" }, { status: 400 })
    }

    // Get complaint with customer's org
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        customer: { include: { organisation: true } },
        resolutions: {
          orderBy: { createdAt: "desc" as const },
          include: { createdBy: { select: { name: true, role: true } } }
        }
      }
    })

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    // Look up SLA rule for org + new priority
    let slaDeadline: Date | null = null

    if (complaint.customer.organisation?.id) {
      const slaRule = await prisma.slaMaster.findUnique({
        where: {
          organisationId_priorityId: {
            organisationId: complaint.customer.organisation.id,
            priorityId,
          }
        }
      })
      if (slaRule) {
        slaDeadline = new Date(Date.now() + slaRule.timeline * 60 * 60 * 1000)
      }
    }

    // Fall back to system defaults if no rule found
    if (!slaDeadline) {
      const settings = await prisma.systemSettings.findUnique({
        where: { id: "system" }
      })
      const hours = settings?.defaultSlaHours ?? 72
      slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000)
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: { priorityId, slaDeadline },
      include: {
        customer: {
          include: {
            organisation: true,
          },
        },
        assignedTo: true,
        priority: true,
        feedbacks: { orderBy: { createdAt: "desc" } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}