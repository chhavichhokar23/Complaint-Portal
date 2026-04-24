export type Priority = {
  id: string
  name: string
  slaHours: number | null
}

export type SlaRule = {
  id: string
  priorityId: string
  timeline: number
}

export type Organisation = {
  id: string
  name: string
  defaultPriority: Priority | null
  slaRules: SlaRule[]
}

export function fmtHours(h: number) {
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  const r = h % 24
  return r > 0 ? `${d}d ${r}h` : `${d}d`
}

export function getInitials(name: string) {
  return name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()
}

export const PAGE_SIZE = 10