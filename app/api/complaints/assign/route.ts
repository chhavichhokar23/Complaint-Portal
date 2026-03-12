import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import {
  ComplaintCategory,
  Department,
  ComplaintStatus
} from "@prisma/client"

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.value },
  })

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { complaintId, employeeId } = await req.json()

  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
  })

  if (!complaint) {
    return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
  }

  // if (complaint.status !== ComplaintStatus.PENDING) {
  //   return NextResponse.json(
  //     { error: "Complaint cannot be assigned at this stage" },
  //     { status: 400 }
  //   )
  // }

  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
  })

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 })
  }

  const categoryToDepartment: Record<ComplaintCategory, Department> = {
    TECHNICAL: "TECHNICAL",
    BILLING: "FINANCE",
    ACCOUNT: "SUPPORT",
    GENERAL: "SUPPORT",
  }

  if (employee.department !== categoryToDepartment[complaint.category]) {
    return NextResponse.json(
      { error: "Invalid department assignment" },
      { status: 400 }
    )
  }

  const updatedComplaint = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      assignedToId: employeeId,
      status: ComplaintStatus.ASSIGNED,
    },
    include: {
      assignedTo: true,
      customer: true,
      feedbacks:{
            orderBy:{createdAt: "desc"}
          }
    },
  })

  return NextResponse.json(updatedComplaint)
}