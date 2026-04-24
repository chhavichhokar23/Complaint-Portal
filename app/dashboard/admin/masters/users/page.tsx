import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import AddUserModal from "@/components/dashboard/AddUserModal"
import UsersTable from "@/components/dashboard/UsersTable"

type PageProps = {
  searchParams?: Promise<{ type?: string }>
}

export default async function UserMasterPage({ searchParams }: PageProps) {
  await getCurrentUser("ADMIN")

  const resolvedParams = await searchParams
  const activeType =
    resolvedParams?.type === "employees"
      ? "employees"
      : resolvedParams?.type === "admins"
      ? "admins"
      : "customers"

  const [customers, employees, admins, departments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER",
        registrationStatus: { not: "PENDING" }},
        include: { organisation: true },
        orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      include: { organisation: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      include: { organisation: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE", department: { not: null } },
      select: { department: true },
      distinct: ["department"],
    }),
  ])

  const departmentList = departments
    .map((d) => d.department)
    .filter(Boolean) as string[]

  const serialize = (users: typeof customers) =>
    users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString(),
      organisationName: (u as any).organisation?.name ?? null,
      organisationId: (u as any).organisation?.id ?? null,
     }))

  const tabs = [
    { label: "Customers", type: "customers", href: "/dashboard/admin/masters/users" },
    { label: "Employees", type: "employees", href: "/dashboard/admin/masters/users?type=employees" },
    { label: "Admins", type: "admins", href: "/dashboard/admin/masters/users?type=admins" },
  ]

  const counts = {
    customers: customers.length,
    employees: employees.length,
    admins: admins.length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/admin/masters"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">User Master</h1>
          <p className="text-sm text-slate-500">
            {activeType === "employees"
              ? "List of all employee users in the system."
              : activeType === "admins"
              ? "List of all admin users in the system."
              : "List of all customer users in the system."}
          </p>
        </div>
        {activeType === "customers" && <AddUserModal role="CUSTOMER" />}
        {activeType === "employees" && <AddUserModal role="EMPLOYEE" />}
        {activeType === "admins" && <AddUserModal role="ADMIN" />}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const isActive = activeType === tab.type
          return (
            <Link
              key={tab.type}
              href={tab.href}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium border transition-all duration-200 ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              {/* Count badge */}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {counts[tab.type as keyof typeof counts]}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Animated table wrapper */}
      <div
        key={activeType}
        className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
      >
        <UsersTable
          activeType={activeType}
          customers={serialize(customers)}
          employees={serialize(employees)}
          admins={serialize(admins)}
          departmentList={departmentList}
        />
      </div>
    </div>
  )
}