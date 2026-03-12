"use client"

import { useState } from "react"
import { Complaint } from "@/types/complaint"
import ComplaintTable from "../complaints/ComplaintTable"
import StatsCards from "./StatsCard"
import DashboardFilters from "./DashboardFilters"
import { ComplaintStatus, Priority } from "@prisma/client"
import ComplaintDetailsModal from "../complaints/ComplaintDetailsModal"

export default function EmployeeDashboardView({ initialComplaints }: any) {

  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints)
  const [activeComplaint, setActiveComplaint] = useState<string | null>(null)
  const [resolutionMessage, setResolutionMessage] = useState("")
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "ALL">("ALL")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeComplaintObj, setActiveComplaintObj] = useState<Complaint | null>(null)

    const handleRowClick = (complaint: Complaint) => {
      setActiveComplaintObj(complaint)
      setDetailsOpen(true)
    }

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "ASSIGNED").length,
    resolved: complaints.filter(c => c.status === "COMPLETED").length,
    highPriority: complaints.filter(c => c.priority === "CRITICAL").length,
  }

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false
    if (priorityFilter !== "ALL" && c.priority !== priorityFilter) return false
    return true
  })

  const updateStatus = async (complaintId: string, status: string, message?: string) => {
    const res = await fetch("/api/complaints/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId, status, resolutionMessage: message }),
    })
    const updated = await res.json()
    if (res.ok) {
      setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c))
    }
  }

  const startWork = (id: string) => updateStatus(id, "IN_PROGRESS")
  const openResolutionModal = (id: string) => setActiveComplaint(id)
  const submitResolution = () => {
    updateStatus(activeComplaint!, "COMPLETED", resolutionMessage)
    setActiveComplaint(null)
    setResolutionMessage("")
  }

  if (complaints.length === 0) {
    return <p className="text-muted-foreground">No complaints assigned yet.</p>
  }

  return (
    <div>

      <StatsCards
        stats={stats}
        setStatusFilter={setStatusFilter}
        setPriorityFilter={setPriorityFilter}
        setCategoryFilter={() => {}}
      />

      <DashboardFilters
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        categoryFilter="ALL"
        setStatusFilter={setStatusFilter}
        setPriorityFilter={setPriorityFilter}
        setCategoryFilter={() => {}}
      />

      <ComplaintTable
        complaints={filteredComplaints}
        role="EMPLOYEE"
        onStartWork={startWork}
        onCompleteWork={openResolutionModal}
        onRowClick={handleRowClick}   // ← add this
      />

      <ComplaintDetailsModal
        complaint={activeComplaintObj}
        open={detailsOpen}
        role="EMPLOYEE"
        onOpenChange={setDetailsOpen}
        onStartWork={startWork}
        onCompleteWork={openResolutionModal}
      />

      {activeComplaint && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg w-[400px] space-y-4">
            <h2 className="text-lg font-semibold">Resolution Message</h2>
            <textarea
              className="w-full border rounded p-2 text-sm"
              placeholder="Describe what you fixed..."
              value={resolutionMessage}
              onChange={(e) => setResolutionMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveComplaint(null)} className="px-3 py-1 border rounded text-sm">
                Cancel
              </button>
              <button onClick={submitResolution} className="px-3 py-1 bg-purple-600 text-white rounded text-sm">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}