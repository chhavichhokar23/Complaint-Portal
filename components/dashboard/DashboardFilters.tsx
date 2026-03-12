"use client"

import { useRef, useEffect, useState } from "react"
import { ChevronDown, Check } from "lucide-react"

function FilterDropdown({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const isActive = value !== "ALL"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className={`flex items-center gap-2 h-8 px-3 rounded-lg border text-xs font-medium transition-all ${
          isActive
            ? "bg-slate-700 text-white border-slate-700"
            : "bg-card border-border text-foreground hover:border-slate-400"
        }`}
      >
        <span>{selected?.label}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 left-0 bg-card border border-border rounded-xl shadow-md overflow-hidden min-w-[140px]">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-muted transition-colors"
            >
              <span className={value === opt.value ? "font-semibold text-foreground" : "text-muted-foreground"}>
                {opt.label}
              </span>
              {value === opt.value && <Check size={11} className="text-slate-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardFilters({
  statusFilter,
  priorityFilter,
  categoryFilter,
  setStatusFilter,
  setPriorityFilter,
  setCategoryFilter,
  hidePriority = false
}: any) {

  return (
    <div className="flex items-center gap-2 mb-4">
      <FilterDropdown
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { value: "ALL", label: "All Status" },
          { value: "PENDING", label: "Pending" },
          { value: "ASSIGNED", label: "Assigned" },
          { value: "IN_PROGRESS", label: "In Progress" },
          { value: "COMPLETED", label: "Completed" },
          { value: "RESOLVED", label: "Resolved" },
          { value: "REJECTED", label: "Rejected" },
        ]}
      />

      {!hidePriority && (
        <FilterDropdown
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { value: "ALL", label: "All Priority" },
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
            { value: "CRITICAL", label: "Critical" },
          ]}
        />
      )}

      <FilterDropdown
        value={categoryFilter}
        onChange={setCategoryFilter}
        options={[
          { value: "ALL", label: "All Category" },
          { value: "TECHNICAL", label: "Technical" },
          { value: "BILLING", label: "Billing" },
          { value: "ACCOUNT", label: "Account" },
          { value: "GENERAL", label: "General" },
        ]}
      />
    </div>
  )
}