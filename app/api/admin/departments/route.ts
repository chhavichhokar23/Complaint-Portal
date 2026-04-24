import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await getCurrentUser("ADMIN")

    const masters = await prisma.departmentMaster.findMany()

    const results = []

    for (const m of masters) {
      const employees = await prisma.user.findMany({
        where: { role: "EMPLOYEE", department: m.name },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      })

      results.push({
        name: m.name,
        employeeCount: employees.length,
        employees,
      })
    }

    return NextResponse.json({ departments: results })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to load departments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await getCurrentUser("ADMIN")

    const { name }: { name?: string } = await req.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Department name is required." }, { status: 400 })
    }

    const normalized = name.trim().toUpperCase()

    await prisma.departmentMaster.create({
      data: { name: normalized },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Department already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to add department" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await getCurrentUser("ADMIN")

    const { name }: { name?: string } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Department name is required." }, { status: 400 })
    }

    await prisma.departmentMaster.delete({ where: { name } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
  }
}
export async function PATCH(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { oldName, newName } = await req.json()

    if (!oldName || !newName?.trim()) {
      return NextResponse.json({ error: "Old and new name are required." }, { status: 400 })
    }

    const updated = await prisma.departmentMaster.update({
      where: { name: oldName },
      data: { name: newName.trim().toUpperCase() },
    })

    return NextResponse.json({ success: true, department: updated })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
  }
}