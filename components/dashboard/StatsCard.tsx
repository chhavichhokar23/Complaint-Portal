"use client"

type Stats = {
  total?: number
  open?: number
  inProgress?: number
  completed?: number
  closed?: number
  resolved?: number
  rejected?: number
}

type Props = {
  stats: Stats
  setStatusFilter: (value: any) => void
  setPriorityFilter: (value: any) => void
  setCategoryFilter: (value: any) => void
  role?: "ADMIN" | "EMPLOYEE" | "CUSTOMER"
}

export default function StatsCards({
  stats,
  setStatusFilter,
  setPriorityFilter,
  setCategoryFilter,
  role = "ADMIN",
}: Props) {
  const reset = () => { setPriorityFilter("ALL"); setCategoryFilter("ALL") }

  const cards = [
    {
      label: "Total",
      value: stats.total ?? 0,
      onClick: () => { setStatusFilter("ALL"); reset() },
      bg: "bg-slate-100",
      numColor: "text-slate-700",
      labelColor: "text-slate-400",
      indicator: "bg-slate-300",
    },
    {
      label: "Open",
      value: stats.open ?? 0,
      onClick: () => { setStatusFilter("OPEN"); reset() },
      bg: "bg-blue-50",
      numColor: "text-blue-600",
      labelColor: "text-blue-300",
      indicator: "bg-blue-300",
    },
    {
      label: "In Progress",
      value: stats.inProgress ?? 0,
      onClick: () => { setStatusFilter("IN_PROGRESS"); reset() },
      bg: "bg-amber-50",
      numColor: "text-amber-600",
      labelColor: "text-amber-300",
      indicator: "bg-amber-300",
    },
    {
      label: "Completed",
      value: stats.completed ?? 0,
      onClick: () => { setStatusFilter("COMPLETED"); reset() },
      bg: "bg-violet-50",
      numColor: "text-violet-600",
      labelColor: "text-violet-300",
      indicator: "bg-violet-300",
    },
    {
      label: "Closed",
      value: stats.closed ?? 0,
      onClick: () => { setStatusFilter("CLOSED"); reset() },
      bg: "bg-zinc-100",
      numColor: "text-zinc-600",
      labelColor: "text-zinc-400",
      indicator: "bg-zinc-300",
    },
    {
      label: "Resolved",
      value: stats.resolved ?? 0,
      onClick: () => { setStatusFilter("RESOLVED"); reset() },
      bg: "bg-emerald-50",
      numColor: "text-emerald-600",
      labelColor: "text-emerald-300",
      indicator: "bg-emerald-300",
    },
    {
      label: "Rejected",
      value: stats.rejected ?? 0,
      onClick: () => { setStatusFilter("REJECTED"); reset() },
      bg: "bg-rose-50",
      numColor: "text-rose-500",
      labelColor: "text-rose-300",
      indicator: "bg-rose-300",
    },
  ]

  return (
    <div className="grid grid-cols-7 gap-2.5 mb-6">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={card.onClick}
          className={`
            ${card.bg} flex flex-col gap-3 p-4 rounded-2xl
            hover:brightness-95 active:scale-[0.98]
            transition-all duration-150 text-left cursor-pointer
          `}
        >
          <span className={`text-[11px] font-medium ${card.labelColor}`}>{card.label}</span>
          <p className={`text-3xl font-bold tracking-tight leading-none ${card.numColor}`}>
            {card.value}
          </p>
          <div className={`h-1 w-8 rounded-full ${card.indicator}`} />
        </button>
      ))}
    </div>
  )
}