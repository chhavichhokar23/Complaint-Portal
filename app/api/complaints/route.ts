import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import {cookies } from "next/headers"
import { generateTicketNumber } from "@/lib/generateTicketNumber"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {category, subcategory, mobileNumber, description, priority } = body
    const ticketNumber = await generateTicketNumber(category)
    
     if (!category || !subcategory || !mobileNumber || !description) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }
    const customerId = session.value
    if (mobileNumber.length !== 10) {
      return NextResponse.json(
        { message: "Invalid mobile number" },
        { status: 400 }
      )
    }
    const complaint = await prisma.complaint.create({
      data: {
        ticketNumber,
        category,
        subcategory,
        mobileNumber,
        description,
        customerId,
      },
    })

    return NextResponse.json(complaint)

  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.value
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    let complaints
    if (user.role === "ADMIN") {
      complaints = await prisma.complaint.findMany({
        include: {
          customer: true,
          assignedTo: true,
          feedbacks: {
            orderBy: { createdAt: "desc" }
          }
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    else if (user.role === "CUSTOMER") {
      complaints = await prisma.complaint.findMany({
        where: { customerId: userId },
        include: {
          customer: true,
          assignedTo: true,
          feedbacks: {
            orderBy: { createdAt: "desc" }
          }
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    else if (user.role === "EMPLOYEE") {
      complaints = await prisma.complaint.findMany({
        where: { assignedToId: userId },
        include: {
          customer: true,
          assignedTo: true,
          feedbacks:{
            orderBy:{createdAt: "desc"}
          }
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    return NextResponse.json(complaints)

  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: "Failed to fetch complaints" },
      { status: 500 }
    )
  }
}
