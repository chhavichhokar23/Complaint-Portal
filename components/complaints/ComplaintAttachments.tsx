"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Paperclip, Upload, X, FileText, Image, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"

type Attachment = {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  createdAt: string
}

type Props = {
  complaintId: string
  canUpload?: boolean
  canDelete?: boolean
}

export default function ComplaintAttachments({ complaintId, canUpload = false, canDelete = false }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}/attachments`)
      const data = await res.json()
      setAttachments(data.attachments ?? [])
    } catch {
      setError("Failed to load attachments")
    } finally {
      setLoading(false)
    }
  }, [complaintId])

  useEffect(() => {
    let cancelled = false
    
    async function fetchAttachments() {
      try {
        const res = await fetch(`/api/complaints/${complaintId}/attachments`)
        const data = await res.json()
        if (!cancelled) {
          setAttachments(data.attachments ?? [])
        }
      } catch {
        if (!cancelled) setError("Failed to load attachments")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAttachments()

    return () => { cancelled = true }
  }, [complaintId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError("")

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`/api/complaints/${complaintId}/attachments`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleDelete(attachmentId: string) {
    setDeleteTargetId(attachmentId)
    setDeleteConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!deleteTargetId) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/complaints/${complaintId}/attachments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attachmentId: deleteTargetId }),
      })
      if (!res.ok) throw new Error("Failed to delete")
      await load()
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const isPdf = (type: string) => type === "application/pdf"

  return (
    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wide">
          <Paperclip size={10} />
          Attachments
          {attachments.length > 0 && (
            <span className="ml-1 bg-slate-200 text-slate-500 rounded-full px-1.5 py-0.5 text-[9px]">
              {attachments.length}
            </span>
          )}
        </div>

        {canUpload && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleUpload}
              className="hidden"
            />
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {loading ? (
        <p className="text-xs text-slate-400">Loading...</p>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No attachments yet.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100 group"
            >
              <a
                href={att.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
              >
                {isPdf(att.fileType) ? (
                  <FileText size={14} className="text-rose-500 flex-shrink-0" />
                ) : (
                  <Image size={14} className="text-indigo-500 flex-shrink-0" />
                )}
                <span className="text-xs text-slate-700 truncate font-medium">
                  {att.fileName}
                </span>
              </a>

              {canDelete && (
                <button
                  onClick={() => handleDelete(att.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-slate-300 hover:text-rose-500 cursor-pointer flex-shrink-0"
                  title="Delete attachment"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canUpload && (
        <p className="text-[10px] text-slate-400">JPG, PNG, WEBP or PDF · Max 5MB</p>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-xs">
          <DialogTitle className="text-base font-semibold text-slate-900">
            Remove Attachment?
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            This action cannot be undone. The attachment will be permanently deleted.
          </p>
          <div className="flex gap-2 justify-end mt-6">
            <DialogClose asChild>
              <button
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-sm rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleting && <Loader2 size={13} className="animate-spin" />}
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}