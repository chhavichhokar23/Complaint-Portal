import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import AdminDashboardView from "@/components/dashboard/AdminDashboardView"

export default async function AllComplaintsPage() {
  await getCurrentUser("ADMIN")

  const complaints = await prisma.complaint.findMany({
    include: {
      customer: {
        include: {
          organisation: true,
        },
      },
      assignedTo: true,
      priority: true,
      feedbacks: {
        orderBy: { createdAt: "desc" },
      },
      resolutions: {
        orderBy: { createdAt: "desc" as const },
        include: { createdBy: { select: { name: true, role: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      name: true,
      department: true,
    },
  })

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === "OPEN").length,
    inProgress: complaints.filter(c => c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length,
    completed: complaints.filter(c => c.status === "COMPLETED").length,
    closed: complaints.filter(c => c.status === "CLOSED").length,
    resolved: complaints.filter(c => c.status === "RESOLVED").length,
    rejected: complaints.filter(c => c.status === "REJECTED").length,
  }

  return (
    <div className="space-y-6">
      <AdminDashboardView
        initialComplaints={complaints}
        employees={employees}
        stats={stats}
        viewType="table"
      />
    </div>
  )
}