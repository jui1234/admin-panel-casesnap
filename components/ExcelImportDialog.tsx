'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Upload, Eye, CheckCircle2 } from 'lucide-react'
import { importExcel, previewExcelImport } from '@/utils/excelApi'

const DataGrid = dynamic(() => import('@mui/x-data-grid').then((m) => m.DataGrid), { ssr: false })

type PreviewRows = Array<Record<string, unknown>>

function fieldToHeader(field: string): string {
  const base = field.replace(/^data\./, '')
  const spaced = base.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Grid headers phrased for people skimming imports, not developers */
function tableColumnLabel(field: string): string {
  const friendly: Record<string, string> = {
    clientsRow: 'Person (slot)',
    clientsPreviewSummary: 'Who this row mentions',
    willCreate: 'Creates new?',
    issues: 'Flags',
    clientCount: 'People count',
  }
  if (friendly[field]) return friendly[field]
  if (field.startsWith('client.')) return `${fieldToHeader(field.replace(/^client\./, ''))}`
  return fieldToHeader(field)
}

/** Where the API might attach per-case client preview payloads */
const CLIENT_EMBED_ARRAY_FIELDS = ['clients', 'linkedClients', 'clientPreviews', 'newClients'] as const

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return !!(v && typeof v === 'object' && !Array.isArray(v))
}

function formatScalarForPreview(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function formatClientBrief(c: Record<string, unknown>): string {
  const fn = formatScalarForPreview(c.clientFirstName ?? c.firstName)
  const ln = formatScalarForPreview(c.clientLastName ?? c.lastName)
  const nameFromParts = [fn, ln].filter(Boolean).join(' ')
  const full = formatScalarForPreview(c.fullName ?? c.name ?? c.displayName ?? c.clientName ?? '')
  const name = nameFromParts || full
  const phone = formatScalarForPreview(c.clientPhone ?? c.phone ?? c.mobile ?? c.Mobile)
  const email = formatScalarForPreview(c.clientEmail ?? c.email)
  const fees = formatScalarForPreview(c.clientFees ?? c.fees)
  const parts: string[] = []
  if (name) parts.push(name)
  if (phone) parts.push(`Mo. ${phone}`)
  if (email) parts.push(email)
  if (fees) parts.push(`Fees: ${fees}`)
  return parts.join(' · ') || '— details not listed here'
}

function summarizeClientsMixedForCell(entries: unknown[]): string {
  return entries
    .map((entry, idx) => {
      if (isPlainRecord(entry)) return `${idx + 1}. ${formatClientBrief(entry)}`
      return `${idx + 1}. ${typeof entry === 'string' ? entry : typeof entry === 'number' ? String(entry) : JSON.stringify(entry)}`
    })
    .join('\n')
}

function extractEmbeddedClientsArray(row: Record<string, unknown>): unknown[] | undefined {
  for (const field of CLIENT_EMBED_ARRAY_FIELDS) {
    const v = row[field]
    if (Array.isArray(v) && v.length > 0) return v as unknown[]
  }
  return undefined
}

function stripEmbeddedClientArrays(row: Record<string, unknown>): Record<string, unknown> {
  const out = { ...row }
  for (const field of CLIENT_EMBED_ARRAY_FIELDS) delete out[field]
  return out
}

function numericClientCount(row: Record<string, unknown>): number | undefined {
  const c = row.clientCount
  if (typeof c === 'number' && Number.isFinite(c)) return c
  if (typeof c === 'string') {
    const n = Number.parseInt(c, 10)
    if (!Number.isNaN(n)) return n
  }
  return undefined
}

/** Duplicate case-level columns per client row when embedded client objects exist. */
function expandRowsWithEmbeddedClients(rows: PreviewRows): PreviewRows {
  const expanded: PreviewRows = []
  for (const row of rows) {
    const embedded = extractEmbeddedClientsArray(row)

    if (embedded !== undefined && embedded.length > 0) {
      const allRecords = embedded.every(isPlainRecord)
      const base = stripEmbeddedClientArrays(row)

      if (allRecords) {
        const objs = embedded as Record<string, unknown>[]
        const total = objs.length
        for (let idx = 0; idx < total; idx++) {
          const client = objs[idx]
          const merged: Record<string, unknown> = {
            ...base,
            clientsRow: `${idx + 1} of ${total}`,
          }
          const used = new Set(Object.keys(merged))
          for (const [key, val] of Object.entries(client)) {
            if (val == null) continue
            const scalarLike =
              typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean'
            if (scalarLike) {
              const outKey = used.has(key) ? `client.${key}` : key
              merged[outKey] = val
              used.add(outKey)
              continue
            }
            if (Array.isArray(val)) {
              const cell = val.every((x) => x == null || typeof x !== 'object')
                ? val.map(String).join('; ')
                : JSON.stringify(val)
              merged[`client.${key}`] = cell
            }
          }
          expanded.push(merged)
        }
        continue
      }

      const copyMixed = { ...base }
      copyMixed.clientsPreviewSummary = summarizeClientsMixedForCell(embedded)
      expanded.push(copyMixed)
      continue
    }

    const copy = stripEmbeddedClientArrays(row)
    const n = numericClientCount(copy)
    const hasEmbedded = embedded !== undefined && embedded.length > 0
    const missingDetail = !hasEmbedded && n !== undefined && n > 0
    if (missingDetail) {
      copy.clientsPreviewSummary =
        n === 1
          ? 'One person is tied to this row, but names and phone numbers weren’t unpacked here—open your workbook to confirm who they are before importing.'
          : `${n} people are tied to this row here, without names unpacked—open your workbook to remind yourself who those people are, then carry on when it feels right.`
    }
    expanded.push(copy)
  }
  return expanded
}

function formatIssuesCell(issues: unknown): string {
  if (issues == null) return ''
  if (Array.isArray(issues)) {
    const parts = issues.map((x) => (typeof x === 'string' ? x : JSON.stringify(x)))
    return parts.join('; ')
  }
  return String(issues)
}

/** Turns API preview rows (nested `data`, `issues` arrays) into flat records for DataGrid */
function flattenPreviewRecord(row: Record<string, unknown>): Record<string, unknown> {
  const { data: nested, issues, ...rest } = row
  const out: Record<string, unknown> = { ...rest }
  if ('data' in out) delete out.data
  if (issues !== undefined) out.issues = formatIssuesCell(issues)
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    for (const [k, v] of Object.entries(nested as Record<string, unknown>)) {
      if (k in out && out[k] !== v) {
        out[`data.${k}`] = v
      } else {
        out[k] = v
      }
    }
  }
  return out
}

