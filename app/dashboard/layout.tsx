import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/dashboard/Navbar"
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

  // Fetch user from DB so Sidebar can show real name/email
  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { name: true, email: true, role: true },
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

        {/* Navbar */}
        <Navbar user={user}/>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          {children}
        </main>

      </div>

    </div>
  )
}