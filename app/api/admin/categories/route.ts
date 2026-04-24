import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await getCurrentUser()
    const categories = await prisma.categoryMaster.findMany({
      include: { subcategories: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { name, department, subcategories, prefix } = await req.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 })
    }
    if (!department || !department.trim()) {
      return NextResponse.json({ error: "Department is required." }, { status: 400 })
    }
    if (!prefix || !prefix.trim()) {
      return NextResponse.json({ error: "Prefix is required." }, { status: 400 })
    }

    const normalized = name.trim().toUpperCase()

    const category = await prisma.categoryMaster.create({
      data: {
        name: normalized,
        department: department.trim().toUpperCase(),
        prefix: prefix.trim(),                                
        subcategories: {
          create: (subcategories ?? []).map((s: string) => ({ name: s.trim() })),
        },
      },
      include: { subcategories: true },
    })

    return NextResponse.json({ success: true, category }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Category or prefix already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 })
    }

    await prisma.categoryMaster.delete({ where: { name } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
export async function PATCH(req: Request) {
  try {
    await getCurrentUser("ADMIN")
    const { name, department, prefix } = await req.json()

    if (!name || !department) {
      return NextResponse.json({ error: "Name and department are required." }, { status: 400 })
    }

    const updated = await prisma.categoryMaster.update({
      where: { name },
      data: {
        department: department.trim().toUpperCase(),
        ...(prefix ? { prefix: prefix.trim() } : {}),        
      },
      include: { subcategories: true },
    })

    return NextResponse.json({ success: true, category: updated })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}