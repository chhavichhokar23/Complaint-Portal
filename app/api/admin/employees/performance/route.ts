import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {

    const cookieStore = await cookies()
    const session = cookieStore.get("session")

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.value }
    })

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const employees = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        id: true,
        name: true
      }
    })

    const data = []

    for (const emp of employees) {

      const assigned = await prisma.complaint.count({
        where: { assignedToId: emp.id }
      })

      const completed = await prisma.complaint.count({
        where: {
          assignedToId: emp.id,
          status: "COMPLETED"
        }
      })

      const resolved = await prisma.complaint.count({
        where: {
          assignedToId: emp.id,
          status: "RESOLVED"
        }
      })

      const slaBreaches = await prisma.complaint.count({
        where: {
          assignedToId: emp.id,
          slaDeadline: { lt: new Date() },
          status: { notIn: ["RESOLVED"] }
        }
      })

      data.push({
        id: emp.id,
        name: emp.name,
        assigned,
        completed,
        resolved,
        slaBreaches
      })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: "Failed to fetch employee performance" },
      { status: 500 }
    )
  }
}