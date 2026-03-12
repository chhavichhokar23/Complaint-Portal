"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

import { getPriorityColor, getStatusColor } from "@/lib/complaintUtils"
import { Complaint } from "@/types/complaint"
import { FileText, Pencil, User, Phone, CheckCircle, RotateCcw } from "lucide-react"
import { useState } from "react"

const starColors = ["", "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"]

type Props = {
  complaint: Complaint | null
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: "ADMIN" | "EMPLOYEE" | "CUSTOMER"
  onStatusChange?: (id: string, status: string) => void
  onPriorityChange?: (id: string, priority: string) => void
  onCategoryChange?: (id: string, category: string) => void
  onAssignClick?: (id: string) => void
  onStartWork?: (id: string) => void
  onCompleteWork?: (id: string) => void
}

export default function ComplaintDetailsModal({
  complaint,
  open,
  onOpenChange,
  role,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onAssignClick,
  onStartWork,
  onCompleteWork,
}: Props) {

  const [showHistory, setShowHistory] = useState(false)
  if (!complaint) return null

  const isAdmin    = role === "ADMIN"
  const isEmployee = role === "EMPLOYEE"
  const isCustomer = role === "CUSTOMER"

  const latestFeedback  = complaint.feedbacks?.[0]
  const previousFeedback = complaint.feedbacks?.slice(1) ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={complaint?.id} className="max-w-[560px] p-0 overflow-hidden rounded-2xl scroll-auto shadow-xl border-0">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-1">Complaint</p>
              <DialogTitle className="text-white text-xl font-semibold leading-tight">
                Ticket #{complaint.ticketNumber}
              </DialogTitle>
              <p className="text-slate-400 text-xs mt-1.5">
                {new Date(complaint.createdAt).toLocaleString("en-IN", {
                  day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit"
                })}
              </p>
            </div>

            {/* Status — editable for admin only, badge for everyone else */}
            {isAdmin ? (
              <select
                value={complaint.status}
                onChange={(e) => onStatusChange?.(complaint.id, e.target.value)}
                className={`px-3 py-1.5 rounded-full appearance-none hover:appearance-auto text-xs font-semibold border-none outline-none cursor-pointer ${getStatusColor(complaint.status)}`}
              >
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            ) : (
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                {complaint.status.replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-3 custom-scroll">

          {/* Row 1 — 4 info tiles */}
          <div className="grid grid-cols-4 gap-2">

            {/* Category — editable for admin only */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-1.5">Category</p>
              {isAdmin ? (
                <select
                  value={complaint.category}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onCategoryChange?.(complaint.id, e.target.value)}
                  className="w-full bg-transparent text-slate-800 text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="BILLING">Billing</option>
                  <option value="ACCOUNT">Account</option>
                  <option value="GENERAL">General</option>
                </select>
              ) : (
                <p className="text-slate-800 text-xs font-semibold">{complaint.category}</p>
              )}
            </div>

            {/* Priority — editable for admin only */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-1.5">Priority</p>
              {isAdmin ? (
                <select
                  value={complaint.priority}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onPriorityChange?.(complaint.id, e.target.value)}
                  className={`px-2 py-0.5 rounded-full appearance-none hover:appearance-auto text-xs font-semibold border-none outline-none cursor-pointer ${getPriorityColor(complaint.priority)}`}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </span>
              )}
            </div>

            {/* Subcategory — always read-only */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-1.5">Subcategory</p>
              <p className="text-slate-800 text-xs font-semibold truncate">{complaint.subcategory ?? "—"}</p>
            </div>

            {/* SLA Deadline — always read-only */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-1.5">SLA Deadline</p>
              <p className="text-slate-800 text-xs font-semibold">
                {complaint.slaDeadline
                  ? new Date(complaint.slaDeadline).toLocaleString("en-IN", {
                      day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
                    })
                  : "Not set"}
              </p>
            </div>
          </div>

          {/* Row 2 — Customer | Assigned
              CUSTOMER: hidden entirely
              EMPLOYEE: customer tile only (full width)
              ADMIN:    both tiles
          */}
          {!isCustomer && (
            <div className={`grid gap-2 ${isAdmin ? "grid-cols-2" : "grid-cols-1"}`}>

              {/* Customer tile */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Customer</p>
                  <p className="text-slate-800 text-sm font-semibold leading-tight">{complaint.customer?.name ?? "—"}</p>
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                    <Phone size={9} />{complaint.mobileNumber ?? "No mobile"}
                  </p>
                </div>
              </div>

              {/* Assigned tile — admin only */}
              {isAdmin && (
                <div
                  onClick={() => onAssignClick?.(complaint.id)}
                  className={`flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100 ${onAssignClick ? "cursor-pointer hover:bg-slate-100 transition-colors" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Assigned To</p>
                    <p className="text-slate-800 text-sm font-semibold leading-tight truncate">
                      {complaint.assignedTo?.name ?? "Unassigned"}
                    </p>
                  </div>
                  {onAssignClick && <Pencil size={12} className="text-slate-300 flex-shrink-0" />}
                </div>
              )}
            </div>
          )}

          {/* Description — always visible */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-2">
              <FileText size={10} />
              Description
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{complaint.description}</p>
          </div>

          {/* Resolution — hidden for customer */}
          {complaint.resolutionMessage && !isCustomer && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-semibold uppercase tracking-wide mb-2">
                <FileText size={10} />
                Resolution
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{complaint.resolutionMessage}</p>
            </div>
          )}

          {/* Feedback — visible to all */}
          {latestFeedback && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
              <p className="text-amber-700 text-[10px] font-semibold uppercase tracking-wide mb-2.5">
                Customer Feedback
              </p>
              <div className="flex items-start gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
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
                    day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
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
              {showHistory && previousFeedback.length > 0 && (
                <div className="mt-3 space-y-3 border-t border-amber-200 pt-3">
                  {previousFeedback.map((f) => (
                    <div key={f.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
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
                            day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
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

          {/* Employee actions — Start Work / Mark Completed */}
          {isEmployee && (onStartWork || onCompleteWork) && (
            <div className="flex gap-2 pb-1">
              {complaint.status === "ASSIGNED" && onStartWork && (
                <button
                  onClick={() => { onStartWork(complaint.id); onOpenChange(false) }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <CheckCircle size={12} />
                  Start Work
                </button>
              )}
              {complaint.status === "IN_PROGRESS" && onCompleteWork && (
                <button
                  onClick={() => { onCompleteWork(complaint.id); onOpenChange(false) }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <CheckCircle size={12} />
                  Mark Completed
                </button>
              )}
            </div>
          )}

          {/* Admin actions — Mark Resolved / Reopen */}
          {isAdmin && latestFeedback && complaint.status === "COMPLETED" && (
            <div className="flex gap-2 pb-1">
              <button
                onClick={() => onStatusChange?.(complaint.id, "RESOLVED")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <CheckCircle size={12} />
                Mark Resolved
              </button>
              <button
                onClick={() => onStatusChange?.(complaint.id, "ASSIGNED")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
              >
                <RotateCcw size={12} />
                Reopen Ticket
              </button>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}