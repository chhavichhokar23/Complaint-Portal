import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const priorities = await prisma.priorityMaster.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ priorities })
  } catch {
    return NextResponse.json({ error: "Failed to fetch priorities" }, { status: 500 })
  }
}