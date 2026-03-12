"use client"

import { useState } from "react"
import ComplaintTable from "../complaints/ComplaintTable"
import AssignEmployee from "../complaints/AssignEmployee"
import { Complaint } from "@/types/complaint"
import StatsCards from "./StatsCard"
import DashboardFilters from "./DashboardFilters"
import { ComplaintCategory, ComplaintStatus, Priority } from "@prisma/client"
import { Search } from "lucide-react"
import ComplaintDetailsModal from "../complaints/ComplaintDetailsModal"

const categoryToDepartment = {
  TECHNICAL: "TECHNICAL",
  BILLING: "FINANCE",
  ACCOUNT: "SUPPORT",
  GENERAL: "SUPPORT",
} as const

export default function AdminDashboardView({
  initialComplaints,
  employees,
  stats,
}: any) {

  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints)
  const [openDialog, setOpenDialog] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "ALL">("ALL")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL")
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "ALL">("ALL")
  const [search, setSearch] = useState("")

  const activeComplaintObj = complaints.find(c => c.id === activeComplaintId) ?? null

  const filteredEmployees = employees.filter(
    (emp: any) =>
      emp.department ===
      categoryToDepartment[activeComplaintObj?.category as keyof typeof categoryToDepartment]
  )

  const updateComplaints = (updated: any) => {
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/complaints/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId: id, status }),
    })
    const updated = await res.json()
    if (res.ok) updateComplaints(updated)
  }

  const updatePriority = async (id: string, priority: string) => {
    const res = await fetch(`/api/complaints/${id}/priority`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
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
    if (priorityFilter !== "ALL" && c.priority !== priorityFilter) return false
    if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false
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

  return (
    <div>

      <StatsCards
        stats={stats}
        setStatusFilter={setStatusFilter}
        setPriorityFilter={setPriorityFilter}
        setCategoryFilter={setCategoryFilter}
      />

      {/* Search + Filters row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <DashboardFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          categoryFilter={categoryFilter}
          setStatusFilter={setStatusFilter}
          setPriorityFilter={setPriorityFilter}
          setCategoryFilter={setCategoryFilter}
        />

        {/* Search */}
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
        complaints={filteredComplaints}
        role="ADMIN"
        onAssignClick={handleAssignClick}
        onStatusChange={updateStatus}
        onPriorityChange={updatePriority}
        onCategoryChange={handleCategoryChange}
        onRowClick={handleRowClick}
      />

      <ComplaintDetailsModal
        complaint={activeComplaintObj}
        open={detailsOpen}
        role="ADMIN"
        onOpenChange={setDetailsOpen}
        onStatusChange={updateStatus}
        onPriorityChange={updatePriority}
        onCategoryChange={handleCategoryChange}
        onAssignClick={(id) => {
          setDetailsOpen(false)
          handleAssignClick(id)
        }}
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

    </div>
  )
}