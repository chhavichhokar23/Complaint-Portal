import Link from "next/link"
import { Users, Layers, Building2, LayoutDashboard, Flag } from "lucide-react"

const cards = [
  {
    title: "User Master",
    description: "Manage users and their details.",
    href: "/dashboard/admin/masters/users",
    icon: Users,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    title: "Category Master",
    description: "Configure complaint categories and subcategories.",
    href: "/dashboard/admin/masters/categories",
    icon: Layers,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Department Master",
    description: "Set up and manage departments.",
    href: "/dashboard/admin/masters/departments",
    icon: Building2,
    color: "from-emerald-500 to-green-600",
  },
  {
    title: "Priority & SLA Master",
    description: "Define priorities with global SLA defaults and per-organisation overrides.",
    href: "/dashboard/admin/masters/priority-sla",
    icon: Flag,
    color: "from-orange-500 to-amber-500",
  },
]

export default function MastersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Masters</h1>
        <p className="mt-2 text-sm text-slate-500">
          Configure key master data for the complaint portal.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.color}`} />
              <div className="flex flex-col gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                    {card.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{card.description}</p>
                </div>
                <span className="text-sm font-medium text-indigo-600 opacity-0 translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                  Open →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}