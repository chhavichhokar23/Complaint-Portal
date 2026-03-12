import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EmployeeDashboardView from "../../../components/dashboard/EmployeeDashboardView"

export default async function EmployeeDashboard() {
  const cookieStore =await cookies()
  const session = cookieStore.get("session")

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.value },
  })

  if (!user || user.role !== "EMPLOYEE") {
    redirect("/login")
  }

  const complaints = await prisma.complaint.findMany({
    where: {
      assignedToId: user.id,
    },
    include: {
      customer: true,
      assignedTo: true,
      feedbacks: {         
      orderBy: { createdAt: "desc" }
    }
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8 space-y-6">

      <EmployeeDashboardView
        initialComplaints={complaints}
      />
    </div>
  )
}