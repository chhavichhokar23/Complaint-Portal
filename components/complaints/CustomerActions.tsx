import { Complaint } from "@/types/complaint"

type Props = {
  complaint: Complaint
  onGiveFeedback?: (complaint: Complaint) => void
}

export default function CustomerActions({ complaint, onGiveFeedback }: Props) {
  if (complaint.status === "CLOSED" || complaint.status === "RESOLVED") {
    return (
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">Resolution</p>
        <p className="text-sm text-emerald-700">{complaint.resolutionMessage || "—"}</p>
        {onGiveFeedback && (
          <button
            onClick={() => onGiveFeedback(complaint)}
            className="mt-2 text-xs font-semibold text-emerald-700 underline"
          >
            Give feedback
          </button>
        )}
      </div>
    )
  }

  if (complaint.status === "REJECTED") {
    const rejectionMessage = complaint.resolutions?.find(r => r.type === "REJECTION")?.message
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-3">
        <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-1">Rejection Reason</p>
        <p className="text-sm text-red-700">{rejectionMessage || "—"}</p>
      </div>
    )
  }

  return null
}