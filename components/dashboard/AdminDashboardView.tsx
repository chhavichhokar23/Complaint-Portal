"use client"

import { useState, useEffect } from "react"
import ComplaintTable from "../complaints/ComplaintTable"
import AssignEmployee from "../complaints/AssignEmployee"
import { Complaint } from "@/types/complaint"
import StatsCards from "./StatsCard"
import DashboardFilters from "./DashboardFilters"
import { ComplaintStatus } from "@prisma/client"
import { Search } from "lucide-react"
import ComplaintDetailsModal from "../complaints/ComplaintDetailsModal"
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog"

export default function AdminDashboardView({
  initialComplaints,
  employees,
  stats,
  viewType="dashboard",
}: any) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints)
  const [openDialog, setOpenDialog] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "ALL">("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [organisationFilter, setOrganisationFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [organisations, setOrganisations] = useState<{ id: string; name: string }[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10
  const [priorities, setPriorities] = useState<{ id: string; name: string }[]>([])
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectComplaintId, setRejectComplaintId] = useState<string | null>(null)
  const [rejectMessage, setRejectMessage] = useState("")
  const [completionModalOpen, setCompletionModalOpen] = useState(false)
  const [completionComplaintId, setCompletionComplaintId] = useState<string | null>(null)
  const [completionMessage, setCompletionMessage] = useState("")
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false)
  const [resolutionComplaintId, setResolutionComplaintId] = useState<string | null>(null)
  const [resolutionMessage, setResolutionMessage] = useState("")

  useEffect(() => {
    fetch("/api/priorities")
      .then(r => r.json())
      .then(data => setPriorities(data.priorities ?? []))
  }, [])

  useEffect(() => {
    fetch("/api/organisations")
      .then(r => r.json())
      .then(data => setOrganisations(data.organisations ?? []))
  }, [])

  

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(data => setCategories((data.categories ?? []).map((c: any) => c.name)))
  }, [])

  const activeComplaintObj = complaints.find(c => c.id === activeComplaintId) ?? null

  // Look up department from fetched categories
  const [categoryDeptMap, setCategoryDeptMap] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(data => {
        const cats = data.categories ?? []
        setCategories(cats.map((c: any) => c.name))
        const map: Record<string, string> = {}
        cats.forEach((c: any) => { map[c.name] = c.department })
        setCategoryDeptMap(map)
      })
  }, [])

  const filteredEmployees = employees.filter(
    (emp: any) => emp.department === categoryDeptMap[activeComplaintObj?.category ?? ""]
  )

  const updateComplaints = (updated: any) => {
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  const updateStatus = async (id: string, status: string, message?: string) => {
    const res = await fetch("/api/complaints/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId: id, status, message }),
    })
    const updated = await res.json()
    if (res.ok) updateComplaints(updated)
  }

