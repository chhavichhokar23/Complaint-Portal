"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Priority, Organisation } from "@/types/masters"
import { PrioritySection } from "@/components/masters/PrioritySection"
import { OrgTable } from "@/components/masters/OrgTable"
import { OrgSidePanel } from "@/components/masters/OrgSidePanel"
import { ArrowLeft } from "lucide-react"

export default function PrioritySLAMasterPage() {
  const [priorities, setPriorities] = useState<Priority[]>([])
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null)

  async function load() {
    const [pRes, oRes, slaRes] = await Promise.all([
      fetch("/api/admin/priorities"),
      fetch("/api/admin/organisations"),
      fetch("/api/admin/sla"),
    ])
    const pData = await pRes.json()
    const oData = await oRes.json()
    const slaData = await slaRes.json()

    const rawPriorities: Priority[] = (pData.priorities ?? []).map((p: any) => ({
      id: p.id, name: p.name, slaHours: p.slaHours ?? null,
    }))
    const allRules = slaData.slaRules ?? []
    const rawOrgs: Organisation[] = (oData.organisations ?? []).map((o: any) => ({
      id: o.id, name: o.name, defaultPriority: o.defaultPriority ?? null,
      slaRules: allRules
        .filter((r: any) => r.organisation?.id === o.id)
        .map((r: any) => ({ id: r.id, priorityId: r.priority?.id, timeline: r.timeline })),
    }))

    setPriorities(rawPriorities)
    setOrganisations(rawOrgs)
    setSelectedOrg(prev => prev ? rawOrgs.find(o => o.id === prev.id) ?? null : null)
  }

  useEffect(() => {
    load().catch((e: any) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function call(url: string, method: string, body: object) {
    setBusy(true); setError("")
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      await load()
    } catch (e: any) { setError(e.message) }
    finally { setBusy(false) }
  }

  const handleAddPriority    = (name: string, slaHours: number | null) => call("/api/admin/priorities", "POST", { name, slaHours })
  const handleSavePriority   = (id: string, name: string, slaHours: number | null) => call("/api/admin/priorities", "PATCH", { id, name, slaHours })
  const handleDeletePriority = (id: string, name: string) => {
    if (!confirm(`Delete priority "${name}"? This will also remove all SLA rules for this priority.`)) return Promise.resolve()
    return call("/api/admin/priorities", "DELETE", { id })
  }

  const handleAddOrg  = (name: string, defaultPriorityId: string | null) => call("/api/admin/organisations", "POST", { name, defaultPriorityId })
  const handleSaveOrg = (id: string, name: string, defaultPriorityId: string | null) => call("/api/admin/organisations", "PATCH", { id, name, defaultPriorityId })
  const handleDeleteOrg = async (id: string, name: string) => {
    if (!confirm(`Delete organisation "${name}"?`)) return
    if (selectedOrg?.id === id) setSelectedOrg(null)
    await call("/api/admin/organisations", "DELETE", { id })
  }

  const handleSaveOrgSla  = (orgId: string, priorityId: string, timeline: number, existingId?: string) =>
    existingId ? call("/api/admin/sla", "PATCH", { id: existingId, timeline }) : call("/api/admin/sla", "POST", { organisationId: orgId, priorityId, timeline })
  const handleClearOrgSla = (_: string, __: string, ruleId: string) => call("/api/admin/sla", "DELETE", { id: ruleId })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/admin/masters"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Priority & SLA Master</h1>
        <p className="text-sm text-slate-500">Define priority levels with global SLA defaults, then override per organisation.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <PrioritySection
        priorities={priorities} organisations={organisations}
        loading={loading} busy={busy}
        onAdd={handleAddPriority} onSave={handleSavePriority} onDelete={handleDeletePriority}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex">
        <div className="flex-1 min-w-0">
          <OrgTable
            priorities={priorities} organisations={organisations}
            loading={loading} busy={busy}
            selectedOrgId={selectedOrg?.id ?? null}
            onSelect={setSelectedOrg} onDelete={handleDeleteOrg} onAdd={handleAddOrg}
          />
        </div>
        {selectedOrg && (
          <OrgSidePanel
            org={selectedOrg} priorities={priorities} busy={busy}
            onClose={() => setSelectedOrg(null)}
            onSaveOrg={handleSaveOrg}
            onSaveOrgSla={handleSaveOrgSla}
            onClearOrgSla={handleClearOrgSla}
          />
        )}
      </div>
    </div>
  )
}