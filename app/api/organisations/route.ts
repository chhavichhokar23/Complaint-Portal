import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const organisations = await prisma.organisationMaster.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    })
    return NextResponse.json({ organisations })
  } catch {
    return NextResponse.json({ error: "Failed to fetch organisations" }, { status: 500 })
  }
}