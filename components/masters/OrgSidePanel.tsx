"use client"

import { useState } from "react"
import { Pencil, Check, X } from "lucide-react"
import { Priority, Organisation, fmtHours, getInitials } from "@/types/masters"

type Props = {
  org: Organisation
  priorities: Priority[]
  busy: boolean
  onClose: () => void
  onSaveOrg: (id: string, name: string, defaultPriorityId: string | null) => Promise<void>
  onSaveOrgSla: (orgId: string, priorityId: string, hours: number, existingRuleId?: string) => Promise<void>
  onClearOrgSla: (orgId: string, priorityId: string, ruleId: string) => Promise<void>
}

export function OrgSidePanel({ org, priorities, busy, onClose, onSaveOrg, onSaveOrgSla, onClearOrgSla }: Props) {
  const [editingOrg, setEditingOrg] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPriId, setEditPriId] = useState("")

  // SLA inline edit: key = priorityId
  const [activeSlaEdit, setActiveSlaEdit] = useState<string | null>(null)
  const [slaInputs, setSlaInputs] = useState<Record<string, string>>({})

  async function handleSaveOrg() {
    if (!editName.trim()) return
    await onSaveOrg(org.id, editName.trim(), editPriId || null)
    setEditingOrg(false)
  }

  function startEdit() {
    setEditName(org.name)
    setEditPriId(org.defaultPriority?.id ?? "")
    setEditingOrg(true)
  }

  async function handleSaveSla(priorityId: string) {
    const hours = Number(slaInputs[priorityId])
    if (!hours || hours < 1) return
    const existing = org.slaRules.find(r => r.priorityId === priorityId)
    await onSaveOrgSla(org.id, priorityId, hours, existing?.id)
    setActiveSlaEdit(null)
    setSlaInputs(prev => { const n = { ...prev }; delete n[priorityId]; return n })
  }

  const configuredCount = org.slaRules.filter(r => priorities.find(p => p.id === r.priorityId)).length

  return (
    <div className="w-[400px] flex-shrink-0 flex flex-col border-l border-slate-100">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-700 flex-shrink-0">
          {getInitials(org.name)}
        </div>

        <div className="flex-1 min-w-0">
          {editingOrg ? (
            <div className="flex items-center gap-2">
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="rounded-lg border border-indigo-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-100 flex-1 min-w-0"
                autoFocus
                onKeyDown={e => { if (e.key === "Enter") handleSaveOrg(); if (e.key === "Escape") setEditingOrg(false) }}
              />
              <button onClick={handleSaveOrg} className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer flex-shrink-0"><Check size={12} /></button>
              <button onClick={() => setEditingOrg(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 cursor-pointer flex-shrink-0"><X size={12} /></button>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-900 truncate">{org.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{configuredCount}/{priorities.length} SLA rules configured</p>
            </>
          )}
        </div>

        {!editingOrg && (
          <button onClick={startEdit} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition cursor-pointer flex-shrink-0">
            <Pencil size={13} />
          </button>
        )}
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition cursor-pointer flex-shrink-0">
          <X size={13} />
        </button>
      </div>

      {/* Default priority picker when editing */}
      {editingOrg && (
        <div className="px-5 py-3 border-b border-slate-100 bg-white">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Default priority</label>
          <select
            value={editPriId}
            onChange={e => setEditPriId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all hover:border-slate-300 cursor-pointer"
          >
            <option value="">No default priority</option>
            {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* SLA matrix */}
      <div className="flex-1">
        {priorities.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            Add priorities first to configure SLA overrides.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-medium text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <th className="text-left px-5 py-2.5 w-32">Priority</th>
                <th className="text-left px-3 py-2.5">Override</th>
                <th className="text-left px-3 py-2.5">Global</th>
                <th className="py-2.5 pr-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priorities.map(p => {
                const rule = org.slaRules.find(r => r.priorityId === p.id)
                const isEditing = activeSlaEdit === p.id

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
                        {p.name}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={slaInputs[p.id] ?? ""}
                            onChange={e => setSlaInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                            placeholder="hrs"
                            min={1}
                            autoFocus
                            className="w-16 rounded-lg border border-indigo-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                            onKeyDown={e => { if (e.key === "Enter") handleSaveSla(p.id); if (e.key === "Escape") setActiveSlaEdit(null) }}
                          />
                          <button onClick={() => handleSaveSla(p.id)} className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"><Check size={11} /></button>
                          <button onClick={() => setActiveSlaEdit(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 cursor-pointer"><X size={11} /></button>
                        </div>
                      ) : rule ? (
                        <span className="text-sm font-medium text-slate-700">
                          {fmtHours(rule.timeline)}
                          <span className="text-xs font-normal text-slate-400 ml-1">({rule.timeline}h)</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">—</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-xs text-slate-400">
                      {p.slaHours ? fmtHours(p.slaHours) : "—"}
                    </td>

                    <td className="pr-5 py-3 text-right">
                      {!isEditing && (
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => { setActiveSlaEdit(p.id); setSlaInputs(prev => ({ ...prev, [p.id]: rule ? String(rule.timeline) : "" })) }}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-white hover:border-slate-300 transition cursor-pointer"
                          >
                            {rule ? "Edit" : "Set"}
                          </button>
                          {rule && (
                            <button
                              onClick={() => onClearOrgSla(org.id, p.id, rule.id)}
                              disabled={busy}
                              className="rounded-lg border border-transparent px-2 py-1 text-xs text-rose-400 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer disabled:opacity-50"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}