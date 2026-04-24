import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { ComplaintStatus } from "@prisma/client"

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { id: session.value } })
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { complaintId, employeeId } = await req.json()

  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } })
  if (!complaint) return NextResponse.json({ error: "Complaint not found" }, { status: 404 })

  const employee = await prisma.user.findUnique({ where: { id: employeeId } })
  if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 })

  // Look up which department handles this category from DB
  const category = await prisma.categoryMaster.findUnique({
    where: { name: complaint.category },
  })

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }

  if (employee.department !== category.department) {
    return NextResponse.json({ error: "Invalid department assignment" }, { status: 400 })
  }

  const updatedComplaint = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      assignedToId: employeeId,
      status: ComplaintStatus.ASSIGNED,
    },
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
}