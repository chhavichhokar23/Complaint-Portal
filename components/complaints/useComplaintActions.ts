import { useState } from "react"
import { Complaint } from "@/types/complaint"

type Props = {
  complaint: Complaint | null
  onStatusChange?: (id: string, status: string, message?: string) => void
  onStartWork?: (id: string) => void
  onOpenChange: (open: boolean) => void
}

export function useComplaintActions({ complaint, onStatusChange, onStartWork, onOpenChange }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleStatusChange(newStatus: string, message?: string) {
    if (!complaint) return
    try {
      setIsSubmitting(true)
      if (onStatusChange) {
        await onStatusChange(complaint.id, newStatus, message)
      } else {
        const res = await fetch("/api/complaints/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ complaintId: complaint.id, status: newStatus, message }),
        })
        if (!res.ok) throw new Error("Failed to update status")
      }
    } catch (error) {
      console.error("Status change error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStartWork() {
    if (!complaint || !onStartWork) return
    try {
      setIsSubmitting(true)
      await onStartWork(complaint.id)
      onOpenChange(false)
    } catch (error) {
      console.error("Start work error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, handleStatusChange, handleStartWork }
}