import { ComplaintStatus } from "@prisma/client"
import { CheckCircle, Loader2, RotateCcw, X } from "lucide-react"

type Props = {
  status: ComplaintStatus
  isSubmitting: boolean
  onStatusChange: (status: string, message?: string) => void
  onOpenRejectionModal: () => void
  onOpenResolutionModal: () => void
}

export default function AdminActions({
  status,
  isSubmitting,
  onStatusChange,
  onOpenRejectionModal,
  onOpenResolutionModal,
}: Props) {
  return (
    <div className="space-y-3 pb-1 border-t border-slate-100 pt-3">
      {status === "COMPLETED" && (
        <button
          onClick={onOpenResolutionModal}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={12} className="animate-spin" />}
          <CheckCircle size={12} /> Close Ticket
        </button>
      )}

      {status === "CLOSED" && (
        <div className="flex gap-2">
          <button
            onClick={() => onStatusChange("RESOLVED")}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={12} className="animate-spin" />}
            <CheckCircle size={12} /> Mark Resolved
          </button>
          <button
            onClick={onOpenRejectionModal}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={12} /> Reject Ticket
          </button>
          <button
            onClick={() => onStatusChange("OPEN")}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={12} className="animate-spin" />}
            <RotateCcw size={12} /> Reopen
          </button>
        </div>
      )}

      {(status === "RESOLVED" || status === "REJECTED") && (
        <button
          onClick={() => onStatusChange("OPEN")}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={12} className="animate-spin" />}
          <RotateCcw size={12} /> Reopen Ticket
        </button>
      )}
    </div>
  )
}