"use client"

import { useRef, useEffect, useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import { getStatusLabel } from "@/lib/complaintUtils"

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
  const isActive = value !== "ALL"

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className={`flex items-center gap-2 h-8 px-3 rounded-lg border text-xs font-medium transition-all ${
          isActive ? "bg-slate-700 text-white border-slate-700" : "bg-card border-border text-foreground hover:border-slate-400"
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
  organisationFilter = "ALL",
  setStatusFilter,
  setPriorityFilter,
  setCategoryFilter,
  setOrganisationFilter,
  hidePriority = false,
  categoryOptions = [],
  priorityOptions = [],
  organisationOptions = [],
  role,
}: any) {

  const categoryFilterOptions = [
    { value: "ALL", label: "All Category" },
    ...categoryOptions.map((c: string) => ({
      value: c,
      label: c.charAt(0) + c.slice(1).toLowerCase(),
    })),
  ]
  const priorityFilterOptions = [
    { value: "ALL", label: "All Priority" },
    ...priorityOptions.map((p: { id: string; name: string }) => ({
      value: p.id,
      label: p.name,
    })),
  ]
  const organisationFilterOptions = [
    { value: "ALL", label: "All Organisations" },
    { value: "NONE", label: "No Organisation" },
    ...organisationOptions.map((org: { id: string; name: string }) => ({
      value: org.id,
      label: org.name,
    })),
  ]

  return (
    <div className="flex items-center gap-2 mb-4">
      <FilterDropdown
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { value: "ALL", label: "All Status" },
          { value: "OPEN", label: getStatusLabel("OPEN" as any, role) },
          { value: "ASSIGNED", label: getStatusLabel("ASSIGNED" as any, role) },
          { value: "IN_PROGRESS", label: getStatusLabel("IN_PROGRESS" as any, role) },
          { value: "COMPLETED", label: getStatusLabel("COMPLETED" as any, role) },
          { value: "CLOSED", label: getStatusLabel("CLOSED" as any, role) },
          { value: "RESOLVED", label: getStatusLabel("RESOLVED" as any, role) },
          { value: "REJECTED", label: getStatusLabel("REJECTED" as any, role) },
          { value: "PENDING", label: getStatusLabel("PENDING" as any, role) },
        ]}
      />

      {!hidePriority && (
        <FilterDropdown
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={priorityFilterOptions}
        />
      )}

      <FilterDropdown
        value={categoryFilter}
        onChange={setCategoryFilter}
        options={categoryFilterOptions}
      />

      {setOrganisationFilter && (
        <FilterDropdown
          value={organisationFilter}
          onChange={setOrganisationFilter}
          options={organisationFilterOptions}
        />
      )}
    </div>
  )
}