
// import { cookies } from "next/headers"
// import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminDashboardView from "../../../components/dashboard/AdminDashboardView"
import { getCurrentUser } from "@/lib/auth"


export default async function AdminDashboard() {
  const user = await getCurrentUser("ADMIN")

  // Fetch all complaints for stats
  const allComplaints = await prisma.complaint.findMany({
    include: {
      customer: {
        include: {
          organisation: true,
        },
      },
      assignedTo: true,
      priority: true,
      feedbacks: {         
        orderBy: { createdAt: "desc" }
      },
      resolutions: {
        orderBy: { createdAt: "desc" as const },
        include: { createdBy: { select: { name: true, role: true } } }
      }
    },
    orderBy: { createdAt: "desc" },
  })

  // Fetch recent 5 for table display
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
        orderBy: { createdAt: "desc" }
      },
      resolutions: {
        orderBy: { createdAt: "desc" as const },
        include: { createdBy: { select: { name: true, role: true } } }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      name: true,
      department: true,
    },
  })

  // Calculate stats from ALL complaints
  const stats = {
    total: allComplaints.length,
    open: allComplaints.filter(c => c.status === "OPEN").length,
    inProgress: allComplaints.filter(c => c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length,
    completed: allComplaints.filter(c => c.status === "COMPLETED").length,
    closed: allComplaints.filter(c => c.status === "CLOSED").length,
    resolved: allComplaints.filter(c => c.status === "RESOLVED").length,
    rejected: allComplaints.filter(c => c.status === "REJECTED").length,
  }

 return (
  <div className=" space-y-6">

    <AdminDashboardView
      initialComplaints={complaints}
      employees={employees}
      stats={stats}
      viewType="dashboard"
      
    />
  </div>
)
}