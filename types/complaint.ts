import { ComplaintStatus, Priority, ComplaintCategory } from "@prisma/client"

export type Complaint = {
  id: string
  description: string
  status: ComplaintStatus
  category: ComplaintCategory
  subcategory: string | null
  mobileNumber: string | null
  priority: Priority
  slaDeadline: Date | null
  resolutionMessage: string | null
  customer: { name: string } | null
  assignedTo: { id: string; name: string } | null
  ticketNumber: number
  createdAt: Date

  feedbacks?: {
    id: string
    rating: number
    comment?: string | null
    createdAt: Date
  }[]
}