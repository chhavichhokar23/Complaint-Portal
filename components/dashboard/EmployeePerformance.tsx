"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts"
import { Users, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react"

export default function EmployeePerformance() {
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/employees/performance")
      .then(res => res.json())
      .then(data => setEmployees(data))
  }, [])

  const totalAssigned  = employees.reduce((s, e) => s + e.assigned,    0)
  const totalCompleted = employees.reduce((s, e) => s + e.completed,   0)
  const totalResolved  = employees.reduce((s, e) => s + e.resolved,    0)
  const totalBreaches  = employees.reduce((s, e) => s + e.slaBreaches, 0)

  const resolutionRate = totalAssigned
  ? Math.round((totalResolved / totalAssigned) * 100)
  : 0

  const statCards = [
    {
      label: "Total Assigned",
      value: totalAssigned,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
    },
    { label: "Resolved",value: totalResolved,         icon: CheckCircle, color: "bg-emerald-50 text-emerald-600", iconBg: "bg-emerald-100" },
{ label: "Resolution Rate",  value: `${resolutionRate}%`,  icon: TrendingUp,  color: "bg-violet-50 text-violet-600",   iconBg: "bg-violet-100"  },
    {
      label: "SLA Breaches",
      value: totalBreaches,
      icon: AlertTriangle,
      color: totalBreaches > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500",
      iconBg: totalBreaches > 0 ? "bg-red-100" : "bg-slate-100",
    },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-slate-800 text-white text-xs rounded-xl px-3 py-2 shadow-lg space-y-1">
        <p className="font-semibold text-slate-200 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.fill }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-2xl p-4 border border-slate-100 ${card.color}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">{card.label}</p>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${card.iconBg}`}>
                <card.icon size={14} />
              </div>
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

        {/* Bar chart — tickets by employee */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Tickets Overview</p>
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Assigned vs Completed vs Resolved per Employee</h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employees} barGap={5}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="square"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  formatter={(value) => <span className="text-slate-500 ml-1">{value}</span>}></Legend>
                <Bar dataKey="assigned"  name="Assigned"  fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4,4,0,0]} />
                <Bar dataKey="resolved"  name="Resolved"  fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Breakdown</p>
          <h2 className="text-sm font-semibold text-slate-700">Employee Performance</h2>
        </div>

        <div className="grid grid-cols-5 bg-slate-50 text-[11px] font-semibold uppercase tracking-widest text-slate-400 text-center px-5 py-3">
          <div>Employee</div>
          <div>Assigned</div>
          <div>Completed</div>
          <div>Resolved</div>
          <div>SLA Breaches</div>
        </div>

        {employees.map((emp, i) => {
          return (
            <div key={emp.id} className="grid grid-cols-5 text-center px-5 py-3.5 border-t border-slate-50 text-sm items-center hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {emp.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-slate-700">{emp.name}</span>
              </div>
              <div className="text-slate-600">{emp.assigned}</div>
                <div className="text-slate-600">{emp.completed}</div>
              <div className="text-slate-600">{emp.resolved}</div>
              <div>
                {emp.slaBreaches > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                    <AlertTriangle size={10} />
                    {emp.slaBreaches}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                    <CheckCircle size={10} />
                    0
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}