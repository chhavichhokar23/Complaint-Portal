import { ComplaintStatus } from "@prisma/client"

export const getStatusColor = (status: ComplaintStatus) => {
  switch (status) {
    case "OPEN":
      return "bg-blue-100 text-blue-700"
    case "ASSIGNED":
      return "bg-indigo-100 text-indigo-700"
    case "IN_PROGRESS":
      return "bg-amber-100 text-amber-700"
    case "COMPLETED":
      return "bg-purple-100 text-purple-700"
    case "CLOSED":
      return "bg-slate-100 text-slate-700"
    case "RESOLVED":
      return "bg-emerald-100 text-emerald-700"
    case "REJECTED":
      return "bg-red-100 text-red-700"
    case "PENDING":
      return "bg-orange-100 text-orange-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

export const getStatusLabel = (status: ComplaintStatus, role?: string) => {
  if (status === "COMPLETED") {
    return role === "CUSTOMER" ? "In Progress" : "Completed"
  }
  if (status === "PENDING") {
    return role === "CUSTOMER" ? "Reopened" : "Pending / Reopened"
  }
  // Convert OPEN → "Open", IN_PROGRESS → "In Progress", etc.
  return status
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export function getPriorityColor(priorityName?: string | null): string {
  switch (priorityName?.toUpperCase()) {
    case "CRITICAL": return "bg-red-100 text-red-700"
    case "HIGH": return "bg-orange-100 text-orange-700"
    case "MEDIUM": return "bg-yellow-100 text-yellow-700"
    case "LOW": return "bg-green-100 text-green-700"
    default: return "bg-orange-50 text-orange-700"
  }
}