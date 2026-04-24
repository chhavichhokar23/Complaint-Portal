import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { generateTicketNumber } from "@/lib/generateTicketNumber"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { category, subcategory, mobileNumber, description } = body

    if (!category || !subcategory || !mobileNumber || !description) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    if (mobileNumber.length !== 10) {
      return NextResponse.json({ message: "Invalid mobile number" }, { status: 400 })
    }

    const customerId = session.value

    // 1. Get customer with their organisation
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        organisation: {
          include: {
            defaultPriority: true,
          }
        }
      }
    })

    // 2. Determine priority
    let priorityId: string | null = null

    if (customer?.organisation?.defaultPriorityId) {
      // use org's default priority
      priorityId = customer.organisation.defaultPriorityId
    } else {
      // fall back to system default priority
      const settings = await prisma.systemSettings.findUnique({
        where: { id: "system" }
      })
      priorityId = settings?.defaultPriorityId ?? null
    }

    // 3. Determine SLA deadline
    let slaDeadline: Date | null = null

    if (priorityId && customer?.organisation?.id) {
      // look up org-specific SLA rule
      const slaRule = await prisma.slaMaster.findUnique({
        where: {
          organisationId_priorityId: {
            organisationId: customer.organisation.id,
            priorityId,
          }
        }
      })

      if (slaRule) {
        slaDeadline = new Date(Date.now() + slaRule.timeline * 60 * 60 * 1000)
      }
    }

    // 4. Fall back to system default SLA hours if no rule found
    if (!slaDeadline) {
      const settings = await prisma.systemSettings.findUnique({
        where: { id: "system" }
      })
      const hours = settings?.defaultSlaHours ?? 72
      slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000)
    }

    const ticketNumber = await generateTicketNumber(category)

    const complaint = await prisma.complaint.create({
      data: {
        ticketNumber,
        category,
        subcategory,
        mobileNumber,
        description,
        customerId,
        priorityId,
        slaDeadline,
        status: "OPEN",
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
        resolutions: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { name: true, role: true } } }
        },
      },
    })

    return NextResponse.json(complaint)
  } catch (error) {
    console.error("TICKET ERROR:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.value } })
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 })

    const include = {
      customer: true,
      assignedTo: true,
      priority: true,
      feedbacks: { orderBy: { createdAt: "desc" as const } },
      resolutions: {
        orderBy: { createdAt: "desc" as const },
        include: { createdBy: { select: { name: true, role: true } } }
      },
    }

    let complaints
    if (user.role === "ADMIN") {
      complaints = await prisma.complaint.findMany({
        include,
        orderBy: { createdAt: "desc" },
      })
    } else if (user.role === "CUSTOMER") {
      complaints = await prisma.complaint.findMany({
        where: { customerId: user.id },
        include,
        orderBy: { createdAt: "desc" },
      })
    } else {
      complaints = await prisma.complaint.findMany({
        where: { assignedToId: user.id },
        include,
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json(complaints)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Failed to fetch complaints" }, { status: 500 })
  }
}