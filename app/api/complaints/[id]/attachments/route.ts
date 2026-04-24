import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { cloudinary } from "@/lib/cloudinary"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const attachments = await prisma.complaintAttachment.findMany({
      where: { complaintId: id },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ attachments })
  } catch {
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const cookieStore = await cookies()
    const session = cookieStore.get("session")
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.value } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const complaint = await prisma.complaint.findUnique({ where: { id } })
    if (!complaint) return NextResponse.json({ error: "Complaint not found" }, { status: 404 })

    // Only allow uploads when complaint is OPEN
    if (complaint.status !== "OPEN") {
      return NextResponse.json({ error: "Attachments can only be added while the complaint is open" }, { status: 400 })
    }

    // Only the customer who owns the complaint can add attachments
    if (user.role === "CUSTOMER" && complaint.customerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP and PDF files are allowed." }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 5MB." }, { status: 400 })
    }

    // Convert to buffer and upload to Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `complaint-portal/${id}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const attachment = await prisma.complaintAttachment.create({
      data: {
        complaintId: id,
        fileName: file.name,
        fileUrl: uploaded.secure_url,
        fileType: file.type,
      },
    })

    return NextResponse.json({ success: true, attachment }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const cookieStore = await cookies()
    const session = cookieStore.get("session")
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.value } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const complaint = await prisma.complaint.findUnique({ where: { id } })
    if (!complaint) return NextResponse.json({ error: "Complaint not found" }, { status: 404 })

    // Only allow deletions when complaint is OPEN
    if (complaint.status !== "OPEN") {
      return NextResponse.json({ error: "Attachments can only be removed while the complaint is open" }, { status: 400 })
    }

    // Authorization: only complaint customer, admin, or assigned employee can delete attachments
    const isOwner = user.role === "CUSTOMER" && complaint.customerId === user.id
    const isAdmin = user.role === "ADMIN"
    const isAssignedEmployee = user.role === "EMPLOYEE" && complaint.assignedToId === user.id

    if (!isOwner && !isAdmin && !isAssignedEmployee) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { attachmentId } = await req.json()
    if (!attachmentId) return NextResponse.json({ error: "Attachment id required" }, { status: 400 })

    await prisma.complaintAttachment.delete({ where: { id: attachmentId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 })
  }
}