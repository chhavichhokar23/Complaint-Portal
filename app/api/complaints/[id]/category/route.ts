import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ComplaintCategory } from "@prisma/client"

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const body = await req.json()
    const category = body.category as ComplaintCategory

    if (!Object.values(ComplaintCategory).includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      )
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: { category,assignedToId:null,status:"PENDING" },
      include: { assignedTo: true,customer: true,feedbacks:{
            orderBy:{createdAt: "desc"}
          } },
    })

    return NextResponse.json(updatedComplaint)
  } catch (error) {
    console.error("CATEGORY UPDATE ERROR:", error)

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}