"use client"

import { useEffect, useState, useRef } from "react"
import ComplaintTable from "../complaints/ComplaintTable"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Complaint } from "@/types/complaint"
import StatsCards from "./StatsCard"
import DashboardFilters from "./DashboardFilters"
import { ComplaintCategory, ComplaintStatus } from "@prisma/client"
import FeedbackModal from "../complaints/FeedbackModal"
import { Check, ChevronDown } from "lucide-react"
import ComplaintDetailsModal from "../complaints/ComplaintDetailsModal"

const subcategories: Record<string, string[]> = {
  TECHNICAL: ["Login Issue", "Server Error", "Software Bug"],
  BILLING: ["Payment Failure", "Refund Issue"],
  ACCOUNT: ["Password Reset", "Profile Update"],
  GENERAL: ["Other"],
}

const categoryOptions = ["TECHNICAL", "BILLING", "ACCOUNT", "GENERAL"]

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (val: string) => void
  options: { label: string; value: string }[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2 text-sm hover:border-slate-300 transition-all"
      >
        <span className={selected ? "text-foreground font-medium" : "text-muted-foreground"}>
          {selected?.label || placeholder || "Select"}
        </span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-card border border-border rounded-xl shadow-md overflow-hidden">
          <div className="max-h-44 overflow-y-auto custom-scroll">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-accent transition-colors"
              >
                <span className={value === opt.value ? "font-semibold" : "text-muted-foreground"}>{opt.label}</span>
                {value === opt.value && <Check size={13} className="text-muted-foreground" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CustomerDashboardView({ initialComplaints, userMobile }: any) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null)
  const [useAccountNumber, setUseAccountNumber] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "ALL">("ALL")
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "ALL">("ALL")
  const [feedbackComplaint, setFeedbackComplaint] = useState<Complaint | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
const [activeComplaintObj, setActiveComplaintObj] = useState<Complaint | null>(null)

  const [form, setForm] = useState({
    category: "TECHNICAL",
    subcategory: "",
    mobileNumber: "",
    description: "",
  })

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "PENDING").length,
    resolved: complaints.filter(c => c.status === "RESOLVED").length,
    highPriority: complaints.filter(c => c.priority === "HIGH" || c.priority === "CRITICAL").length,
  }

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false
    if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false
    return true
  })

 useEffect(() => {
  if (useAccountNumber && userMobile) {
    setForm(prev => ({ ...prev, mobileNumber: userMobile }))
  } else if (!useAccountNumber) {
    setForm(prev => ({ ...prev, mobileNumber: "" }))
  }
}, [useAccountNumber])

  const openCreate = () => {
  setEditingComplaint(null)
  setUseAccountNumber(false) // ← reset checkbox state
  setForm({ category: "TECHNICAL", subcategory: "", mobileNumber: "", description: "" })
  setModalOpen(true)
}

  const openEdit = (c: Complaint) => {
    setEditingComplaint(c)
    setForm({
      category: c.category,
      subcategory: c.subcategory || "",
      mobileNumber: c.mobileNumber ?? "",
      description: c.description,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const url = editingComplaint ? `/api/complaints/${editingComplaint.id}/edit` : "/api/complaints"
    const method = editingComplaint ? "PATCH" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { alert(data.error || data.message); return }
    if (editingComplaint) {
      setComplaints(prev => prev.map((c: any) => c.id === data.id ? data : c))
    } else {
      setComplaints(prev => [...prev, data])
    }
    setModalOpen(false)
  }

  const submitFeedback = async (data: any) => {
    const res = await fetch(`/api/complaints/${feedbackComplaint!.id}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) { console.error("Feedback request failed"); return }
    const updated = await res.json()
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c))
    setFeedbackOpen(false)
  }

  return (
    <div>
      <StatsCards
        stats={stats}
        setStatusFilter={setStatusFilter}
        setPriorityFilter={() => {}}
        setCategoryFilter={setCategoryFilter}
        hideHighPriority
      />

      <div className="flex items-center justify-between mb-4">
        <DashboardFilters
          statusFilter={statusFilter}
          priorityFilter="ALL"
          categoryFilter={categoryFilter}
          setStatusFilter={setStatusFilter}
          setPriorityFilter={() => {}}
          setCategoryFilter={setCategoryFilter}
          hidePriority
        />
        <button
          onClick={openCreate}
          className="h-9 px-4 rounded-lg text-sm font-medium bg-slate-700 text-white hover:bg-slate-600 transition cursor-pointer"
        >
          Raise Complaint
        </button>
      </div>

      <ComplaintTable
        complaints={filteredComplaints}
        role="CUSTOMER"
        onEdit={openEdit}
        onGiveFeedback={(complaint) => {
          setFeedbackComplaint(complaint)
          setFeedbackOpen(true)
        }}
        onRowClick={(complaint) => {        // ← add this
          setActiveComplaintObj(complaint)
          setDetailsOpen(true)
        }}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[420px] p-0 overflow-visible rounded-2xl">

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 rounded-t-2xl">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-1">
              {editingComplaint ? "Edit" : "New"} Complaint
            </p>
            <DialogTitle className="text-white text-xl font-semibold">
              {editingComplaint ? "Edit Complaint" : "Raise a Complaint"}
            </DialogTitle>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4 rounded-b-2xl">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-1.5">Category</p>
                <CustomSelect
                  value={form.category}
                  onChange={(val) => setForm({ ...form, category: val, subcategory: "" })}
                  options={categoryOptions.map(c => ({ label: c.charAt(0) + c.slice(1).toLowerCase(), value: c }))}
                />
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-1.5">Subcategory</p>
                <CustomSelect
                  value={form.subcategory}
                  onChange={(val) => setForm({ ...form, subcategory: val })}
                  options={subcategories[form.category].map(s => ({ label: s, value: s }))}
                  placeholder="Select"
                />
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-1.5">Mobile Number</p>
              <input
                placeholder="Enter mobile number"
                disabled={useAccountNumber}
                value={form.mobileNumber ?? ""}
                onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
              />
              <label className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" checked={useAccountNumber} onChange={(e) => setUseAccountNumber(e.target.checked)} className="rounded" />
                Use my account number
              </label>
            </div>

            <div>
              <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-1.5">Description</p>
              <textarea
                placeholder="Describe your issue..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 h-9 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 h-9 rounded-lg text-sm font-medium bg-slate-700 text-white hover:bg-slate-600 transition"
              >
                {editingComplaint ? "Save Changes" : "Submit"}
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
      <ComplaintDetailsModal
        complaint={activeComplaintObj}
        open={detailsOpen}
        role="CUSTOMER"
        onOpenChange={setDetailsOpen}
      />
      <FeedbackModal
        complaint={feedbackComplaint}
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        onSubmit={submitFeedback}
      />
      
    </div>
  )
}