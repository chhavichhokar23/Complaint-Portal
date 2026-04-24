"use client"

import { useState, useMemo } from "react"
import AddUserModal from "@/components/dashboard/AddUserModal"

type User = {
  id: string
  name: string
  email: string
  mobileNumber?: string | null
  department?: string | null
  organisationName?: string | null
  organisationId?: string | null
  createdAt: string
}

type Props = {
  activeType: "customers" | "employees" | "admins"
  customers: User[]
  employees: User[]
  admins: User[]
  departmentList: string[]
}

export default function UsersTable({
  activeType,
  customers,
  employees,
  admins,
  departmentList,
}: Props) {
  const [search, setSearch] = useState("")
  const [selectedDept, setSelectedDept] = useState("")

  const rows =
    activeType === "employees"
      ? employees
      : activeType === "admins"
      ? admins
      : customers

  const roleForModal =
    activeType === "employees"
      ? "EMPLOYEE"
      : activeType === "admins"
      ? "ADMIN"
      : "CUSTOMER"

  const filtered = useMemo(() => {
    return rows.filter((user) => {
      const matchesSearch =
        search === "" ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.mobileNumber?.toLowerCase().includes(search.toLowerCase()) ?? false)

      const matchesDept =
        activeType !== "employees" ||
        selectedDept === "" ||
        user.department === selectedDept

      return matchesSearch && matchesDept
    })
  }, [rows, search, selectedDept, activeType])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {activeType === "employees" && (
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all hover:border-slate-300 cursor-pointer"
          >
            <option value="">All Departments</option>
            {departmentList.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        )}

        {(search || selectedDept) && (
          <button
            onClick={() => { setSearch(""); setSelectedDept("") }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-400">
        Showing {filtered.length} of {rows.length}{" "}
        {activeType === "employees" ? "employees" : activeType === "admins" ? "admins" : "customers"}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Email</th>
              {activeType === "customers" && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Mobile</th>
              )}
              {activeType === "customers" && (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Organisation</th>
                )}
              {activeType === "employees" && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Department</th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Created At</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{user.email}</td>
                {activeType === "customers" && (
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {user.mobileNumber || "—"}
                  </td>
                )}
                {activeType === "customers" && (
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {user.organisationName || "—"}
                  </td>
                )}
                {activeType === "employees" && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.department ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {user.department}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <AddUserModal
                    mode="edit"
                    role={roleForModal}
                    user={{
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      role: roleForModal,
                      mobileNumber: user.mobileNumber,
                      department: user.department,
                      organisationId: user.organisationId,
                    }}
                  />
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  {search || selectedDept
                    ? "No results match your filters."
                    : activeType === "employees"
                    ? "No employees found."
                    : activeType === "admins"
                    ? "No admins found."
                    : "No customers found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}