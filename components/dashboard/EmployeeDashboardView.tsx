"use client"

import { useState,useEffect } from "react"
import { Complaint } from "@/types/complaint"
import ComplaintTable from "../complaints/ComplaintTable"
import StatsCards from "./StatsCard"
import DashboardFilters from "./DashboardFilters"
import { ComplaintStatus } from "@prisma/client"
import ComplaintDetailsModal from "../complaints/ComplaintDetailsModal"
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog"

export default function EmployeeDashboardView({ initialComplaints }: any) {

  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints)
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "ALL">("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeComplaintObj, setActiveComplaintObj] = useState<Complaint | null>(null)
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])
  const [priorities, setPriorities] = useState<{ id: string; name: string }[]>([])
  const [completionModalOpen, setCompletionModalOpen] = useState(false)
  const [completionComplaintId, setCompletionComplaintId] = useState<string | null>(null)
  const [completionMessage, setCompletionMessage] = useState("")
  useEffect(() => {
    fetch("/api/priorities")
      .then(r => r.json())
      .then(data => setPriorities(data.priorities ?? []))
  }, [])



    const handleRowClick = (complaint: Complaint) => {
      setActiveComplaintObj(complaint)
      setDetailsOpen(true)
    }

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === "OPEN").length,
    inProgress: complaints.filter(c => c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length,
    completed: complaints.filter(c => c.status === "COMPLETED").length,
    closed: complaints.filter(c => c.status === "CLOSED").length,
    resolved: complaints.filter(c => c.status === "RESOLVED").length,
    rejected: complaints.filter(c => c.status === "REJECTED").length,
  }

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false
    if (priorityFilter !== "ALL" && c.priority?.id !== priorityFilter) return false 
    return true
  })

  const updateStatus = async (complaintId: string, status: string, message?: string) => {
    const res = await fetch("/api/complaints/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId, status, message }),
    })
    const updated = await res.json()
    if (res.ok) {
      setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c))
    }
  }

  const onStartWork = (id: string) => updateStatus(id, "IN_PROGRESS")
  const onCompleteWork = (id: string, note?: string) => {
    if (!note) {
      // Called from table row without a message, open modal
      setCompletionComplaintId(id)
      setCompletionModalOpen(true)
      return
    }
    // Called from modal with message, proceed with update
    updateStatus(id, "COMPLETED", note)
  }
  const onStatusChange = (id: string, status: string, message?: string) => updateStatus(id, status, message)

  if (complaints.length === 0) {
    return <p className="text-muted-foreground">No complaints assigned yet.</p>
  }
  useEffect(() => {
  fetch("/api/admin/categories")
    .then(r => r.json())
    .then(data => setCategoryOptions((data.categories ?? []).map((c: any) => c.name)))
}, [])

  return (
    <div>

      <StatsCards
        stats={stats}
        setStatusFilter={setStatusFilter}
        setPriorityFilter={setPriorityFilter}
        setCategoryFilter={() => {}}
        role="EMPLOYEE"
      />

      <DashboardFilters
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        categoryFilter="ALL"
        setStatusFilter={setStatusFilter}
        setPriorityFilter={setPriorityFilter}
        setCategoryFilter={() => {}}
        categoryOptions={categoryOptions}
        priorityOptions={priorities}
        role="EMPLOYEE"
      />

      <ComplaintTable
        complaints={filteredComplaints}
        role="EMPLOYEE"
        onStartWork={onStartWork}
        onCompleteWork={onCompleteWork}
        onRowClick={handleRowClick}
      />

      <ComplaintDetailsModal
        complaint={activeComplaintObj}
        open={detailsOpen}
        role="EMPLOYEE"
        onOpenChange={setDetailsOpen}
        onStatusChange={onStatusChange}
        onStartWork={onStartWork}
        onCompleteWork={onCompleteWork}
      />

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

    </div>
  )
}