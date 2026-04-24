"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, X } from "lucide-react"

type PendingUser = {
  id: string
  name: string
  email: string
  role: string
  organisation: { name: string } | null 
  department: string | null
  mobileNumber: string | null
  createdAt: string
}

export default function RegistrationNotification() {
  const [pending, setPending] = useState<PendingUser[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchPending = () => {
    fetch("/api/admin/users?pending=true")
      .then(r => r.json())
      .then(data => setPending(data.users ?? []))
  }

  useEffect(() => {
    fetchPending()
    const interval = setInterval(fetchPending, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, registrationStatus: status }),
    })
    if (res.ok) setPending(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition"
      >
        <Bell className="w-4 h-4 text-slate-600" />
        {pending.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {pending.length > 9 ? "9+" : pending.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Pending Registrations</p>
            <p className="text-xs text-muted-foreground">{pending.length} awaiting approval</p>
          </div>

          {pending.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              No pending registrations...
            </div>
          ) : (
            <>
              <ul className="divide-y divide-slate-50">
                {pending.slice(0, 3).map(user => (
                  <li key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user.role === "EMPLOYEE"
                          ? user.department ?? "No department"
                          : user.organisation?.name ?? "No organisation"} 
                      </p>
                      {/* Role badge */}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        user.role === "EMPLOYEE"
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-green-50 text-green-600"
                      }`}>
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <button
                        onClick={() => handleAction(user.id, "APPROVED")}
                        className="p-1.5 rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition"
                        title="Approve"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAction(user.id, "REJECTED")}
                        className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition"
                        title="Reject"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 border-t border-slate-100">
                <button
                  onClick={() => { setOpen(false); router.push("/dashboard/admin/registrations") }}
                  className="w-full text-xs text-primary font-medium hover:underline text-center"
                >
                  More details →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}