const onStatusChange = (id: string, status: string, message?: string) => {
  if (status === "REJECTED" && !message) {
    setRejectComplaintId(id)
    setRejectModalOpen(true)
    return
  }

  if (status === "CLOSED" && message !== "OPEN_RESOLUTION_MODAL" && !message) {
    setResolutionComplaintId(id)
    setResolutionModalOpen(true)
    return
  }

  // If message is "OPEN_RESOLUTION_MODAL", it means we came from table row dropdown
  // In that case, open the resolution modal
  if (message === "OPEN_RESOLUTION_MODAL") {
    setResolutionComplaintId(id)
    setResolutionModalOpen(true)
    return
  }

  updateStatus(id, status, message)
}
  const onStartWork = (id: string) => updateStatus(id, "IN_PROGRESS")
  const onCompleteWork = (id: string, note?: string) => {
    if (!note) {
      // Called from table row without a message, open completion modal for employee
      setCompletionComplaintId(id)
      setCompletionModalOpen(true)
      return
    }
    // Called from modal with message, proceed with update
    updateStatus(id, "COMPLETED", note)
  }

  const updatePriority = async (id: string, priorityId: string) => {
  const res = await fetch(`/api/complaints/${id}/priority`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priorityId }), 
  })
  const updated = await res.json()
  if (res.ok) updateComplaints(updated)
}

  const handleCategoryChange = async (id: string, category: string) => {
    const res = await fetch(`/api/complaints/${id}/category`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    })
    const updated = await res.json()
    if (res.ok) updateComplaints(updated)
  }

  const handleAssignClick = (id: string) => {
    setActiveComplaintId(id)
    setOpenDialog(true)
  }

  const handleRowClick = (complaint: Complaint) => {
    setActiveComplaintId(complaint.id)
    setDetailsOpen(true)
  }

  const filteredComplaints = complaints.filter((c) => {
  if (statusFilter !== "ALL" && c.status !== statusFilter) return false
  if (priorityFilter !== "ALL" && c.priority?.id !== priorityFilter) return false  // 👈 changed
  if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false
  if (organisationFilter !== "ALL") {
    if (organisationFilter === "NONE") {
      if (c.customer?.organisation?.id) return false // Exclude if has organisation
    } else {
      if (c.customer?.organisation?.id !== organisationFilter) return false
    }
  }
  if (search) {
    const s = search.toLowerCase()
    return (
      c.description?.toLowerCase().includes(s) ||
      c.subcategory?.toLowerCase().includes(s) ||
      c.category?.toLowerCase().includes(s) ||
      c.ticketNumber?.toString().includes(s) ||
      c.mobileNumber?.includes(search) ||
      c.customer?.name?.toLowerCase().includes(s)
    )
  }
  return true
})
  // Reset to page 1 whenever filters change
  useEffect(() => setCurrentPage(1), [statusFilter, priorityFilter, categoryFilter, organisationFilter, search])

  const totalPages = Math.ceil(filteredComplaints.length / PAGE_SIZE)
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  return (
    <div>
      {viewType==="dashboard"&&(<StatsCards
        stats={stats}
        setStatusFilter={setStatusFilter}
        setPriorityFilter={setPriorityFilter}
        setCategoryFilter={setCategoryFilter}
        role="ADMIN"
      />)}

      <div className="flex items-start justify-between gap-3 mb-2">
        <DashboardFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          categoryFilter={categoryFilter}
          organisationFilter={organisationFilter}
          setStatusFilter={setStatusFilter}
          setPriorityFilter={setPriorityFilter}
          setCategoryFilter={setCategoryFilter}
          setOrganisationFilter={setOrganisationFilter}
          categoryOptions={categories}
          priorityOptions={priorities}
          organisationOptions={organisations}
          role="ADMIN"
        />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-8 pr-3 h-8 bg-card border border-border rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>
      </div>

      <ComplaintTable
        complaints={paginatedComplaints}
        role="ADMIN"
        categories={categories}
        onAssignClick={handleAssignClick}
        onStatusChange={onStatusChange}
        onPriorityChange={updatePriority}
        onCategoryChange={handleCategoryChange}
        onRowClick={handleRowClick}
        priorities={priorities}
      />
          {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>
              Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredComplaints.length)} of {filteredComplaints.length} complaints
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc: (number | string)[], p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...")
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`px-2 py-1 rounded border transition ${
                        currentPage === p
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

      {/* View All Button — only show on dashboard view */}
      {viewType === "dashboard" && (
        <div className="flex justify-center mt-6">
          <a
            href="/dashboard/admin/complaints"
            className="px-4 py-2 text-sm font-medium bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            View All Complaints
          </a>
        </div>
      )}

      <ComplaintDetailsModal
        complaint={activeComplaintObj}
        open={detailsOpen}
        role="ADMIN"
        onOpenChange={setDetailsOpen}
        onStatusChange={onStatusChange}
        onStartWork={onStartWork}
        onCompleteWork={onCompleteWork}
        onPriorityChange={updatePriority}
        onCategoryChange={handleCategoryChange}
        onAssignClick={handleAssignClick}
        priorities={priorities}
        categories={categories}
        employees={employees}
      />


      {activeComplaintId && (
        <AssignEmployee
          open={openDialog}
          onOpenChange={setOpenDialog}
          employees={filteredEmployees}
          complaintId={activeComplaintId}
          defaultEmployeeId={activeComplaintObj?.assignedTo?.id}
          onAssigned={(updatedComplaint: any) => updateComplaints(updatedComplaint)}
        />
      )}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
  <DialogContent className="max-w-md">
    <DialogTitle>Reject Complaint</DialogTitle>

    <textarea
      value={rejectMessage}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setRejectMessage(e.target.value)}
      placeholder="Enter rejection reason..."
      className="w-full border rounded p-2 mt-3"
    />

    <div className="flex justify-end gap-2 mt-3">
      <button onClick={() => setRejectModalOpen(false)}>
        Cancel
      </button>

      <button
        onClick={async () => {
          if (!rejectMessage.trim()) return

          await updateStatus(rejectComplaintId!, "REJECTED", rejectMessage)

          setRejectModalOpen(false)
          setRejectMessage("")
          setRejectComplaintId(null)
        }}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Confirm Reject
      </button>
    </div>
  </DialogContent>
</Dialog>

      <Dialog open={completionModalOpen} onOpenChange={setCompletionModalOpen}>
  <DialogContent className="max-w-md">
    <DialogTitle>Completion Message</DialogTitle>

    <textarea
      value={completionMessage}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setCompletionMessage(e.target.value)}
      placeholder="Describe what was done..."
      className="w-full border rounded p-2 mt-3"
    />

    <div className="flex justify-end gap-2 mt-3">
      <button onClick={() => setCompletionModalOpen(false)}>
        Cancel
      </button>

      <button
        onClick={async () => {
          if (!completionMessage.trim()) return

          await updateStatus(completionComplaintId!, "COMPLETED", completionMessage)

          setCompletionModalOpen(false)
          setCompletionMessage("")
          setCompletionComplaintId(null)
        }}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Confirm
      </button>
    </div>
  </DialogContent>
</Dialog>

      <Dialog open={resolutionModalOpen} onOpenChange={setResolutionModalOpen}>
  <DialogContent className="max-w-md">
    <DialogTitle>Resolution Message</DialogTitle>

    <textarea
      value={resolutionMessage}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setResolutionMessage(e.target.value)}
      placeholder="Enter resolution message for customer..."
      className="w-full border rounded p-2 mt-3"
    />

    <div className="flex justify-end gap-2 mt-3">
      <button onClick={() => setResolutionModalOpen(false)}>
        Cancel
      </button>

      <button
        onClick={async () => {
          if (!resolutionMessage.trim()) return

          await updateStatus(resolutionComplaintId!, "CLOSED", resolutionMessage)

          setResolutionModalOpen(false)
          setResolutionMessage("")
          setResolutionComplaintId(null)
        }}
        className="bg-emerald-600 text-white px-4 py-2 rounded"
      >
        Confirm
      </button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  )
}