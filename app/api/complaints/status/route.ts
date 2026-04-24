import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { ComplaintStatus, Role, ResolutionType } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { complaintId, status, message, internalMessage } = body

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.value },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get complaint
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    })

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    // CUSTOMER cannot change status
    if (user.role === Role.CUSTOMER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // ADMIN: Handle internal message (no status change)
    if (user.role === Role.ADMIN && internalMessage && !status) {
      await prisma.complaintResolution.create({
        data: {
          complaintId,
          message: internalMessage,
          type: ResolutionType.ADMIN_TO_EMPLOYEE,
          createdById: user.id,
        },
      })

      const updated = await prisma.complaint.findUnique({
        where: { id: complaintId },
        include: {
          resolutions: {
            orderBy: { createdAt: "desc" },
            include: { createdBy: { select: { id: true, name: true, role: true } } },
          },
          feedbacks: { orderBy: { createdAt: "desc" } },
          priority: true,
          assignedTo: { select: { id: true, name: true } },
          customer: { 
            select: { 
              id: true,
              name: true,
              organisation: { select: { id: true, name: true } },
            } 
          },
          attachments: true,
        },
      })

      return NextResponse.json(updated)
    }

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // ADMIN: can change to any status
    if (user.role === Role.ADMIN) {
      let updateData: any = { status: status as ComplaintStatus }
      let resolutionType: ResolutionType | null = null
      let resolutionMessage: string | null = null

      if (status === "CLOSED") {
        if (message) {
          updateData.resolutionMessage = message
        }
        resolutionType = ResolutionType.ADMIN_RESOLUTION
        resolutionMessage = message ?? null
      } else if (status === "REJECTED") {
        if (!message) {
          return NextResponse.json({ error: "Message is required for rejection" }, { status: 400 })
        }
        updateData.rejectionReason = message
        updateData.resolutionMessage = null
        resolutionType = ResolutionType.REJECTION
        resolutionMessage = message
      } else if (status === "OPEN") {
        // If complaint has an assigned employee, reopen to ASSIGNED so employee can act on it
        if (complaint.assignedToId) {
          updateData.status = "ASSIGNED" as ComplaintStatus
        }
        resolutionType = ResolutionType.REOPEN_NOTE
        resolutionMessage = message ?? "Ticket reopened"
      } else if (status === "PENDING") {
        updateData.resolutionMessage = null
        updateData.rejectionReason = null
        resolutionType = ResolutionType.REOPEN_NOTE
        resolutionMessage = message ?? "Ticket reopened"
      } else if (status === "RESOLVED") {
        resolutionType = ResolutionType.ADMIN_RESOLUTION
        resolutionMessage = message ?? complaint.resolutionMessage ?? "Resolved"
      }

      const updated = await prisma.complaint.update({
        where: { id: complaintId },
        data: updateData,
      })

      // Create resolution entry if needed
      if (resolutionType) {
        await prisma.complaintResolution.create({
          data: {
            complaintId,
            message: resolutionMessage || "",
            type: resolutionType,
            createdById: user.id,
          },
        })
      }

      const result = await prisma.complaint.findUnique({
        where: { id: complaintId },
        include: {
          resolutions: {
            orderBy: { createdAt: "desc" },
            include: { createdBy: { select: { id: true, name: true, role: true } } },
          },
          feedbacks: { orderBy: { createdAt: "desc" } },
          priority: true,
          assignedTo: { select: { id: true, name: true } },
          customer: { 
            select: { 
              id: true,
              name: true,
              organisation: { select: { id: true, name: true } },
            } 
          },
          attachments: true,
        },
      })

      return NextResponse.json(result)
    }

    // EMPLOYEE: only allowed transitions
    if (user.role === Role.EMPLOYEE) {
      if (complaint.assignedToId !== user.id) {
        return NextResponse.json({ error: "Not assigned to you" }, { status: 403 })
      }

      const validTransition =
        (complaint.status === "ASSIGNED" && status === "IN_PROGRESS") ||
        (complaint.status === "IN_PROGRESS" && status === "COMPLETED")

      if (!validTransition) {
        return NextResponse.json(
          { error: "Invalid status transition" },
          { status: 400 }
        )
      }

      const updateData: any = { status: status as ComplaintStatus }

      // If transitioning to COMPLETED, optionally save message
      if (status === "COMPLETED" && message) {
        updateData.resolutionMessage = message
      }

      const updated = await prisma.complaint.update({
        where: { id: complaintId },
        data: updateData,
      })

      // Create resolution entry if message provided
      if (status === "COMPLETED" && message) {
        await prisma.complaintResolution.create({
          data: {
            complaintId,
            message,
            type: ResolutionType.EMPLOYEE_NOTE,
            createdById: user.id,
          },
        })
      }

      const result = await prisma.complaint.findUnique({
        where: { id: complaintId },
        include: {
          resolutions: {
            orderBy: { createdAt: "desc" },
            include: { createdBy: { select: { id: true, name: true, role: true } } },
          },
          feedbacks: { orderBy: { createdAt: "desc" } },
          priority: true,
          assignedTo: { select: { id: true, name: true } },
          customer: { 
            select: { 
              id: true,
              name: true,
              organisation: { select: { id: true, name: true } },
            } 
          },
          attachments: true,
        },
      })

      return NextResponse.json(result)
    }
  } catch (error) {
    console.error("Status change error:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}