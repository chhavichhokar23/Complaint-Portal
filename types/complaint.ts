import { ComplaintStatus, ResolutionType } from "@prisma/client"

export type Complaint = {
  id: string
  description: string
  status: ComplaintStatus
  category: string
  subcategory: string | null
  mobileNumber: string | null
  priority: { id: string; name: string } | null
  slaDeadline: Date | null
  resolutionMessage: string | null
  rejectionReason: string | null
  customer: { name: string; organisationId?: string | null; organisation?: { id: string; name: string } | null } | null
  assignedTo: { id: string; name: string } | null
  ticketNumber: string | null
  createdAt: Date
  feedbacks?: {
    id: string
    rating: number
    comment?: string | null
    createdAt: Date
  }[]
  attachments?: {
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    createdAt: Date
  }[]
  resolutions?: {
    id: string
    message: string
    type: ResolutionType    
    createdAt: Date
    createdBy: { name: string; role: string } | null
  }[]
}