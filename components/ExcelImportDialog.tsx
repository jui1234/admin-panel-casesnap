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

function toRows(preview: unknown): PreviewRows | null {
  if (!preview) return null
  if (Array.isArray(preview) && preview.every((r) => r && typeof r === 'object' && !Array.isArray(r))) {
    return preview as PreviewRows
  }
  if (typeof preview === 'object' && preview) {
    const obj = preview as Record<string, unknown>
    const data = obj.data
    if (Array.isArray(data) && data.every((r) => r && typeof r === 'object' && !Array.isArray(r))) return data as PreviewRows
    if (data && typeof data === 'object') {
      const maybeRows = (data as Record<string, unknown>).rows
      if (Array.isArray(maybeRows) && maybeRows.every((r) => r && typeof r === 'object' && !Array.isArray(r))) {
        return maybeRows as PreviewRows
      }
    }
    const maybeRows = obj.rows
    if (Array.isArray(maybeRows) && maybeRows.every((r) => r && typeof r === 'object' && !Array.isArray(r))) return maybeRows as PreviewRows
  }
  return null
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

  const columns = useMemo(() => {
    if (!rows || rows.length === 0) return []
    const keys = Array.from(
      rows.reduce((set, r) => {
        Object.keys(r || {}).forEach((k) => set.add(k))
        return set
      }, new Set<string>())
    )
    return keys.slice(0, 40).map((k) => ({
      field: k,
      headerName: k,
      flex: 1,
      minWidth: 140,
      valueGetter: (params: any) => {
        const v = params.row?.[k]
        if (v == null) return ''
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v
        return JSON.stringify(v)
      },
    }))
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
      toast.success('Preview generated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Preview failed')
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
      toast.error(e instanceof Error ? e.message : 'Import failed')
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
            Upload an Excel file, preview the changes (no DB write), then confirm import.
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
                Validation notes
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
            <Alert severity="info">No preview yet. Upload a file and click Preview.</Alert>
          ) : rows && rows.length > 0 ? (
            <Box sx={{ height: 420, width: '100%' }}>
              <DataGrid
                rows={rows.map((r, idx) => ({ __id: idx, ...r }))}
                columns={[{ field: '__id', headerName: '#', width: 70 }, ...columns] as any}
                getRowId={(r) => (r as any).__id}
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { page: 0, pageSize: 10 } },
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                bgcolor: 'background.paper',
                maxHeight: 420,
                overflow: 'auto',
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Preview response
              </Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {typeof preview === 'string' ? preview : JSON.stringify(preview, null, 2)}
              </pre>
            </Box>
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