/** Collect row objects from common backend envelope shapes (cases/clients/excel preview). */
function extractRowArray(payload: Record<string, unknown>): PreviewRows | null {
  const dataVal = payload.data
  const tryArray = (v: unknown): PreviewRows | null => {
    if (!Array.isArray(v)) return null
    if (!v.every((r) => r && typeof r === 'object' && !Array.isArray(r))) return null
    return v as PreviewRows
  }

  const direct = tryArray(payload)
  if (direct) return direct

  if (Array.isArray(dataVal) && tryArray(dataVal)) return dataVal as PreviewRows

  if (dataVal && typeof dataVal === 'object' && !Array.isArray(dataVal)) {
    const dataObj = dataVal as Record<string, unknown>
    for (const key of ['rows', 'cases', 'clients', 'items', 'records', 'preview']) {
      const found = tryArray(dataObj[key])
      if (found) return found
    }
    const vals = Object.values(dataObj).filter(Array.isArray) as unknown[][]
    for (const arr of vals) {
      const found = tryArray(arr)
      if (found) return found
    }
  }

  const topKeys = ['rows', 'cases', 'clients']
  for (const key of topKeys) {
    const found = tryArray(payload[key])
    if (found) return found
  }

  return null
}

function toRows(preview: unknown): PreviewRows | null {
  if (!preview) return null

  let raw: PreviewRows | null = null

  if (Array.isArray(preview) && preview.every((r) => r && typeof r === 'object' && !Array.isArray(r))) {
    raw = preview as PreviewRows
  } else if (typeof preview === 'object' && preview) {
    raw = extractRowArray(preview as Record<string, unknown>)
  }

  if (!raw || raw.length === 0) return raw

  const flattened = raw.map((r) => flattenPreviewRecord(r as Record<string, unknown>))
  return expandRowsWithEmbeddedClients(flattened)
}

