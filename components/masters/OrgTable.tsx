"use client"

import { useState, useMemo, useEffect } from "react"
import { Trash2, Search, ChevronLeft, ChevronRight, SlidersHorizontal, Building2 } from "lucide-react"
import { Priority, Organisation, PAGE_SIZE, getInitials } from "@/types/masters"

type Props = {
  priorities: Priority[]
  organisations: Organisation[]
  loading: boolean
  busy: boolean
  selectedOrgId: string | null
  onSelect: (org: Organisation | null) => void
  onDelete: (id: string, name: string) => Promise<void>
  onAdd: (name: string, defaultPriorityId: string | null) => Promise<void>
}

export function OrgTable({ priorities, organisations, loading, busy, selectedOrgId, onSelect, onDelete, onAdd }: Props) {
  const [newName, setNewName] = useState("")
  const [newPriId, setNewPriId] = useState("")
  const [search, setSearch] = useState("")
  const [filterPriId, setFilterPriId] = useState("")
  const [filterSlaStatus, setFilterSlaStatus] = useState<"all" | "complete" | "incomplete">("all")
  const [page, setPage] = useState(1)

  const filteredOrgs = useMemo(() => {
    return organisations.filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase())
      const matchesPri = filterPriId ? org.defaultPriority?.id === filterPriId : true
      const ruleCount = org.slaRules.filter(r => priorities.find(p => p.id === r.priorityId)).length
      const matchesSla =
        filterSlaStatus === "all" ? true :
        filterSlaStatus === "complete" ? ruleCount === priorities.length :
        ruleCount < priorities.length
      return matchesSearch && matchesPri && matchesSla
    })
  }, [organisations, search, filterPriId, filterSlaStatus, priorities])

  const totalPages = Math.max(1, Math.ceil(filteredOrgs.length / PAGE_SIZE))
  const pagedOrgs = filteredOrgs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasFilters = !!(search || filterPriId || filterSlaStatus !== "all")

  useEffect(() => { setPage(1) }, [search, filterPriId, filterSlaStatus])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    await onAdd(newName.trim(), newPriId || null)
    setNewName(""); setNewPriId("")
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
          <Building2 size={12} className="text-violet-600" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">Organisations & SLA overrides</h2>
        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {organisations.length} total
        </span>
      </div>

      {/* Add form */}
      <div className="px-5 py-4 border-b border-slate-100">
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Organisation name"
            className="flex-1 min-w-[180px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            disabled={busy}
          />
          <select
            value={newPriId}
            onChange={e => setNewPriId(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all hover:border-slate-300 cursor-pointer"
            disabled={busy}
          >
            <option value="">Default priority (optional)</option>
            {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button
            type="submit"
            disabled={!newName.trim() || busy}
            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
          >
            + Add org
          </button>
        </form>
      </div>

      {/* Search + filters */}
      <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-3 items-center bg-white">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search organisations..."
            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-slate-400 flex-shrink-0" />
          <select
            value={filterPriId}
            onChange={e => setFilterPriId(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all hover:border-slate-300 cursor-pointer"
          >
            <option value="">All priorities</option>
            {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={filterSlaStatus}
            onChange={e => setFilterSlaStatus(e.target.value as any)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all hover:border-slate-300 cursor-pointer"
          >
            <option value="all">All SLA status</option>
            <option value="complete">Fully configured</option>
            <option value="incomplete">Incomplete SLA</option>
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilterPriId(""); setFilterSlaStatus("all") }}
            className="text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Two-panel wrapper */}
      <div className="flex min-h-[400px]">

        {/* Table */}
        <div className={`flex-1 min-w-0 flex flex-col ${selectedOrgId ? "border-r border-slate-100" : ""}`}>

          <div className="grid grid-cols-[1fr_140px_110px_56px] px-5 py-2 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-400 uppercase tracking-wide">
            <span>Organisation</span>
            <span>Default priority</span>
            <span>SLA rules</span>
            <span />
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400 py-12">Loading...</div>
          ) : filteredOrgs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12 text-center">
              <div>
                <p className="text-sm font-medium text-slate-500">No organisations found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 flex-1">
              {pagedOrgs.map(org => {
                const isSelected = selectedOrgId === org.id
                const overrideCount = org.slaRules.filter(r => priorities.find(p => p.id === r.priorityId)).length
                const isComplete = priorities.length > 0 && overrideCount === priorities.length

                return (
                  <li
                    key={org.id}
                    onClick={() => onSelect(isSelected ? null : org)}
                    className={`grid grid-cols-[1fr_140px_110px_56px] items-center px-5 py-3 cursor-pointer transition border-l-2
                      ${isSelected ? "bg-violet-50 border-l-violet-500" : "hover:bg-slate-50 border-l-transparent"}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold
                        ${isSelected ? "bg-violet-100 text-violet-700" : "bg-violet-50 text-violet-600"}`}>
                        {getInitials(org.name)}
                      </div>
                      <span className="text-sm font-medium text-slate-900 truncate">{org.name}</span>
                    </div>

                    <div>
                      {org.defaultPriority ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
                          {org.defaultPriority.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </div>

                    <div>
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full
                        ${isComplete
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : overrideCount > 0
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                        {overrideCount}/{priorities.length} set
                      </span>
                    </div>

                    <div className="flex justify-end" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onDelete(org.id, org.name)}
                        disabled={busy}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {/* Pagination */}
          {filteredOrgs.length > PAGE_SIZE && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
              <span className="text-xs text-slate-400">
                {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredOrgs.length)} of {filteredOrgs.length} organisations
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | "...")[]>((acc, n, i, arr) => {
                    if (i > 0 && (n as number) - (arr[i - 1] as number) > 1) acc.push("...")
                    acc.push(n)
                    return acc
                  }, [])
                  .map((n, i) =>
                    n === "..." ? (
                      <span key={`e${i}`} className="px-1 text-xs text-slate-400">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n as number)}
                        className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition cursor-pointer
                          ${page === n
                            ? "bg-violet-600 text-white border border-violet-600"
                            : "border border-slate-200 text-slate-600 hover:bg-white"
                          }`}
                      >
                        {n}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side panel slot — rendered by parent */}
        {/* kept empty here; parent renders <OrgSidePanel> alongside this component */}
      </div>
    </div>
  )
}