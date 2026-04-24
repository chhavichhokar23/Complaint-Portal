// import { cookies } from "next/headers"
// import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EmployeeDashboardView from "../../../components/dashboard/EmployeeDashboardView"
import { getCurrentUser } from "@/lib/auth"

export default async function EmployeeDashboard() {
   const user= await getCurrentUser("EMPLOYEE")

  const complaints = await prisma.complaint.findMany({
    where: {
      assignedToId: user.id,
    },
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

  return (
    <div className="p-8 space-y-6">

      <EmployeeDashboardView
        initialComplaints={complaints}
      />
    </div>
  )
}