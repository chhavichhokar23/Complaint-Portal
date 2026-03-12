import ComplaintRow from "./ComplaintRow"
import { Complaint } from "@/types/complaint"

type Props = {
  complaints: Complaint[]
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER"
  onAssignClick?: (id: string) => void
  onStatusChange?: (id: string, status: string) => void
  onPriorityChange?: (id: string, priority: string) => void
  onCategoryChange?: (id: string, category: string) => void
  onStartWork?: (id: string) => void
  onCompleteWork?: (id: string) => void
  onEdit?: (complaint: Complaint) => void
  onRowClick?: (complaint: Complaint) => void
  onGiveFeedback?: (complaint: Complaint) => void
}

export default function ComplaintTable({
  complaints,
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
}: Props) {

  const grid =
    role === "ADMIN"
      ? "grid-cols-9"
      : role === "EMPLOYEE"
      ? "grid-cols-9"
      : "grid-cols-7"

  return (
    <div className="border rounded-lg overflow-hidden">

      {role === "ADMIN" && (
        <div className={`grid ${grid} bg-gray-100 text-gray-600 text-sm font-medium px-4 py-3`}>
          <div>Ticket Id</div>
          <div>Category</div>
          <div>Subcategory</div>
          <div>Description</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Customer</div>
          <div>Assigned to</div>
          <div>SLA Deadline</div>
        </div>
      )}

      {role === "EMPLOYEE" && (
        <div className={`grid ${grid} bg-gray-100 text-gray-600 text-sm font-medium px-4 py-3`}>
          <div>Ticket Id</div>
          <div>Category</div>
          <div>Subcategory</div>
          <div>Customer</div>
          <div>Description</div>
          <div>Deadline</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Action</div>
        </div>
      )}

      {role === "CUSTOMER" && (
        <div className={`grid ${grid} bg-gray-100 text-gray-600 text-sm font-medium px-4 py-3`}>
          <div>Ticket Id</div>
          <div>Category</div>
          <div>Subcategory</div>
          <div>Description</div>
          <div>Status</div>
          <div>Expected Resolution</div>
          <div>Actions</div>
        </div>
      )}

      {complaints.map(c => (
        <ComplaintRow
          key={c.id}
          complaint={c}
          role={role}
          onAssignClick={onAssignClick}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onCategoryChange={onCategoryChange}
          onStartWork={onStartWork}
          onCompleteWork={onCompleteWork}
          onEdit={onEdit}
          onRowClick={onRowClick}
          onGiveFeedback={onGiveFeedback}
        />
      ))}

    </div>
  )
}