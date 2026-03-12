import { Pencil } from "lucide-react"
import { getStatusColor, getPriorityColor } from "@/lib/complaintUtils"
import { Button } from "@/components/ui/button"

export default function ComplaintRow({
  complaint,
  role,
  onAssignClick,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onStartWork,
  onCompleteWork,
  onEdit,
  onRowClick,
  onGiveFeedback,
}: any) {

  // ─── CUSTOMER ROW (6 cols) ───────────────────────────────────────────────────
  if (role === "CUSTOMER") {
    return (
      <div onClick={() => onRowClick?.(complaint)} className="grid grid-cols-7 cursor-pointer items-center px-4 py-3 border-t hover:bg-gray-50 text-sm">
        <div>{complaint.ticketNumber}</div>
        <div>{complaint.category}</div>
        <div>{complaint.subcategory ?? ""}</div>
        <div className="text-gray-600 truncate max-w-[90px]" title={complaint.description}>
          {complaint.description}
        </div>
        <div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
            {complaint.status}
          </span>
        </div>
        <div>
              {complaint.status === "RESOLVED" ? (
                <span className="text-xs text-green-800 font-medium">Resolved</span>
              ) : complaint.status === "REJECTED" ? (
                <span className="text-xs text-red-800 font-medium">Rejected</span>
              ) : complaint.slaDeadline ? (
                <span className="text-xs text-gray-700">
                  {new Date(complaint.slaDeadline).toLocaleString("en-IN", {
                    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                  })}
                </span>
              ) : (
                <span className="text-xs text-gray-400">Waiting for review</span>
              )}
            </div>
        <div>
          {complaint.status === "PENDING" && (
            <Button className="cursor-pointer" size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit?.(complaint) }}>
              Edit
            </Button>
          )}
          {complaint.status === "COMPLETED" &&  (
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onGiveFeedback?.(complaint) }}
          >
            Feedback
          </Button>
        )}
        </div>
      </div>
    )
  }

  // ─── EMPLOYEE ROW (8 cols) ───────────────────────────────────────────────────
  if (role === "EMPLOYEE") {
    return (
      <div onClick={() => onRowClick?.(complaint)} className="grid grid-cols-9 cursor-pointer items-center px-4 py-3 border-t hover:bg-gray-200 text-sm">
        <div>{complaint.ticketNumber}</div>
        <div>{complaint.category}</div>
        <div>{complaint.subcategory ?? "Not specified"}</div>
         <div className="flex flex-col">
        <span className="font-medium text-gray-800">{complaint.customer?.name}</span>
        <span className="text-xs text-gray-400 mt-0.5">{complaint.mobileNumber ?? "No mobile"}</span>
      </div>

        <div className="text-gray-600 truncate max-w-[90px]" title={complaint.description}>
          {complaint.description}
        </div>
        {/* <div>{complaint.mobileNumber ?? "Not provided"}</div> */}
        <div>
              {complaint.status === "RESOLVED" ? (
                <span className="text-xs text-green-800 font-medium">Resolved</span>
              ) : complaint.status === "REJECTED" ? (
                <span className="text-xs text-red-800 font-medium">Rejected</span>
              ) : complaint.slaDeadline ? (
                <span className="text-xs text-gray-700">
                  {new Date(complaint.slaDeadline).toLocaleString("en-IN", {
                    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                  })}
                </span>
              ) : (
                <span className="text-xs text-gray-400">Waiting for review</span>
              )}
            </div>
        <div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
            {complaint.priority}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className={`px-2 py-1 rounded text-xs font-medium w-fit ${getStatusColor(complaint.status)}`}>
            {complaint.status.replace("_", " ")}
          </span>
        </div>
        <div>
          {complaint.status === "ASSIGNED" && (
            <button
              onClick={(e) => {e.stopPropagation(); onStartWork?.(complaint.id)}}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Start Work
            </button>
          )}
          {complaint.status === "IN_PROGRESS" && (
            <button
              onClick={(e) => {e.stopPropagation(); onCompleteWork?.(complaint.id)}}
              className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── ADMIN ROW (9 cols — removed Mobile col, removed Resolution col) ─────────
  // Customer cell now shows name + mobile as subtext
  return (
    <div
      onClick={() => onRowClick?.(complaint)}
      className="grid grid-cols-9 cursor-pointer items-center px-4 py-4 border-t hover:bg-gray-100 text-sm"
    >
      {/* Ticket Id */}
      <div className="text-gray-700 font-medium">{complaint.ticketNumber}</div>

      {/* Category */}
      <div>
        <select
          value={complaint.category}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onCategoryChange?.(complaint.id, e.target.value)}
          className="border rounded px-2 py-1 text-xs"
        >
          <option value="TECHNICAL">Technical</option>
          <option value="BILLING">Billing</option>
          <option value="ACCOUNT">Account</option>
          <option value="GENERAL">General</option>
        </select>
      </div>

      {/* Subcategory */}
      <div>{complaint.subcategory ?? "Not specified"}</div>

      {/* Description */}
      <div className="text-gray-600 truncate max-w-[90px]" title={complaint.description}>
        {complaint.description}
      </div>

      {/* Status */}
      <div>
        <select
          value={complaint.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onStatusChange?.(complaint.id, e.target.value)}
          className={`px-3 py-1 rounded-full text-xs w-fit font-medium border-none appearance-none hover:appearance-auto outline-none cursor-pointer ${getStatusColor(complaint.status)}`}
        >
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Priority */}
      <div>
        <select
          value={complaint.priority}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onPriorityChange?.(complaint.id, e.target.value)}
          className={`px-3 py-1 rounded-full text-xs w-fit font-medium border-none appearance-none hover:appearance-auto outline-none cursor-pointer ${getPriorityColor(complaint.priority)}`}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {/* Customer — name + mobile subtext */}
      <div className="flex flex-col">
        <span className="font-medium text-gray-800">{complaint.customer?.name}</span>
        <span className="text-xs text-gray-400 mt-0.5">{complaint.mobileNumber ?? "No mobile"}</span>
      </div>

      {/* Assigned to */}
      <div className="flex items-center gap-2">
        {complaint.assignedTo ? (
          <>
            <span className="text-xs">{complaint.assignedTo.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onAssignClick?.(complaint.id) }}
              className="text-muted-foreground hover:text-black hover:scale-110 transition cursor-pointer"
            >
              <Pencil size={14} />
            </button>
          </>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onAssignClick?.(complaint.id) }}
            className="px-3 py-1 text-xs border rounded-lg text-blue-600 border-blue-300 hover:bg-blue-50 transition"
          >
            Assign
          </button>
        )}
      </div>

      {/* SLA Deadline */}
      <div className="text-gray-600">
        {complaint.slaDeadline
          ? new Date(complaint.slaDeadline).toLocaleString("en-IN", {
              day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
            })
          : "Not set"}
      </div>
    </div>
  )
}