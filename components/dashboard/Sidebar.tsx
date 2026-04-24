"use client"

import Link from "next/link"
import { LayoutDashboard, LogOut, ChevronLeft, ChevronRight, Users, Database, FileText } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

type SidebarProps = {
  user?: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.refresh()
    router.push("/login")
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  const dashboardHref = user?.role
    ? `/dashboard/${user.role.toLowerCase()}`
    : "/dashboard"

  // Helper to check if link is active
  const isActive = (href: string) => {
    if (href === dashboardHref) {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div
      className={`h-screen bg-gradient-to-b from-slate-800 to-slate-700 flex flex-col justify-between py-6 transition-all duration-300 ease-in-out ${
        collapsed ? "w-16 px-2" : "w-60 px-4"
      }`}
    >
      {/* TOP */}
      <div>

        {/* Logo + collapse toggle */}
        <div className={`flex items-center mb-8 px-2 ${collapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">CP</span>
            </div>
            {!collapsed && (
              <span className="font-semibold text-white text-sm truncate">
                Complaint Portal
              </span>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setCollapsed(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* NAV */}
        <nav className="flex flex-col gap-1">
          <Link
            href={dashboardHref}
            title="Dashboard"
            className={`flex items-center gap-3 rounded-lg text-sm transition-colors group ${
              isActive(dashboardHref)
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            } ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}
          >
            <LayoutDashboard size={18} className="flex-shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/dashboard/admin/masters"
              title="Masters"
              className={`flex items-center gap-3 rounded-lg text-sm transition-colors group ${
                isActive("/dashboard/admin/masters")
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}
            >
              <Database size={18} className="flex-shrink-0" />
              {!collapsed && <span>Masters</span>}
            </Link>
          )}
        </nav>

        {user?.role === "ADMIN" && (
          <Link
            href="/dashboard/admin/employees"
            title="Employee Performance"
            className={`flex items-center gap-3 rounded-lg text-sm transition-colors group ${
              isActive("/dashboard/admin/employees")
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            } ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}
          >
            <Users size={18} className="flex-shrink-0" />
            {!collapsed && <span>Employees</span>}
          </Link>
        )}
        {user?.role === "ADMIN" && (
          <Link
            href="/dashboard/admin/complaints"
            title="All Complaints"
            className={`flex items-center gap-3 rounded-lg text-sm transition-colors group ${
              isActive("/dashboard/admin/complaints")
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            } ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}
          >
            <FileText size={18} className="flex-shrink-0" />
            {!collapsed && <span>All Complaints</span>}
          </Link>
        )}

      </div>
      
      {/* BOTTOM */}
      <div className="border-t border-white/10 pt-4">
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center" title={user?.name || "User"}>
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || "User"}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}