import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import RegistrationsTable from "@/components/dashboard/RegistrationsTable"

type PageProps = {
  searchParams?: Promise<{ type?: string }>
}

export default async function RegistrationsPage({ searchParams }: PageProps) {
  await getCurrentUser("ADMIN")

  const resolvedParams = await searchParams
  const activeType = resolvedParams?.type === "employees" ? "employees" : "customers"

  const [customers, employees] = await Promise.all([
    prisma.user.findMany({
      where: { registrationStatus: "PENDING", role: "CUSTOMER" },
      include: { organisation: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { registrationStatus: "PENDING", role: "EMPLOYEE" },
      orderBy: { createdAt: "desc" },
      include: { organisation: true }, 
    }),
  ])

  const serialize = (users: typeof customers) =>
    users.map(u => ({ ...u, createdAt: u.createdAt.toISOString(),organisation: (u as any).organisation?.name ?? null, }))

  const tabs = [
    { label: "Customers", type: "customers", href: "/dashboard/admin/registrations" },
    { label: "Employees", type: "employees", href: "/dashboard/admin/registrations?type=employees" },
  ]

  const counts = {
    customers: customers.length,
    employees: employees.length,
  }

  const activeData = activeType === "employees" ? serialize(employees) : serialize(customers)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Pending Registrations</h1>
          <p className="text-sm text-slate-500">
            {activeType === "employees"
              ? "Employee accounts awaiting approval."
              : "Customer accounts awaiting approval."}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => {
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
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                isActive
                  ? "bg-white/20 text-white"
                  : counts[tab.type as keyof typeof counts] > 0
                  ? "bg-red-100 text-red-600"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {counts[tab.type as keyof typeof counts]}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div key={activeType} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
        <RegistrationsTable initialPending={activeData} activeType={activeType} />
      </div>
    </div>
  )
}