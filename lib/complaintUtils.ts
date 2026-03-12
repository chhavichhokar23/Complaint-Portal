import { ComplaintStatus, Priority } from "@prisma/client"

export const getStatusColor = (status: ComplaintStatus) => {
  if (status === "PENDING") return "bg-yellow-100 text-yellow-800"
  if (status === "ASSIGNED") return "bg-blue-100 text-blue-800"
  if (status === "IN_PROGRESS") return "bg-indigo-100 text-indigo-800"
  if (status === "COMPLETED") return "bg-purple-100 text-purple-800"
  if (status === "RESOLVED") return "bg-green-100 text-green-800"
  if (status === "REJECTED") return "bg-red-100 text-red-800"
}

export const getPriorityColor = (priority: Priority) => {
  if (priority === "LOW") return "bg-green-100 text-green-700"
  if (priority === "MEDIUM") return "bg-blue-100 text-blue-700"
  if (priority === "HIGH") return "bg-orange-100 text-orange-700"
  if (priority === "CRITICAL") return "bg-red-100 text-red-800"
}