"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"

type RoleType = "CUSTOMER" | "EMPLOYEE" | "ADMIN"

type BaseUser = {
  id: string
  name: string
  email: string
  role: RoleType
  mobileNumber?: string | null
  department?: string | null
  organisationId?: string | null
}

type AddUserModalProps = {
  role: RoleType
  mode?: "create" | "edit"
  user?: BaseUser
}

export default function AddUserModal({
  role,
  mode = "create",
  user,
}: AddUserModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    id: user?.id ?? "",
    name: user?.name ?? "",
    email: user?.email ?? "",
    mobileNumber: user?.mobileNumber ?? "",
    password: "",
    department: user?.department ?? "",
    organisationId: user?.organisationId ?? "",
  })
  const [departments, setDepartments] = useState<string[]>([])
  const [organisations, setOrganisations] = useState<{ id: string; name: string }[]>([])

  const isCustomer = role === "CUSTOMER"
  const isAdmin = role === "ADMIN"
  const isEmployee = role === "EMPLOYEE"
  const isEdit = mode === "edit"

  useEffect(() => {
    if (isEmployee) {
      fetch("/api/admin/departments")
        .then((r) => r.json())
        .then((data) => setDepartments(data.departments.map((d: any) => d.name)))
    }
    if (isCustomer) {
      fetch("/api/organisations")
        .then((r) => r.json())
        .then((data) => setOrganisations(data.organisations ?? []))
    }
  }, [isEmployee, isCustomer])

  function openForEdit() {
    if (!user) return
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber ?? "",
      password: "",
      department: user.department ?? "",
      organisationId: user.organisationId ?? "",
    })
    setError("")
    setOpen(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const method = isEdit ? "PUT" : "POST"
      const body: any = { name: form.name, email: form.email, role }

      if (isEdit) {
        body.id = form.id
      } else {
        body.password = form.password
      }

      if (isEmployee) {
        body.department = form.department || undefined
      } else if (isCustomer) {
        body.mobileNumber = form.mobileNumber
        body.organisationId = form.organisationId || undefined
      } else {
        body.mobileNumber = form.mobileNumber
      }

      const res = await fetch("/api/admin/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong.")
        return
      }

      setOpen(false)
      setForm({ id: "", name: "", email: "", mobileNumber: "", password: "", department: "", organisationId: "" })
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!user) return
    if (!confirm("Are you sure you want to delete this user permanently?")) return

    try {
      setLoading(true)
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || "Failed to delete user."); return }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const modalTitle = isEdit
    ? isCustomer ? "Edit Customer" : isAdmin ? "Edit Admin" : "Edit Employee"
    : isCustomer ? "Add New Customer" : isAdmin ? "Add New Admin" : "Add New Employee"

  const formFields = (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          placeholder="john@example.com"
        />
      </div>

      {/* Mobile — customer and admin only */}
      {(isCustomer || isAdmin) && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mobile Number</label>
          <input
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="+91 98765 43210"
          />
        </div>
      )}

      {/* Organisation — customer only */}
      {isCustomer && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Organisation</label>
          <select
            name="organisationId"
            value={form.organisationId}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all hover:border-slate-300"
          >
            <option value="">No Organisation</option>
            {organisations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Department — employee only */}
      {isEmployee && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all hover:border-slate-300"
          >
            <option value="" disabled>Select department</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      {/* Password — create only */}
      {!isEdit && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="••••••••"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => { setOpen(false); setError("") }}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition"
        >
          {loading
            ? isEdit ? "Saving..." : "Adding..."
            : isEdit ? "Save Changes"
            : isCustomer ? "Add Customer" : isAdmin ? "Add Admin" : "Add Employee"}
        </button>
      </div>
    </div>
  )

  if (isEdit) {
    return (
      <div className="flex items-center gap-1.5">
        {/* Icon-only edit button */}
        <button
          type="button"
          onClick={openForEdit}
          title="Edit"
          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-amber-200 transition"
        >
          <Pencil size={14} />
        </button>

        {/* Icon-only delete button */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          title="Delete"
          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition disabled:opacity-60"
        >
          <Trash2 size={14} />
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{modalTitle}</h2>
                <button
                  onClick={() => { setOpen(false); setError("") }}
                  className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>{formFields}</form>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => {
          setForm({ id: "", name: "", email: "", mobileNumber: "", password: "", department: "", organisationId: "" })
          setError("")
          setOpen(true)
        }}
        className="rounded-full px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        {isCustomer ? "+ Add Customer" : isAdmin ? "+ Add Admin" : "+ Add Employee"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{modalTitle}</h2>
              <button
                onClick={() => { setOpen(false); setError("") }}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>{formFields}</form>
          </div>
        </div>
      )}
    </>
  )
}