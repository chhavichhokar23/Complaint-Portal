import { ComplaintStatus } from "@prisma/client"
import { CheckCircle, Loader2 } from "lucide-react"

type Props = {
  status: ComplaintStatus
  isSubmitting: boolean
  onStartWork: () => void
  onCompleteWork: () => void
}

export default function EmployeeActions({ status, isSubmitting, onStartWork, onCompleteWork }: Props) {
  return (
    <div className="space-y-3 pb-1 border-t border-slate-100 pt-3">
      {status === "ASSIGNED" && (
        <button
          onClick={onStartWork}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={12} className="animate-spin" />}
          <CheckCircle size={12} /> Start Work
        </button>
      )}
      {status === "IN_PROGRESS" && (
        <button
          onClick={onCompleteWork}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={12} className="animate-spin" />}
          <CheckCircle size={12} /> Mark Completed
        </button>
      )}
    </div>
  )
}