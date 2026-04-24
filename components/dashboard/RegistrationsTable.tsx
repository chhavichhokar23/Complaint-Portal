"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"

type PendingUser = {
  id: string
  name: string
  email: string
  role: string
  organisation: string | null
  department: string | null
  mobileNumber: string | null
  createdAt: string
}

export default function RegistrationsTable({
  initialPending,
  activeType,
}: {
  initialPending: PendingUser[]
  activeType: "customers" | "employees"
}) {
  const [pending, setPending] = useState(initialPending)

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, registrationStatus: status }),
    })
    if (res.ok) setPending(prev => prev.filter(u => u.id !== id))
  }

  if (pending.length === 0) {
    return (
      <div className="border rounded-xl px-6 py-12 text-center text-sm text-muted-foreground">
        No pending registrations
      </div>
    )
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className={`grid ${activeType === "customers" ? "grid-cols-6" : "grid-cols-5"} bg-gray-100 text-gray-600 text-sm font-medium px-4 py-3`}>
        <div>Name</div>
        <div>Email</div>
        <div>{activeType === "employees" ? "Department" : "Organisation"}</div>
        {activeType === "customers" && <div>Mobile</div>}
        <div>Registered</div>
        <div>Actions</div>
        </div>
      {pending.map(user => (
        <div key={user.id} className={`grid ${activeType === "customers" ? "grid-cols-6" : "grid-cols-5"} px-4 py-3 border-t text-sm items-center hover:bg-slate-50 transition`}>
            <div className="font-medium text-slate-700">{user.name}</div>
            <div className="text-slate-500 text-xs truncate">{user.email}</div>
            <div className="text-slate-500 text-xs">
                {activeType === "employees" ? user.department ?? "—" : user.organisation ?? "—"}
            </div>
            {activeType === "customers" && (
                <div className="text-slate-500 text-xs">{user.mobileNumber ?? "—"}</div>
            )}
            <div className="text-slate-500 text-xs">
                {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
            <div className="flex gap-2">
                <button onClick={() => handleAction(user.id, "APPROVED")} className="p-1.5 rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition" title="Approve">
                <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleAction(user.id, "REJECTED")} className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition" title="Reject">
                <X className="w-3.5 h-3.5" />
                </button>
            </div>
            </div>
      ))}
    </div>
  )
}