"use client"

type Stats = {
  total: number
  pending: number
  resolved: number
  highPriority: number
}

type Props = {
  stats: Stats
  setStatusFilter: (value: any) => void
  setPriorityFilter: (value: any) => void
  setCategoryFilter: (value: any) => void
  hideHighPriority?: boolean
}

export default function StatsCards({
  stats,
  setStatusFilter,
  setPriorityFilter,
  setCategoryFilter,
  hideHighPriority = false
}: Props) {

  const cards = [
    {
      label: "Total Complaints",
      value: stats.total,
      onClick: () => { setStatusFilter("ALL"); setPriorityFilter("ALL"); setCategoryFilter("ALL") },
      bar: "bg-slate-400",
      num: "text-slate-700",
    },
    {
      label: "Pending",
      value: stats.pending,
      onClick: () => { setStatusFilter("PENDING"); setPriorityFilter("ALL"); setCategoryFilter("ALL") },
      bar: "bg-amber-400",
      num: "text-amber-600",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      onClick: () => { setStatusFilter("RESOLVED"); setPriorityFilter("ALL"); setCategoryFilter("ALL") },
      bar: "bg-emerald-400",
      num: "text-emerald-600",
    },
    ...(!hideHighPriority ? [{
      label: "Critical Priority",
      value: stats.highPriority,
      onClick: () => { setPriorityFilter("CRITICAL"); setStatusFilter("ALL"); setCategoryFilter("ALL") },
      bar: "bg-red-400",
      num: "text-red-500",
    }] : []),
  ]

  return (
    <div className={`grid gap-3 mb-6 ${hideHighPriority ? "grid-cols-3" : "grid-cols-4"}`}>
      {cards.map((card) => (
        <div
          key={card.label}
          onClick={card.onClick}
          className="relative bg-card border border-border rounded-xl px-5 py-4 cursor-pointer hover:shadow-md transition-all overflow-hidden group"
        >
          {/* Accent left bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${card.bar} rounded-l-xl`} />

          <p className="text-muted-foreground text-xs mb-2">{card.label}</p>
          <p className={`text-3xl font-bold ${card.num}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}