"use client"

import { useEffect, useState, useRef } from "react"
import ComplaintTable from "../complaints/ComplaintTable"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Complaint } from "@/types/complaint"
import StatsCards from "./StatsCard"
import DashboardFilters from "./DashboardFilters"
import { ComplaintStatus } from "@prisma/client"
import FeedbackModal from "../complaints/FeedbackModal"
import { Check, ChevronDown, Upload, X, FileText, Image, Loader2, Paperclip } from "lucide-react"
import ComplaintDetailsModal from "../complaints/ComplaintDetailsModal"
import { useProfile } from "@/context/ProfileContext"

type ProfileUser = {
  name: string
  email: string
  mobileNumber: string | null
  organisationId: string | null
  organisation: { id: string; name: string } | null
}

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
            {options.length === 0 && (
              <p className="text-xs text-slate-400 px-3 py-2">No options available</p>
            )}
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

export default function CustomerDashboardView({
  initialComplaints,
  userMobile,
  profileUser,
}: {
  initialComplaints: Complaint[]
  userMobile: string | null
  profileUser: ProfileUser
}) {
  const { currentProfile } = useProfile()
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null)
  const [useAccountNumber, setUseAccountNumber] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "ALL">("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [feedbackComplaint, setFeedbackComplaint] = useState<Complaint | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeComplaintObj, setActiveComplaintObj] = useState<Complaint | null>(null)
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])
  const [subcategoryMap, setSubcategoryMap] = useState<Record<string, string[]>>({})

  // Attachment states
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    category: "",
    subcategory: "",
    mobileNumber: "",
    description: "",
  })

  useEffect(() => {
    let cancelled = false
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        const cats = data.categories ?? []
        const names = cats.map((c: any) => c.name)
        setCategoryOptions(names)
        const map: Record<string, string[]> = {}
        cats.forEach((c: any) => {
          map[c.name] = c.subcategories.map((s: any) => s.name)
        })
        setSubcategoryMap(map)
        if (names.length > 0) setForm(prev => ({ ...prev, category: names[0] }))
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (useAccountNumber && userMobile) {
      setForm(prev => ({ ...prev, mobileNumber: userMobile }))
    } else if (!useAccountNumber) {
      setForm(prev => ({ ...prev, mobileNumber: "" }))
    }
  }, [useAccountNumber, userMobile])

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === "OPEN" || c.status === "PENDING").length,
    inProgress: complaints.filter(c => c.status === "ASSIGNED" || c.status === "IN_PROGRESS" || c.status === "COMPLETED").length,
    closed: complaints.filter(c => c.status === "CLOSED").length,
    resolved: complaints.filter(c => c.status === "RESOLVED").length,
    rejected: complaints.filter(c => c.status === "REJECTED").length,
  }

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false
    if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false
    return true
  })

  const openCreate = () => {
    setEditingComplaint(null)
    setUseAccountNumber(false)
    setPendingFiles([])
    setForm({ category: categoryOptions[0] ?? "", subcategory: "", mobileNumber: "", description: "" })
    setModalOpen(true)
  }

  const openEdit = (c: Complaint) => {
    setEditingComplaint(c)
    setPendingFiles([])
    setForm({
      category: c.category,
      subcategory: c.subcategory || "",
      mobileNumber: c.mobileNumber ?? "",
      description: c.description,
    })
    setModalOpen(true)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    const valid = files.filter(f => allowed.includes(f.type) && f.size <= 5 * 1024 * 1024)
    setPendingFiles(prev => [...prev, ...valid])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeFile(index: number) {
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadFilesToComplaint(complaintId: string) {
    for (const file of pendingFiles) {
      const formData = new FormData()
      formData.append("file", file)
      await fetch(`/api/complaints/${complaintId}/attachments`, {
        method: "POST",
        body: formData,
      })
    }
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

    if (pendingFiles.length > 0) {
      setUploadingFiles(true)
      await uploadFilesToComplaint(editingComplaint ? editingComplaint.id : data.id)
      setUploadingFiles(false)
    }

    if (editingComplaint) {
      setComplaints(prev => prev.map((c: any) => c.id === data.id ? data : c))
    } else {
      setComplaints(prev => [...prev, data])
    }

    setPendingFiles([])
    setModalOpen(false)
  }

  const submitFeedback = async (data: any) => {
    const res = await fetch(`/api/complaints/${feedbackComplaint!.id}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ error: "non-JSON response" }))
      alert(errorBody.error || "Failed to submit feedback. Please try again.")
      return
    }

    const updated = await res.json()
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c))
    setActiveComplaintObj(prev => prev?.id === updated.id ? updated : prev)
    setFeedbackOpen(false)
    setFeedbackComplaint(null)
  }

  return (
    <div>
      {/* Top bar with greeting */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-muted-foreground">Welcome back</p>
          <h2 className="text-lg font-semibold text-foreground">{currentProfile?.name || profileUser.name}</h2>
        </div>
      </div>

      <StatsCards
        stats={stats}
        setStatusFilter={setStatusFilter}
        setPriorityFilter={() => {}}
        setCategoryFilter={setCategoryFilter}
        role="CUSTOMER"
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
          categoryOptions={categoryOptions}
          role="CUSTOMER"
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
        onRowClick={(complaint) => {
          setActiveComplaintObj(complaint)
          setDetailsOpen(true)
        }}
      />

      {/* Raise / Edit complaint modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[420px] p-0 overflow-visible rounded-2xl">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 rounded-t-2xl">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-1">
              {editingComplaint ? "Edit" : "New"} Complaint
            </p>
            <DialogTitle className="text-white text-xl font-semibold">
              {editingComplaint ? "Edit Complaint" : "Raise a Complaint"}
            </DialogTitle>
          </div>

          <div className="px-6 py-5 space-y-4 rounded-b-2xl max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-1.5">Category</p>
                <CustomSelect
                  value={form.category}
                  onChange={(val) => setForm({ ...form, category: val, subcategory: "" })}
                  options={categoryOptions.map(c => ({ label: c.charAt(0) + c.slice(1).toLowerCase(), value: c }))}
                  placeholder="Select category"
                />
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-1.5">Subcategory</p>
                <CustomSelect
                  value={form.subcategory}
                  onChange={(val) => setForm({ ...form, subcategory: val })}
                  options={(subcategoryMap[form.category] ?? []).map(s => ({ label: s, value: s }))}
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

            {/* Attachments — for new complaints and when editing OPEN complaints */}
            {!editingComplaint || editingComplaint?.status === "OPEN" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1">
                    <Paperclip size={10} />
                    Attachments
                    {pendingFiles.length > 0 && (
                      <span className="ml-1 bg-slate-200 text-slate-500 rounded-full px-1.5 py-0.5 text-[9px]">
                        {pendingFiles.length}
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <Upload size={11} />
                    Add file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {pendingFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {pendingFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {file.type === "application/pdf" ? (
                            <FileText size={13} className="text-rose-500 flex-shrink-0" />
                          ) : (
                            <Image size={13} className="text-indigo-500 flex-shrink-0" />
                          )}
                          <span className="text-xs text-slate-700 truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {(file.size / 1024).toFixed(0)}KB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer ml-2 flex-shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-slate-400">JPG, PNG, WEBP or PDF · Max 5MB each</p>
              </div>
            ) : null}

            <div className="flex gap-2">
              <button
                onClick={() => { setModalOpen(false); setPendingFiles([]) }}
                className="flex-1 h-9 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploadingFiles}
                className="flex-1 h-9 rounded-lg text-sm font-medium bg-slate-700 text-white hover:bg-slate-600 transition disabled:opacity-60"
              >
                {uploadingFiles ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" />
                    Uploading...
                  </span>
                ) : editingComplaint ? "Save Changes" : "Submit"}
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
        onGiveFeedback={(complaint) => {
          setFeedbackComplaint(complaint)
          setFeedbackOpen(true)
        }}
      />

      <FeedbackModal
        complaint={feedbackComplaint}
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        onSubmit={submitFeedback}
        resolutionMessage={feedbackComplaint?.resolutionMessage}
      />
    </div>
  )
}