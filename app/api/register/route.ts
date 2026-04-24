import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password, mobileNumber, organisation, role, department } = await req.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Name, email, password and role are required." }, { status: 400 })
    }

    if (!["CUSTOMER", "EMPLOYEE"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 })
    }

    if (role === "CUSTOMER" && mobileNumber && mobileNumber.length !== 10) {
      return NextResponse.json({ error: "Invalid mobile number." }, { status: 400 })
    }

    if (role === "EMPLOYEE") {
      if (!department) {
        return NextResponse.json({ error: "Department is required for employees." }, { status: 400 })
      }
      const validDept = await prisma.departmentMaster.findUnique({ where: { name: department } })
      if (!validDept) {
        return NextResponse.json({ error: "Invalid department." }, { status: 400 })
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    // Find or create organisation for customers
    let organisationId: string | null = null
    if (role === "CUSTOMER" && organisation?.trim()) {
      const existingOrg = await prisma.organisationMaster.findUnique({
        where: { name: organisation.trim() }
      })
      if (existingOrg) {
        organisationId = existingOrg.id
      } else {
        const newOrg = await prisma.organisationMaster.create({
          data: { name: organisation.trim() }
        })
        organisationId = newOrg.id
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        mobileNumber: role === "CUSTOMER" ? mobileNumber || null : null,
        organisationId,
        department: role === "EMPLOYEE" ? department : null,
        registrationStatus: "PENDING",
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}