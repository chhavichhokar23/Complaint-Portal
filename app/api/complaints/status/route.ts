import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { ComplaintStatus, Role } from "@prisma/client"

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { complaintId, status,resolutionMessage } = await req.json()

  if (!complaintId || !status) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.value },
  })

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  if (user.role === Role.CUSTOMER) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
  })

  if (!complaint) {
    return NextResponse.json(
      { error: "Complaint not found" },
      { status: 404 }
    )
  }

  if (user.role === Role.EMPLOYEE) {
    if (complaint.assignedToId !== user.id) {
      return NextResponse.json(
        { error: "Not assigned to you" },
        { status: 403 }
      )
    }

    const validTransition =
  (complaint.status === ComplaintStatus.ASSIGNED &&
    status === ComplaintStatus.IN_PROGRESS) ||

  (complaint.status === ComplaintStatus.IN_PROGRESS &&
    status === ComplaintStatus.COMPLETED) 

    if (!validTransition) {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      )
    }
  }

  const updated = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: status as ComplaintStatus,
      assignedToId: status === "PENDING" ? null : complaint.assignedToId,
      ...(resolutionMessage && { resolutionMessage })
    },
    include: {
      customer: true,
      assignedTo: true,
      feedbacks:{
            orderBy:{createdAt: "desc"}
          }
    },
  })

  return NextResponse.json(updated)
}