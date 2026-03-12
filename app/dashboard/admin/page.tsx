
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminDashboardView from "../../../components/dashboard/AdminDashboardView"


export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.value },
  })

  if (!user || user.role !== "ADMIN") {
    redirect("/login")
  }

  const complaints = await prisma.complaint.findMany({
    include: {
      customer: true,
      assignedTo: true,
      feedbacks: {         
      orderBy: { createdAt: "desc" }
    }
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
  pending: complaints.filter(c => c.status === "PENDING").length,
  resolved: complaints.filter(c => c.status === "RESOLVED").length,
  highPriority: complaints.filter(
    c => c.priority === "HIGH" || c.priority === "CRITICAL"
  ).length
}

 return (
  <div className=" space-y-6">

    <AdminDashboardView
      initialComplaints={complaints}
      employees={employees}
      stats={stats}
      
    />
  </div>
)
}