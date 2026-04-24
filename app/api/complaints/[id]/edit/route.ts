import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { ComplaintStatus } from "@prisma/client"

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const cookieStore = await cookies()
    const session = cookieStore.get("session")

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.value },
      select: { id: true, mobileNumber: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id }
    })

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    if (complaint.customerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (complaint.status !== ComplaintStatus.OPEN) {
  return NextResponse.json(
    { error: "Complaint can only be edited while it is open" },
    { status: 400 }
  )
}

    const body = await req.json()

    const { category, subcategory, mobileNumber, description, useAccountNumber } = body

    const finalMobileNumber = useAccountNumber
      ? user.mobileNumber
      : mobileNumber

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        category,
        subcategory,
        mobileNumber: finalMobileNumber ?? "",
        description
      }
    })

    return NextResponse.json(updated)

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 }
    )
  }
}