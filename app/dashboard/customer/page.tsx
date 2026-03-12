import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CustomerDashboardView from "../../../components/dashboard/CustomerDashboardView"

export default async function CustomerDashboard() {

  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.value },
    include: {
      complaints: {
        orderBy: { createdAt: "desc" },
        include: {
          feedbacks: {
            orderBy: { createdAt: "desc" }
          }
        }
}
    }
  })

  if (!user || user.role !== "CUSTOMER") {
    redirect("/login")
  }

  return (
    <CustomerDashboardView
      initialComplaints={user.complaints}
      userMobile={user.mobileNumber}
    />
  )
}