function toErrors(preview: unknown): string[] {
  if (!preview || typeof preview !== 'object') return []
  const obj = preview as Record<string, unknown>
  const candidates = [obj.errors, (obj.data as any)?.errors, (obj.data as any)?.validationErrors]
  const arr = candidates.find((v) => Array.isArray(v)) as unknown[] | undefined
  if (!arr) return []
  const out: string[] = []
  for (const e of arr) {
    if (typeof e === 'string') {
      out.push(e)
      continue
    }
    if (e && typeof e === 'object') {
      const row = (e as any).row
      const nested = (e as any).errors
      if (Array.isArray(nested) && nested.every((x) => typeof x === 'string')) {
        for (const msg of nested) out.push(row != null ? `Row ${row}: ${msg}` : msg)
        continue
      }
      const msg = (e as any).message || (e as any).error
      out.push(row != null && msg ? `Row ${row}: ${msg}` : msg || JSON.stringify(e))
      continue
    }
    out.push(String(e))
  }
  return out.filter(Boolean)
}

export interface ExcelImportDialogProps {
  open: boolean
  title: string
  previewPath: string
  importPath: string
  onClose: () => void
  onImported?: () => void
  disabled?: boolean
}

export default function ExcelImportDialog({
  open,
  title,
  previewPath,
  importPath,
  onClose,
  onImported,
  disabled,
}: ExcelImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<unknown>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setFile(null)
      setPreview(null)
      setPreviewLoading(false)
      setImportLoading(false)
    }
  }, [open])

  const rows = useMemo(() => toRows(preview), [preview])
  const errors = useMemo(() => toErrors(preview), [preview])

  const previewSummary = useMemo(() => {
    if (!preview || typeof preview !== 'object') return { msg: '', success: null as boolean | null }
    const p = preview as Record<string, unknown>
    const dataObj = p.data && typeof p.data === 'object' && !Array.isArray(p.data) ? (p.data as Record<string, unknown>) : null
    const msg =
      typeof p.message === 'string'
        ? p.message
        : dataObj && typeof dataObj.message === 'string'
          ? dataObj.message
          : ''
    const success = typeof p.success === 'boolean' ? p.success : null
    return { msg, success }
  }, [preview])

  const columns = useMemo(() => {
    if (!rows || rows.length === 0) return []
    const keys = Array.from(
      rows.reduce((set, r) => {
        Object.keys(r || {}).forEach((k) => set.add(k))
        return set
      }, new Set<string>())
    )
    const commonCol = (
      field: string,
      extra?: Partial<{ flex: number; minWidth: number; renderCell: (params: any) => JSX.Element }>,
    ) =>
      ({
        field,
        headerName: tableColumnLabel(field),
        flex: 1,
        minWidth: 140,
        valueGetter: (params: any) => {
          const v = params.row?.[field]
          if (v == null) return ''
          if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v
          return JSON.stringify(v)
        },
        ...extra,
      }) as Record<string, unknown>

    return keys.slice(0, 48).map((k) => {
      if (k === 'clientsPreviewSummary') {
        return commonCol(k, {
          flex: 1.75,
          minWidth: 280,
          renderCell: (params: any) => (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', py: 0.5 }}>
              {params.value ?? ''}
            </Typography>
          ),
        }) as Record<string, unknown>
      }
      return commonCol(k)
    }) as Record<string, unknown>[]
  }, [rows])

  const canPreview = !!file && !previewLoading && !importLoading && !disabled
  const canImport = !!file && !!preview && !importLoading && !previewLoading && !disabled

  const pickFile = (f?: File) => {
    if (!f) return
    const isExcel =
      f.name.toLowerCase().endsWith('.xlsx') ||
      f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if (!isExcel) {
      toast.error('Please select a .xlsx file')
      return
    }
    setFile(f)
    setPreview(null)
  }

  const handlePreview = async () => {
    if (!file) return
    setPreviewLoading(true)
    try {
      const res = await previewExcelImport(previewPath, file)
      setPreview(res)
      toast.success('Here’s a quick look at your file—scroll the table below.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'We couldn’t read that preview—give it another shot or pick a different file.')
      setPreview(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return
    setImportLoading(true)
    try {
      const res = await importExcel(importPath, file)
      // Always surface server response in the dialog so users can see row errors/warnings.
      setPreview(res)

      const msg =
        res && typeof res === 'object'
          ? ((res as any).message || (res as any).data?.message || 'Import completed')
          : 'Import completed'

      const errorLines = toErrors(res)
      if (errorLines.length > 0) {
        toast(msg, { icon: '⚠️' })
        // Keep dialog open so user can read/fix errors.
        return
      }

      const successFlag = res && typeof res === 'object' ? (res as any).success : undefined
      if (successFlag === false) {
        toast.error(msg)
        return
      }

      toast.success(msg)
      onImported?.()
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import didn’t finish—try again in a moment.')
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => !previewLoading && !importLoading && onClose()} maxWidth="lg" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {disabled && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You don&apos;t have permission for this action.
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Choose your spreadsheet, tap Preview to see how it reads, then Import when you’re happy. Nothing is saved until you import.
          </Typography>

          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            id="excel-import-file"
            style={{ display: 'none' }}
            onChange={(e) => {
              pickFile(e.target.files?.[0])
              e.target.value = ''
            }}
            disabled={previewLoading || importLoading || !!disabled}
          />

          <Box
            component="label"
            htmlFor="excel-import-file"
            sx={{
              display: 'block',
              border: '2px dashed',
              borderColor: file ? 'primary.main' : 'divider',
              bgcolor: file ? 'primary.50' : 'action.hover',
              p: 2,
              borderRadius: 2,
              cursor: previewLoading || importLoading || disabled ? 'not-allowed' : 'pointer',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Upload size={18} />
              <Typography variant="body2" fontWeight={600}>
                {file ? file.name : 'Click to choose .xlsx file'}
              </Typography>
            </Box>
            {!file && (
              <Typography variant="caption" color="text.secondary">
                Only `.xlsx` supported.
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={previewLoading ? <CircularProgress size={16} /> : <Eye size={16} />}
              onClick={handlePreview}
              disabled={!canPreview}
            >
              {previewLoading ? 'Previewing...' : 'Preview'}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={importLoading ? <CircularProgress size={16} /> : <CheckCircle2 size={16} />}
              onClick={handleImport}
              disabled={!canImport}
            >
              {importLoading ? 'Importing...' : 'Import'}
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setFile(null)
                setPreview(null)
              }}
              disabled={previewLoading || importLoading}
            >
              Reset
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {errors.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                Worth fixing before you import
              </Typography>
              <Box component="ul" sx={{ pl: 2, my: 0 }}>
                {errors.slice(0, 12).map((e, i) => (
                  <li key={`${i}-${e}`}>
                    <Typography variant="body2">{e}</Typography>
                  </li>
                ))}
              </Box>
              {errors.length > 12 && (
                <Typography variant="caption" color="text.secondary">
                  Showing 12 of {errors.length}.
                </Typography>
              )}
            </Alert>
          )}

          {preview == null ? (
            <Alert severity="info">Choose a file above, then Preview—we’ll show you what we understood.</Alert>
          ) : rows && rows.length > 0 ? (
            <Box sx={{ height: 420, width: '100%' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Read this like a quick sanity check. {rows.length} line{rows.length === 1 ? '' : 's'} below—you can still tweak the workbook and Preview again anytime.
              </Typography>
              <DataGrid
                rows={rows.map((r, idx) => ({ __id: idx, ...r }))}
                columns={[{ field: '__id', headerName: 'Line #', width: 78 }, ...columns] as any}
                getRowId={(r) => (r as any).__id}
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { page: 0, pageSize: 10 } },
                }}
              />
            </Box>
          ) : typeof preview === 'string' ? (
            <Alert severity="warning">{preview}</Alert>
          ) : (
            <Alert severity={previewSummary.success === false ? 'error' : 'info'}>
              {previewSummary.msg ? (
                <Typography variant="body2" sx={{ mb: previewSummary.success === false ? 0 : 0.5, fontWeight: 500 }}>
                  {previewSummary.msg}
                </Typography>
              ) : null}
              <Typography variant="body2">
                {previewSummary.success === false
                  ? 'Something didn’t go through—adjust anything that looks odd in your file and try Preview again.'
                  : 'We didn’t find readable rows yet. Confirm you’re using the official template with data filled in, then Preview again—and we’ll try to lay them out neatly.'}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={previewLoading || importLoading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

