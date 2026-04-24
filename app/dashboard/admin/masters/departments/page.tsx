"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2, ChevronDown, Users, Building2, Pencil, Check, X, ArrowLeft } from "lucide-react"

type Employee = { id: string; name: string; email: string }
type DepartmentInfo = { name: string; employeeCount: number; employees: Employee[] }
type ApiResponse = { departments: DepartmentInfo[] }

export default function DepartmentMasterPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [newName, setNewName] = useState("")

  // Edit state
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  async function load() {
    const res = await fetch("/api/admin/departments")
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || "Failed to load departments")
    setData(json)
  }

  useEffect(() => {
    load()
      .catch((e: any) => setError(e.message || "Something went wrong"))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed || busy) return
    try {
      setBusy(true)
      setError("")
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to add department")
      await load()
      setNewName("")
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete "${name}"? Employees will not be deleted but will have no department assigned.`)) return
    try {
      setBusy(true)
      setError("")
      const res = await fetch("/api/admin/departments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete department")
      if (expanded === name) setExpanded(null)
      await load()
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  async function handleEdit(oldName: string) {
    if (!editValue.trim() || busy) return
    try {
      setBusy(true)
      setError("")
      const res = await fetch("/api/admin/departments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName: editValue.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update department")
      if (expanded === oldName) setExpanded(editValue.trim().toUpperCase())
      await load()
      setEditingName(null)
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setBusy(false)
    }
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

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Department Master</h1>
        <p className="text-sm text-slate-500">
          Manage departments and view employees assigned to each.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* Add Department */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Building2 size={12} className="text-indigo-600" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Add New Department</h2>
        </div>
        <div className="px-5 py-4">
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Department Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value.toUpperCase())}
                placeholder="e.g. HR, LEGAL, OPERATIONS"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                disabled={busy}
              />
            </div>
            <button
              type="submit"
              disabled={!newName.trim() || busy}
              className="h-[38px] rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              {busy ? "Adding..." : "+ Add"}
            </button>
          </form>
        </div>
      </div>

      {/* Departments List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center">
              <Users size={12} className="text-slate-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">Departments</h2>
          </div>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {data?.departments?.length ?? 0} total
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">Loading...</div>
        ) : data?.departments?.length ? (
          <ul className="divide-y divide-slate-100">
            {data.departments.map((dept) => {
              const isOpen = expanded === dept.name
              const isEditingThis = editingName === dept.name

              return (
                <li key={dept.name}>
                  {/* Department row */}
                  <div
                    onClick={() => !isEditingThis && setExpanded(isOpen ? null : dept.name)}
                    className={`flex items-center justify-between px-5 py-3.5 transition-colors duration-150 select-none ${
                      isEditingThis
                        ? "bg-slate-50"
                        : "cursor-pointer hover:bg-slate-50 active:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-indigo-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Inline edit input */}
                        {isEditingThis ? (
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                              className="rounded-lg border border-indigo-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-100 w-40 transition-all duration-200"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEdit(dept.name)
                                if (e.key === "Escape") setEditingName(null)
                              }}
                            />
                            <button
                              onClick={() => handleEdit(dept.name)}
                              disabled={busy || !editValue.trim()}
                              className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-150 cursor-pointer disabled:opacity-50"
                              title="Save"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => setEditingName(null)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-all duration-150 cursor-pointer"
                              title="Cancel"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-slate-900">{dept.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {dept.employeeCount} {dept.employeeCount === 1 ? "employee" : "employees"}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isEditingThis && (
                      <div
                        className="flex items-center gap-1.5 ml-4 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform duration-300 mr-1 cursor-pointer ${isOpen ? "rotate-180" : "rotate-0"}`}
                          onClick={() => setExpanded(isOpen ? null : dept.name)}
                        />
                        <button
                          type="button"
                          onClick={() => { setEditingName(dept.name); setEditValue(dept.name) }}
                          className="p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all duration-200 cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(dept.name)}
                          disabled={busy}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200 cursor-pointer disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Employees panel */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="bg-slate-50 border-t border-slate-100 px-5 py-4">
                      {dept.employees.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">
                          No employees assigned to this department yet.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {dept.employees.map((emp) => (
                            <li
                              key={emp.id}
                              className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                  {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-700">{emp.name}</span>
                              </div>
                              <span className="text-xs text-slate-400">{emp.email}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="px-5 py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Building2 size={18} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">No departments yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first department above to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}