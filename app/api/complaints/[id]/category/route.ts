import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { category } = await req.json()

    // Validate against DB instead of enum
    const categoryExists = await prisma.categoryMaster.findUnique({
      where: { name: category },
    })

    if (!categoryExists) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: { category, assignedToId: null, status: "OPEN", subcategory: null },
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

    return NextResponse.json(updatedComplaint)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}