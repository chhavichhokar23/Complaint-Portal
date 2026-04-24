import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardWrapper from "@/components/dashboard/DashboardWrapper"
import Sidebar from "@/components/dashboard/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session) {
    redirect("/login")
  }

  // Fetch user from DB so Sidebar and Navbar can show real name/email
  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { name: true, email: true, role: true, mobileNumber: true, organisationId: true, department: true, organisation: { select: { id: true, name: true } } },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen">

      {/* Sidebar — receives user from DB */}
      <Sidebar user={user} />

      {/* Main section */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Wrapper for Navbar and Profile Modal */}
        <DashboardWrapper
          user={user}
          profileUser={{
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            organisationId: user.organisationId,
            organisation: user.organisation,
            department: user.department,
            role: user.role,
          }}
        >
          {/* Page content */}
          <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </DashboardWrapper>

      </div>

    </div>
  )
}