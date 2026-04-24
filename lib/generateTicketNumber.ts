import { prisma } from "@/lib/prisma"

export async function generateTicketNumber(category: string): Promise<string> {
  // Look up prefix from DB dynamically
  const categoryRecord = await prisma.categoryMaster.findUnique({
    where: { name: category },
  })

  const prefix = categoryRecord?.prefix ?? "00"

  // Date part: DDMMYY
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, "0")
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const yy = String(now.getFullYear()).slice(-2)
  const datePart = `${dd}${mm}${yy}`

  // Count tickets for this category created today only
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const count = await prisma.complaint.count({
    where: {
      category: { equals: category, mode: "insensitive" },
      createdAt: { gte: startOfDay, lt: endOfDay },
    },
  })

  const sequential = String(count + 1).padStart(3, "0")

  return `${prefix}-${datePart}-${sequential}` // e.g. 01-180326-001
}