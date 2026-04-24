import ComplaintRow from "./ComplaintRow"
import { Complaint } from "@/types/complaint"

type Props = {
  complaints: Complaint[]
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER"
  categories?: string[]
  priorities?: { id: string; name: string }[] 
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
  categories,
  onAssignClick,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onStartWork,
  onCompleteWork,
  onEdit,
  onRowClick,
  onGiveFeedback,
  priorities,
}: Props) {

  const grid =
    role === "ADMIN"
      ? "grid-cols-10"
      : role === "EMPLOYEE"
      ? "grid-cols-10"
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
          <div>Organisation</div>
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
          <div>Organisation</div>
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
          categories={categories}
          onAssignClick={onAssignClick}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onCategoryChange={onCategoryChange}
          onStartWork={onStartWork}
          onCompleteWork={onCompleteWork}
          onEdit={onEdit}
          onRowClick={onRowClick}
          onGiveFeedback={onGiveFeedback}
          priorities={priorities}
        />
      ))}

    </div>
  )
}