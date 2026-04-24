import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const departments = await prisma.departmentMaster.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ departments: departments.map(d => d.name) })
  } catch {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}