import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const { rating, comment } = await req.json()

  // Find complaint
  const complaint = await prisma.complaint.findUnique({
    where: { id }
  })

  if (!complaint) {
    return NextResponse.json(
      { error: "Complaint not found" },
      { status: 404 }
    )
  }

if (complaint.status !== "CLOSED") {
  return NextResponse.json(
    { error: "Feedback allowed only for closed complaints" },
    { status: 400 }
  )
}
  // Create feedback entry
  await prisma.complaintFeedback.create({
    data: {
      complaintId: id,
      rating,
      comment
    }
  })

  // Return updated complaint with feedback history
  const updatedComplaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          organisation: true,
        },
      },
      assignedTo: true,
      priority: true,
      feedbacks: {
        orderBy: { createdAt: "desc" }
      },
      resolutions: {
        orderBy: { createdAt: "desc" as const },
        include: { createdBy: { select: { name: true, role: true } } }
      }
    }
  })

  return NextResponse.json(updatedComplaint)
}