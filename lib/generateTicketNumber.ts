import { prisma } from "@/lib/prisma"
import { ComplaintCategory } from "@prisma/client"

const prefixMap: Record<ComplaintCategory, number> = {
  ACCOUNT: 1000,
  BILLING: 2000,
  TECHNICAL: 3000,
  GENERAL: 4000
}

export async function generateTicketNumber(category: ComplaintCategory) {

  const prefix = prefixMap[category]

  const lastTicket = await prisma.complaint.findFirst({
    where: {
      ticketNumber: {
        gte: prefix,
        lt: prefix + 1000
      }
    },
    orderBy: {
      ticketNumber: "desc"
    }
  })

  const nextTicket = lastTicket
    ? lastTicket.ticketNumber! + 1
    : prefix + 1

  return nextTicket
}