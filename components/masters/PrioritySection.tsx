"use client"

import { useState } from "react"
import { Trash2, Pencil, Check, X, Flag, Plus } from "lucide-react"
import { Priority, Organisation, fmtHours } from "@/types/masters"

type Props = {
  priorities: Priority[]
  organisations: Organisation[]
  loading: boolean
  busy: boolean
  onAdd: (name: string, slaHours: number | null) => Promise<void>
  onSave: (id: string, name: string, slaHours: number | null) => Promise<void>
  onDelete: (id: string, name: string) => Promise<void>
}

export function PrioritySection({ priorities, organisations, loading, busy, onAdd, onSave, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newHrs, setNewHrs] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editHrs, setEditHrs] = useState("")

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    await onAdd(newName.trim(), newHrs ? Number(newHrs) : null)
    setNewName(""); setNewHrs(""); setShowForm(false)
  }

  async function handleSave(id: string) {
    if (!editName.trim()) return
    await onSave(id, editName.trim(), editHrs ? Number(editHrs) : null)
    setEditingId(null)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Flag size={10} className="text-orange-600" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">Priorities & global SLA defaults</h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
          {priorities.length}
        </span>
        <button
          onClick={() => setShowForm(v => !v)}
          className="ml-auto flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 transition cursor-pointer"
        >
          <Plus size={12} />
          Add priority
        </button>
      </div>

      {/* Inline add form — hidden by default */}
      {showForm && (
        <form onSubmit={handleAdd} className="px-5 py-3 border-b border-slate-100 bg-orange-50/40 flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value.toUpperCase())}
            placeholder="Priority name, e.g. VIP"
            className="flex-1 min-w-[140px] rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
            autoFocus
            disabled={busy}
          />
          <input
            type="number"
            value={newHrs}
            onChange={e => setNewHrs(e.target.value)}
            placeholder="SLA (hrs)"
            min={1}
            className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={!newName.trim() || busy}
            className="rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setNewName(""); setNewHrs("") }}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 cursor-pointer"
          >
            <X size={13} />
          </button>
        </form>
      )}

      {/* Priority rows */}
      {loading ? (
        <div className="px-5 py-4 text-center text-sm text-slate-400">Loading...</div>
      ) : priorities.length === 0 ? (
        <div className="px-5 py-5 text-center text-sm text-slate-400">
          No priorities yet.{" "}
          <button onClick={() => setShowForm(true)} className="text-orange-500 hover:underline cursor-pointer">Add one</button>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {priorities.map(p => {
            const orgCount = organisations.filter(o => o.defaultPriority?.id === p.id).length
            const isEditing = editingId === p.id
            return (
              <li key={p.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition">

                <div className="w-28 flex-shrink-0">
                  {isEditing ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value.toUpperCase())}
                      className="rounded-lg border border-indigo-300 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-100 w-full"
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") handleSave(p.id); if (e.key === "Escape") setEditingId(null) }}
                    />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block flex-shrink-0" />
                      {p.name}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <input
                        type="number"
                        value={editHrs}
                        onChange={e => setEditHrs(e.target.value)}
                        placeholder="hrs"
                        min={1}
                        className="w-20 rounded-lg border border-indigo-300 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      <span className="text-xs text-slate-400">hrs</span>
                    </>
                  ) : p.slaHours ? (
                    <span className="text-xs text-slate-600">
                      <span className="font-medium text-slate-800">{fmtHours(p.slaHours)}</span>
                      <span className="text-slate-400 ml-1">global default</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">no global default</span>
                  )}
                </div>

                <span className="text-xs text-slate-400 w-14 text-right flex-shrink-0">
                  {orgCount} org{orgCount !== 1 ? "s" : ""}
                </span>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSave(p.id)} className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"><Check size={11} /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 cursor-pointer"><X size={11} /></button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditingId(p.id); setEditName(p.name); setEditHrs(p.slaHours ? String(p.slaHours) : "") }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition cursor-pointer"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => onDelete(p.id, p.name)}
                        disabled={busy}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>

              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}