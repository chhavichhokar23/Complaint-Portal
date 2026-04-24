import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { name, categoryName } = await req.json()

    if (!name || !categoryName) {
      return NextResponse.json({ error: "Name and category are required." }, { status: 400 })
    }

    const subcategory = await prisma.subcategoryMaster.create({
      data: { name: name.trim(), categoryName },
    })

    return NextResponse.json({ success: true, subcategory }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add subcategory" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Subcategory id is required." }, { status: 400 })
    }

    await prisma.subcategoryMaster.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 })
  }
}
export async function PATCH(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { id, name } = await req.json()

    if (!id || !name) {
      return NextResponse.json({ error: "Id and name are required." }, { status: 400 })
    }

    const updated = await prisma.subcategoryMaster.update({
      where: { id },
      data: { name: name.trim() },
    })

    return NextResponse.json({ success: true, subcategory: updated })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update subcategory" }, { status: 500 })
  }
}