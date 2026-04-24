"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { getStatusColor, getStatusLabel } from "@/lib/complaintUtils"
import { Complaint } from "@/types/complaint"
import { FileText, User, Phone, CheckCircle, Building2, Clock, Tag, Layers, Loader2, Pencil } from "lucide-react"
import { useState } from "react"
import ComplaintAttachments from "./ComplaintAttachments"
import CustomerActions from "./CustomerActions"
import EmployeeActions from "./EmployeeActions"
import AdminActions from "./AdminActions"
import { useComplaintActions } from "./useComplaintActions"

const starColors = ["", "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"]

type Props = {
  complaint: Complaint | null
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: "ADMIN" | "EMPLOYEE" | "CUSTOMER"
  onStartWork?: (id: string) => void
  onCompleteWork?: (id: string, note?: string) => void
  onStatusChange?: (id: string, status: string, message?: string) => void
  onPriorityChange?: (id: string, priorityId: string) => void
  onCategoryChange?: (id: string, category: string) => void
  onAssignClick?: (id: string) => void
  priorities?: { id: string; name: string }[]
  categories?: string[]
  employees?: { id: string; name: string }[]
  onGiveFeedback?: (complaint: Complaint) => void
}

export default function ComplaintDetailsModal({
  complaint,
  open,
  onOpenChange,
  role,
  onStartWork,
  onCompleteWork,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onAssignClick,
  priorities = [],
  categories = [],
  onGiveFeedback,
}: Props) {
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showResolutionModal, setShowResolutionModal] = useState(false)
  const [rejectionText, setRejectionText] = useState("")
  const [resolutionText, setResolutionText] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<"details" | "history">("details")

  const { isSubmitting, handleStatusChange, handleStartWork } = useComplaintActions({
    complaint, onStatusChange, onStartWork, onOpenChange,
  })

  if (!complaint) return null

  const isAdmin    = role === "ADMIN"
  const isEmployee = role === "EMPLOYEE"
  const isCustomer = role === "CUSTOMER"

  const latestFeedback   = complaint.feedbacks?.[0]
  const previousFeedback = complaint.feedbacks?.slice(1) ?? []
  const resolutions      = complaint.resolutions ?? []

  const visibleResolutions = resolutions.filter(res => {
    if (isAdmin)    return true
    if (isEmployee) return ["EMPLOYEE_NOTE", "ADMIN_RESOLUTION", "ADMIN_TO_EMPLOYEE", "REJECTION"].includes(res.type)
    if (isCustomer) return ["ADMIN_RESOLUTION", "REJECTION"].includes(res.type)
    return false
  })

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          key={complaint.id}
          className="max-w-5xl h-[90vh] p-0 overflow-hidden rounded-2xl shadow-xl border-0 [&>button:last-child]:hidden"
        >
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle className="text-white text-base font-semibold leading-tight">
                  Ticket #{complaint.ticketNumber}
                </DialogTitle>
                <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                  <Clock size={10} />
                  {new Date(complaint.createdAt).toLocaleString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "numeric", minute: "2-digit",
                  })}
                </p>
              </div>

              {complaint.slaDeadline && (
                <div className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                  <Clock size={10} className="text-slate-300" />
                  <span className="text-xs text-slate-300">SLA: </span>
                  <span className="text-xs font-medium text-white">
                    {new Date(complaint.slaDeadline).toLocaleString("en-IN", {
                      day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>

            {isAdmin ? (
              <select
                value={complaint.status}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "REJECTED") setShowRejectionModal(true)
                  else if (value === "CLOSED") setShowResolutionModal(true)
                  else handleStatusChange(value)
                }}
                disabled={isSubmitting}
                className={`px-3 py-1.5 rounded-full appearance-none hover:appearance-auto text-xs font-semibold border-none outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all ${getStatusColor(complaint.status)}`}
              >
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CLOSED">Closed</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PENDING">Pending</option>
              </select>
            ) : (
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${getStatusColor(complaint.status)}`}>
                {getStatusLabel(complaint.status, role)}
              </span>
            )}
          </div>

          {/* ── Body ── */}
          <div className="flex flex-col h-[calc(90vh-68px)] overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-0 border-b border-slate-200 px-6 bg-slate-50 flex-shrink-0">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "details"
                    ? "border-slate-800 text-slate-800"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "history"
                    ? "border-slate-800 text-slate-800"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                History
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {activeTab === "details" ? (
                <>
                  {/* Left column — Details Tab */}
                  <div className="flex-1 min-w-0 overflow-y-auto px-6 py-3 space-y-3 custom-scroll">

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1.5">
                  <Tag size={11} className="text-slate-400 shrink-0" />
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Category</span>
                  {isAdmin ? (
                    <select
                      value={complaint.category}
                      onChange={(e) => onCategoryChange?.(complaint.id, e.target.value)}
                      className="ml-1 px-2 py-0.5 rounded text-xs font-semibold border-none outline-none cursor-pointer bg-slate-100 text-slate-800 transition-all hover:bg-slate-200"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-semibold text-slate-800 ml-1">{complaint.category}</span>
                  )}
                </div>

                {complaint.subcategory && (
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1.5">
                    <Layers size={11} className="text-slate-400 flex-shrink-0" />
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Sub</span>
                    <span className="text-xs font-semibold text-slate-800 ml-1">{complaint.subcategory}</span>
                  </div>
                )}

                {!isCustomer && (
                  <div className="flex items-center gap-1.5 bg-orange-50 rounded-lg px-2.5 py-1.5">
                    <span className="text-[10px] font-medium text-orange-500 uppercase tracking-wide">Priority</span>
                    {isAdmin ? (
                      <select
                        value={complaint.priority?.id ?? ""}
                        onChange={(e) => onPriorityChange?.(complaint.id, e.target.value)}
                        className="ml-1 px-3 py-1 rounded-full appearance-none hover:appearance-auto text-xs font-semibold border-none outline-none cursor-pointer bg-orange-50 text-orange-700 transition-all hover:bg-orange-100"
                      >
                        <option value="">No priority</option>
                        {priorities.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-semibold text-orange-700 ml-1">
                        {complaint.priority?.name ?? "—"}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide flex items-center gap-1 mb-2">
                  <FileText size={10} /> Description
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">{complaint.description}</p>
              </div>

              {/* Resolution message — admin/employee only */}
              {complaint.resolutionMessage && !isCustomer && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
                  <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide flex items-center gap-1 mb-2">
                    <CheckCircle size={10} /> Resolution
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">{complaint.resolutionMessage}</p>
                </div>
              )}

              {/* Feedback */}
              {latestFeedback && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                  <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wide mb-2.5">
                    Customer Feedback
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                          fill={s <= latestFeedback.rating ? starColors[s] : "none"}
                          stroke={s <= latestFeedback.rating ? starColors[s] : "#d1d5db"}
                          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(latestFeedback.createdAt).toLocaleString("en-IN", {
                        day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {latestFeedback.comment && (
                    <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{latestFeedback.comment}</p>
                  )}
                  {previousFeedback.length > 0 && (
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-xs text-blue-500 hover:text-blue-700 mt-2 font-medium transition-colors"
                    >
                      {showHistory ? "Hide history" : `View ${previousFeedback.length} previous`}
                    </button>
                  )}
                  {showHistory && (
                    <div className="mt-3 space-y-3 border-t border-amber-200 pt-3">
                      {previousFeedback.map(f => (
                        <div key={f.id}>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <svg key={s} width="12" height="12" viewBox="0 0 24 24"
                                  fill={s <= f.rating ? starColors[s] : "none"}
                                  stroke={s <= f.rating ? starColors[s] : "#d1d5db"}
                                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                            <p className="text-xs text-slate-400">
                              {new Date(f.createdAt).toLocaleString("en-IN", {
                                day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {f.comment && <p className="text-xs text-slate-600 mt-1">{f.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Role-based actions ── */}
              {isCustomer && (
                <CustomerActions complaint={complaint} onGiveFeedback={onGiveFeedback} />
              )}
              {isEmployee && (
                <EmployeeActions
                  status={complaint.status}
                  isSubmitting={isSubmitting}
                  onStartWork={handleStartWork}
                  onCompleteWork={() => onCompleteWork?.(complaint.id)}
                />
              )}
              {isAdmin && (
                <AdminActions
                  status={complaint.status}
                  isSubmitting={isSubmitting}
                  onStatusChange={handleStatusChange}
                  onOpenRejectionModal={() => setShowRejectionModal(true)}
                  onOpenResolutionModal={() => setShowResolutionModal(true)}
                />
              )}

              {/* Resolution history */}
              {/* Moved to History tab */}
            </div>

            {/* Right column — Customer Details, Assigned, Attachments */}
            <div className="w-72 flex-shrink-0 border-l border-slate-100 overflow-y-auto custom-scroll bg-slate-50/50 flex flex-col">
              {/* Customer Details Card */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={14} className="text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Customer Details</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{complaint.customer?.name ?? "—"}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Phone size={10} className="flex-shrink-0" />{complaint.mobileNumber ?? "No mobile"}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Building2 size={10} className="flex-shrink-0" />{complaint.customer?.organisation?.name ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Card — only for admin/employee */}
              {!isCustomer && (
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={14} className="text-violet-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Assigned To</p>
                      <button
                        onClick={() => onAssignClick?.(complaint.id)}
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
                      >
                        <span className="text-sm font-semibold text-slate-800">
                          {complaint.assignedTo?.name ?? "Unassigned"}
                        </span>
                        {isAdmin && (
                          <Pencil size={14} className="text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              <div className="px-4 py-3 flex-1 overflow-y-auto">
                <ComplaintAttachments
                  complaintId={complaint.id}
                  canUpload={isCustomer && complaint.status === "OPEN"}
                  canDelete={(isCustomer && complaint.status === "OPEN") || isAdmin}
                />
              </div>
            </div>
                </>
              ) : (
                <>
                  {/* History Tab */}
                  <div className="flex-1 min-w-0 overflow-y-auto px-6 py-4 space-y-3 custom-scroll">
                    {visibleResolutions.length === 0 ? (
                      <p className="text-slate-400 text-sm">No history available.</p>
                    ) : (
                      <div className="space-y-3">
                        {visibleResolutions.map(res => {
                          const typeLabels: Record<string, { label: string; color: string }> = {
                            EMPLOYEE_NOTE:    { label: "Employee Note",     color: "bg-blue-100 text-blue-700" },
                            ADMIN_RESOLUTION: { label: "Resolution",        color: "bg-emerald-100 text-emerald-700" },
                            ADMIN_TO_EMPLOYEE:{ label: "Internal Message",  color: "bg-purple-100 text-purple-700" },
                            REJECTION:        { label: "Rejection",         color: "bg-red-100 text-red-700" },
                            REOPEN_NOTE:      { label: "Reopened",          color: "bg-orange-100 text-orange-700" },
                          }
                          const typeInfo = typeLabels[res.type] ?? { label: res.type, color: "bg-slate-100 text-slate-700" }
                          return (
                            <div key={res.id} className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${typeInfo.color}`}>
                                  {typeInfo.label}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(res.createdAt).toLocaleString("en-IN", {
                                    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                                  })}
                                </span>
                                {res.createdBy && !isCustomer && (
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    by {res.createdBy.name} ({res.createdBy.role})
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700">{res.message}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="max-w-md">
          <DialogTitle>Reject Complaint</DialogTitle>
          <div className="space-y-3">
            <textarea
              value={rejectionText}
              onChange={e => setRejectionText(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!rejectionText.trim()) return
                  await handleStatusChange("REJECTED", rejectionText)
                  setShowRejectionModal(false)
                  setRejectionText("")
                }}
                disabled={isSubmitting || !rejectionText.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Confirm Rejection
              </button>
              <button
                onClick={() => { setShowRejectionModal(false); setRejectionText("") }}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolution Modal */}
      <Dialog open={showResolutionModal} onOpenChange={setShowResolutionModal}>
        <DialogContent className="max-w-md">
          <DialogTitle>Resolution Message</DialogTitle>
          <div className="space-y-3">
            <textarea
              value={resolutionText}
              onChange={e => setResolutionText(e.target.value)}
              placeholder="Write resolution message for customer..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!resolutionText.trim()) return
                  await handleStatusChange("CLOSED", resolutionText)
                  setShowResolutionModal(false)
                  setResolutionText("")
                }}
                disabled={isSubmitting || !resolutionText.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Close Ticket
              </button>
              <button
                onClick={() => { setShowResolutionModal(false); setResolutionText("") }}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}