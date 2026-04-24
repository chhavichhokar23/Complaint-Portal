import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CustomerDashboardView from "../../../components/dashboard/CustomerDashboardView"

export default async function CustomerDashboard() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.value },
    include: {
      organisation: { select: { id: true, name: true } },
      complaints: {
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true, organisationId: true, organisation: { select: { id: true, name: true } } } },
          assignedTo: { select: { id: true, name: true } },
          priority: true,
          feedbacks: { orderBy: { createdAt: "desc" } },
          resolutions: {
            orderBy: { createdAt: "desc" },
            include: { createdBy: { select: { name: true, role: true } } },
          },
        },
      },
    },
  })

  if (!user || user.role !== "CUSTOMER") redirect("/login")

  return (
    <CustomerDashboardView
      initialComplaints={user.complaints}
      userMobile={user.mobileNumber}
      profileUser={{
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        organisationId: user.organisationId,
        organisation: user.organisation,
      }}
    />
  )
}