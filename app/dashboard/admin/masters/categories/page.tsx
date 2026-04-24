"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2, ChevronDown, Tag, Layers, Plus, Pencil, Check, X, ArrowLeft } from "lucide-react"

type Subcategory = { id: string; name: string }
type Category = { name: string; department: string; subcategories: Subcategory[] }

export default function CategoryMasterPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [newCat, setNewCat] = useState({ name: "", dept: "" })
  const [newSubs, setNewSubs] = useState<Record<string, string>>({})

  // Edit states
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [editCatDept, setEditCatDept] = useState("")
  const [editingSub, setEditingSub] = useState<string | null>(null)
  const [editSubName, setEditSubName] = useState("")

  async function load() {
    const [catRes, deptRes] = await Promise.all([
      fetch("/api/admin/categories"),
      fetch("/api/admin/departments"),
    ])
    const catData = await catRes.json()
    const deptData = await deptRes.json()
    setCategories(catData.categories ?? [])
    setDepartments(deptData.departments.map((d: any) => d.name))
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load")).finally(() => setLoading(false))
  }, [])

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCat.name.trim() || !newCat.dept || busy) return
    try {
      setBusy(true)
      setError("")
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCat.name.trim(), department: newCat.dept }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      await load()
      setNewCat({ name: "", dept: "" })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteCategory(name: string) {
    if (!confirm(`Delete category "${name}" and all its subcategories?`)) return
    try {
      setBusy(true)
      setError("")
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      if (expanded === name) setExpanded(null)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleEditCategory(name: string) {
    if (!editCatDept || busy) return
    try {
      setBusy(true)
      setError("")
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, department: editCatDept }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      await load()
      setEditingCat(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleAddSubcategory(categoryName: string) {
    const name = newSubs[categoryName]?.trim()
    if (!name || busy) return
    try {
      setBusy(true)
      setError("")
      const res = await fetch("/api/admin/categories/subcategory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, categoryName }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      await load()
      setNewSubs((prev) => ({ ...prev, [categoryName]: "" }))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteSubcategory(id: string) {
    if (!confirm("Delete this subcategory?")) return
    try {
      setBusy(true)
      setError("")
      const res = await fetch("/api/admin/categories/subcategory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleEditSubcategory(id: string) {
    if (!editSubName.trim() || busy) return
    try {
      setBusy(true)
      setError("")
      const res = await fetch("/api/admin/categories/subcategory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editSubName }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      await load()
      setEditingSub(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const deptColors: Record<string, string> = {
    TECHNICAL: "bg-blue-50 text-blue-700 border-blue-100",
    FINANCE: "bg-emerald-50 text-emerald-700 border-emerald-100",
    SUPPORT: "bg-violet-50 text-violet-700 border-violet-100",
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
        <h1 className="text-2xl font-semibold text-slate-900">Category Master</h1>
        <p className="text-sm text-slate-500">
          Manage complaint categories, departments, and subcategories.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* Add Category */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Tag size={12} className="text-indigo-600" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Add New Category</h2>
        </div>
        <div className="px-5 py-4">
          <form onSubmit={handleAddCategory} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Category Name</label>
              <input
                type="text"
                value={newCat.name}
                onChange={(e) => setNewCat(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                placeholder="e.g. NETWORK, HARDWARE"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                disabled={busy}
              />
            </div>
            <div className="min-w-[180px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Assigned Department</label>
              <select
                value={newCat.dept}
                onChange={(e) => setNewCat(prev => ({ ...prev, dept: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all hover:border-slate-300 cursor-pointer"
                disabled={busy}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={!newCat.name.trim() || !newCat.dept || busy}
              className="h-[38px] rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              {busy ? "Adding..." : "+ Add Category"}
            </button>
          </form>
        </div>
      </div>

      {/* Categories List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center">
              <Layers size={12} className="text-slate-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">Categories</h2>
          </div>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {categories.length} total
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">Loading...</div>
        ) : categories.length ? (
          <ul className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const isOpen = expanded === cat.name
              const isEditingThisCat = editingCat === cat.name
              const deptColor = deptColors[cat.department] ?? "bg-slate-50 text-slate-600 border-slate-100"

              return (
                <li key={cat.name}>
                  {/* Category row */}
                  <div
                    onClick={() => !isEditingThisCat && setExpanded(isOpen ? null : cat.name)}
                    className={`flex items-center justify-between px-5 py-3.5 transition-colors duration-150 select-none ${
                      isEditingThisCat ? "bg-slate-50" : "cursor-pointer hover:bg-slate-50 active:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Tag size={14} className="text-indigo-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{cat.name}</p>

                        {/* Inline department edit */}
                        {isEditingThisCat ? (
                          <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={editCatDept}
                              onChange={(e) => setEditCatDept(e.target.value)}
                              className="rounded-lg border border-indigo-300 bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer transition-all hover:border-indigo-400"
                              autoFocus
                            >
                              {departments.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleEditCategory(cat.name)}
                              disabled={busy}
                              className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-150 cursor-pointer"
                              title="Save"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => setEditingCat(null)}
                              className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 transition-all duration-150 cursor-pointer"
                              title="Cancel"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${deptColor}`}>
                              {cat.department}
                            </span>
                            <span className="text-xs text-slate-400">
                              {cat.subcategories.length} {cat.subcategories.length === 1 ? "subcategory" : "subcategories"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {!isEditingThisCat && (
                        <>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform duration-300 mr-1 ${isOpen ? "rotate-180" : "rotate-0"}`}
                            onClick={(e) => { e.stopPropagation(); setExpanded(isOpen ? null : cat.name) }}
                          />
                          <button
                            type="button"
                            onClick={() => { setEditingCat(cat.name); setEditCatDept(cat.department) }}
                            className="p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all duration-200 cursor-pointer"
                            title="Edit department"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.name)}
                            disabled={busy}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200 cursor-pointer disabled:opacity-50"
                            title="Delete category"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Subcategories panel */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="bg-slate-50 border-t border-slate-100 px-5 py-4 space-y-3">

                      {cat.subcategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {cat.subcategories.map((sub) => {
                            const isEditingThisSub = editingSub === sub.id
                            return (
                              <div
                                key={sub.id}
                                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
                              >
                                {isEditingThisSub ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      value={editSubName}
                                      onChange={(e) => setEditSubName(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-24 rounded border border-indigo-300 px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-indigo-200"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleEditSubcategory(sub.id)
                                        if (e.key === "Escape") setEditingSub(null)
                                      }}
                                    />
                                    <button
                                      onClick={() => handleEditSubcategory(sub.id)}
                                      disabled={busy}
                                      className="text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
                                    >
                                      <Check size={11} />
                                    </button>
                                    <button
                                      onClick={() => setEditingSub(null)}
                                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    {sub.name}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setEditingSub(sub.id); setEditSubName(sub.name) }}
                                      className="text-slate-300 hover:text-amber-500 transition-colors duration-150 cursor-pointer"
                                      title="Edit"
                                    >
                                      <Pencil size={10} />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteSubcategory(sub.id) }}
                                      disabled={busy}
                                      className="text-slate-300 hover:text-rose-500 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                                      title="Delete"
                                    >
                                      <X size={11} />
                                    </button>
                                  </>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No subcategories yet.</p>
                      )}

                      {/* Add subcategory */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newSubs[cat.name] ?? ""}
                          onChange={(e) => setNewSubs(prev => ({ ...prev, [cat.name]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Add subcategory..."
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 cursor-text"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); handleAddSubcategory(cat.name) }
                          }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddSubcategory(cat.name) }}
                          disabled={busy || !newSubs[cat.name]?.trim()}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Plus size={12} />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="px-5 py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Tag size={18} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">No categories yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first category above to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}