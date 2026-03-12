"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Check, ChevronDown } from "lucide-react"

type Employee = { id: string; name: string }

export default function AssignEmployee({
  open,
  onOpenChange,
  employees,
  complaintId,
  onAssigned,
  defaultEmployeeId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
  complaintId: string
  onAssigned: (updatedComplaint: any) => void
  defaultEmployeeId?: string
}) {
  const [selected, setSelected] = useState(defaultEmployeeId || "")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedName = employees.find(e => e.id === selected)?.name

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleAssign = async () => {
    const res = await fetch("/api/complaints/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId, employeeId: selected }),
    })
    const updated = await res.json()
    onAssigned(updated)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px] p-0 rounded-2xl overflow-visible">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 rounded-t-2xl">
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-1">Assignment</p>
          <DialogTitle className="text-white text-xl font-semibold">Assign Employee</DialogTitle>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3  rounded-b-2xl">

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-2">
              Select Employee
            </p>

            <div ref={ref} className="relative">
              <button
                onClick={() => setDropdownOpen(p => !p)}
                className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm hover:border-slate-300 transition-all"
              >
                <span className={selectedName ? "text-slate-800 font-medium" : "text-slate-400"}>
                  {selectedName || "Choose an employee"}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
                  {employees.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-3">No employees available</p>
                  ) : (
                    <div className="max-h-44 overflow-y-auto custom-scroll">
                      {employees.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => { setSelected(emp.id); setDropdownOpen(false) }}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <span className={selected === emp.id ? "font-semibold text-slate-900" : ""}>
                            {emp.name}
                          </span>
                          {selected === emp.id && <Check size={13} className="text-slate-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-1">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              disabled={!selected}
              onClick={handleAssign}
              className="flex-1 h-9 rounded-lg text-sm font-medium bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Assign
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}