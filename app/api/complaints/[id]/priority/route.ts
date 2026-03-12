import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Priority } from "@prisma/client"
const slaHours: Record<Priority, number> = {
  LOW: 48,
  MEDIUM: 24,
  HIGH: 12,
  CRITICAL: 3
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const { priority } = await req.json()
  const hours = slaHours[priority as Priority]

  const slaDeadline = new Date(
    Date.now() + hours * 60 * 60 * 1000
  )


  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      priority: priority as Priority,
      slaDeadline
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