import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getCurrentUser } from "@/lib/auth"

type AllowedRole = "CUSTOMER" | "EMPLOYEE"

async function validateDepartment(department: string) {
  const found = await prisma.departmentMaster.findUnique({
    where: { name: department },
  })
  return !!found
}

export async function GET(req: Request) {
  try {
    await getCurrentUser("ADMIN")

    const { searchParams } = new URL(req.url)
    const pendingOnly = searchParams.get("pending") === "true"

    const users = await prisma.user.findMany({
      where: pendingOnly ? { registrationStatus: "PENDING" } : {},
      orderBy: { createdAt: "desc" },
      include: { organisation: true },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function POST(req: Request) {
  try {
    await getCurrentUser("ADMIN")

    const { name, email, password, role, mobileNumber, department } = await req.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password and role are required." },
        { status: 400 }
      )
    }

    if (role !== "CUSTOMER" && role !== "EMPLOYEE") {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 })
    }

    if (role === "EMPLOYEE") {
      if (!department) {
        return NextResponse.json(
          { error: "Department is required for employee users." },
          { status: 400 }
        )
      }
      const valid = await validateDepartment(department)
      if (!valid) {
        return NextResponse.json({ error: "Invalid department." }, { status: 400 })
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        mobileNumber: role === "CUSTOMER" ? mobileNumber || null : null,
        department: role === "EMPLOYEE" ? department : null,
      },
    })

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await getCurrentUser("ADMIN")

    const { id, name, email, role, mobileNumber, department, registrationStatus, organisationId } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "User id is required." }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    const nextRole = (role ?? existing.role) as AllowedRole

    if (nextRole === "EMPLOYEE") {
      const finalDept = department ?? existing.department
      if (!finalDept) {
        return NextResponse.json({ error: "Department is required for employee users." }, { status: 400 })
      }
      const valid = await validateDepartment(finalDept)
      if (!valid) {
        return NextResponse.json({ error: "Invalid department." }, { status: 400 })
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        email: email ?? existing.email,
        role: nextRole,
        mobileNumber: nextRole === "CUSTOMER" ? mobileNumber ?? existing.mobileNumber : null,
        department: nextRole === "EMPLOYEE" ? (department ?? existing.department) : null,
        organisationId: nextRole === "CUSTOMER" ? (organisationId ?? existing.organisationId) : null,
        registrationStatus: registrationStatus ?? existing.registrationStatus,
      },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await getCurrentUser("ADMIN")

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "User id is required." }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}