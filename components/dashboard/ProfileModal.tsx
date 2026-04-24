"use client"

import { useState, useEffect } from "react"
import { X, User, Lock, Building2, Check, Eye, EyeOff, Loader2 } from "lucide-react"

type Organisation = { id: string; name: string }

type Props = {
  open: boolean
  onClose: () => void
  onSaved?: (updated: { name: string; mobileNumber: string | null; organisationId?: string | null; department?: string | null }) => void
  user: {
    name: string
    email: string
    mobileNumber: string | null
    organisationId: string | null
    organisation: Organisation | null
    department: string | null
    role: string
  }
  role?: "ADMIN" | "EMPLOYEE" | "CUSTOMER"
}

type Tab = "profile" | "password"

export default function ProfileModal({ open, onClose, onSaved, user, role }: Props) {
  const [tab, setTab] = useState<Tab>("profile")
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Profile form
  const [name, setName] = useState(user.name)
  const [mobile, setMobile] = useState(user.mobileNumber ?? "")
  const [orgId, setOrgId] = useState(user.organisationId ?? "")
  const [dept, setDept] = useState(user.department ?? "")

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setTab("profile")
      setName(user.name)
      setMobile(user.mobileNumber ?? "")
      setOrgId(user.organisationId ?? "")
      setDept(user.department ?? "")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
      setError(""); setSuccess("")
    }
  }, [open, user])

  // Load organisations for the dropdown (CUSTOMER only)
  useEffect(() => {
    if (open && role === "CUSTOMER") {
      fetch("/api/organisations")
        .then(r => r.json())
        .then(d => setOrganisations(d.organisations ?? []))
        .catch(() => {})
    }
  }, [open, role])

  // Load departments for the dropdown (EMPLOYEE only)
  useEffect(() => {
    if (open && role === "EMPLOYEE") {
      fetch("/api/departments")
        .then(r => r.json())
        .then(d => setDepartments(d.departments ?? []))
        .catch(() => {})
    }
  }, [open, role])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      setBusy(true); setError(""); setSuccess("")
      const endpoint = role === "EMPLOYEE" ? "/api/employee/profile" : role === "ADMIN" ? "/api/admin/profile" : "/api/customer/profile"
      const body: any = {
        name: name.trim(),
        mobileNumber: mobile.trim() || null,
      }
      if (role === "CUSTOMER") body.organisationId = orgId || null
      if (role === "EMPLOYEE") body.department = dept || null

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSuccess("Profile updated successfully.")
      const updated: any = { name: name.trim(), mobileNumber: mobile.trim() || null }
      if (role === "CUSTOMER") updated.organisationId = orgId || null
      if (role === "EMPLOYEE") updated.department = dept || null
      onSaved?.(updated)
    } catch (e: any) { setError(e.message) }
    finally { setBusy(false) }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) return
    if (newPassword !== confirmPassword) { setError("New passwords don't match."); return }
    if (newPassword.length < 8) { setError("New password must be at least 8 characters."); return }
    try {
      setBusy(true); setError(""); setSuccess("")
      const endpoint = role === "EMPLOYEE" ? "/api/employee/profile" : role === "ADMIN" ? "/api/admin/profile" : "/api/customer/profile"
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSuccess("Password changed successfully.")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } catch (e: any) { setError(e.message) }
    finally { setBusy(false) }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
              <User size={14} className="text-indigo-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">My profile</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {(["profile", "password"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); setSuccess("") }}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition cursor-pointer capitalize
                ${tab === t
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              {t === "profile" ? "Profile details" : "Change password"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* Feedback */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5 flex items-center gap-2 text-sm text-emerald-700">
              <Check size={14} className="flex-shrink-0" />
              {success}
            </div>
          )}

          {/* ── Profile tab ── */}
          {tab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">

              {/* Email — read only */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  disabled={busy}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Mobile number</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  disabled={busy}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                />
              </div>

              {/* Organisation (only for CUSTOMER) */}
              {role === "CUSTOMER" && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Organisation
                    <span className="ml-1 font-normal text-slate-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={orgId}
                      onChange={e => setOrgId(e.target.value)}
                      disabled={busy}
                      className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 bg-white transition-all hover:border-slate-300"
                    >
                      <option value="">— No organisation —</option>
                      {organisations.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Linking your organisation helps route complaints and apply correct SLA timelines.
                  </p>
                </div>
              )}

              {/* Department (only for EMPLOYEE) */}
              {role === "EMPLOYEE" && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Department
                    <span className="ml-1 font-normal text-slate-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={dept}
                      onChange={e => setDept(e.target.value)}
                      disabled={busy}
                      className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 bg-white transition-all hover:border-slate-300"
                    >
                      <option value="">— Select department —</option>
                      {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Your department assignment for complaint triage and assignment.
                  </p>
                </div>
              )}

              <div className="pt-1 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !name.trim()}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {busy && <Loader2 size={13} className="animate-spin" />}
                  Save changes
                </button>
              </div>

            </form>
          )}

          {/* ── Password tab ── */}
          {tab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">

              <PasswordField
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrent}
                onToggle={() => setShowCurrent(v => !v)}
                disabled={busy}
                placeholder="Enter your current password"
              />

              <PasswordField
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                show={showNew}
                onToggle={() => setShowNew(v => !v)}
                disabled={busy}
                placeholder="At least 8 characters"
              />

              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm(v => !v)}
                disabled={busy}
                placeholder="Repeat new password"
              />

              {/* Password strength hint */}
              {newPassword.length > 0 && newPassword.length < 8 && (
                <p className="text-xs text-amber-600">Password must be at least 8 characters.</p>
              )}
              {newPassword.length >= 8 && confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords don't match.</p>
              )}

              <div className="pt-1 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !currentPassword || !newPassword || !confirmPassword}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {busy && <Loader2 size={13} className="animate-spin" />}
                  Change password
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Small reusable password field ────────────────────────────────────────────

function PasswordField({
  label, value, onChange, show, onToggle, disabled, placeholder
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  disabled: boolean
  placeholder: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required
          disabled={disabled}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}