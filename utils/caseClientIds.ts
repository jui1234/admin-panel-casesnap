/**
 * Pull linked client IDs from a case object regardless of common API shapes
 * (populate vs raw ids, spreadsheet import quirks, alternate field names).
 */
export function extractLinkedClientIdsFromCase(input: Record<string, unknown> | null | undefined): string[] {
  if (!input || typeof input !== 'object') return []

  const candidates = [
    input.clients,
    input.linkedClients,
    input.clientRefs,
    input.clientIds,
    input.linkedClientIds,
  ]

  let list: unknown[] = []
  for (const cand of candidates) {
    if (Array.isArray(cand) && cand.length > 0) {
      list = cand as unknown[]
      break
    }
  }

  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list) {
    const id = normalizeOneClientRef(raw)
    if (id && !seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

function normalizeOneClientRef(entry: unknown): string {
  if (entry == null) return ''
  if (typeof entry === 'string') return entry.trim()
  if (typeof entry === 'number' && Number.isFinite(entry)) return String(entry)

  if (typeof entry === 'object') {
    const o = entry as Record<string, unknown>
    if (typeof o.$oid === 'string') return o.$oid
    const idDirect = typeof o.id === 'string' ? o.id : typeof o.clientId === 'string' ? o.clientId : ''
    const idUnderscore = typeof o._id === 'string' ? o._id : ''
    const nestedOid =
      o._id && typeof o._id === 'object' && o._id !== null && typeof (o._id as Record<string, unknown>).$oid === 'string'
        ? String((o._id as Record<string, unknown>).$oid)
        : ''
    return (idDirect || idUnderscore || nestedOid).trim()
  }
  return ''
}
