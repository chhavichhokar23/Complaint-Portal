"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

const starColors = ["", "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"]
const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"]
const labelColors = ["", "text-red-500", "text-orange-500", "text-yellow-500", "text-lime-500", "text-green-500"]

export default function FeedbackModal({
  complaint,
  open,
  onOpenChange,
  onSubmit,
}: any) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")

  const submit = () => {
    if (rating === 0) return
    onSubmit({ rating, comment })
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      setRating(0)
      setHovered(0)
      setComment("")
    }
  }, [open])

  if (!complaint) return null

  const display = hovered || rating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] p-0 overflow-hidden rounded-2xl">

        {/* Dark header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Feedback</p>
              <DialogTitle className="text-white text-xl font-semibold">
                Ticket #{complaint.ticketNumber}
              </DialogTitle>
              <p className="text-slate-400 text-xs mt-1.5">
                Your complaint was marked as completed
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 mt-1 flex-shrink-0">
              Completed
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">

          {/* Rating tile */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest mb-3">
              Rate your experience
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="focus:outline-none"
                >
                  <svg
                    width="28" height="28" viewBox="0 0 24 24"
                    fill={star <= display ? starColors[star] : "none"}
                    stroke={star <= display ? starColors[star] : "#cbd5e1"}
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{
                      transition: "all 0.12s",
                      transform: star <= display ? "scale(1.12)" : "scale(1)"
                    }}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
              {display > 0 && (
                <span className={`ml-1 text-xs font-semibold ${labelColors[display]}`}>
                  {ratingLabels[display]}
                </span>
              )}
            </div>
          </div>

          {/* Comment tile */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest mb-2">
              Comment <span className="normal-case font-normal">(optional)</span>
            </p>
            <textarea
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1 pb-2">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={rating === 0}
              className="flex-1 h-9 rounded-lg text-sm font-medium transition bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Feedback
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}