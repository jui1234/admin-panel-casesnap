import { downloadBlob } from '@/utils/fileDownload'

function getBackendBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_BACKEND_URL
  const base = (raw || '').trim().replace(/\/$/, '')
  if (!base) {
    throw new Error('Backend URL not configured. Set NEXT_PUBLIC_APP_BACKEND_URL in your .env file.')
  }
  return base
}

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('authToken') || localStorage.getItem('token') || ''
}

async function fetchAuthed(input: string, init?: RequestInit): Promise<Response> {
  const token = getToken()
  return await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

async function parseJsonOrText(res: Response): Promise<unknown> {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return await res.json()
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function downloadExcelFile(path: string, filename: string) {
  const base = getBackendBaseUrl()
  const res = await fetchAuthed(`${base}${path}`, { method: 'GET' })
  if (!res.ok) {
    const body = await parseJsonOrText(res)
    const msg =
      typeof body === 'object' && body
        ? ((body as { error?: string; message?: string }).error ??
          (body as { message?: string }).message ??
          `Download failed (${res.status})`)
        : `Download failed (${res.status})`
    throw new Error(msg)
  }
  const blob = await res.blob()
  downloadBlob(blob, filename)
}

export async function previewExcelImport(path: string, file: File) {
  const base = getBackendBaseUrl()
  const form = new FormData()
  form.append('file', file)
  const res = await fetchAuthed(`${base}${path}`, { method: 'POST', body: form })
  const body = await parseJsonOrText(res)
  if (!res.ok) {
    const msg =
      typeof body === 'object' && body
        ? ((body as { error?: string; message?: string }).error ??
          (body as { message?: string }).message ??
          `Preview failed (${res.status})`)
        : `Preview failed (${res.status})`
    throw new Error(msg)
  }
  return body
}

export async function importExcel(path: string, file: File) {
  const base = getBackendBaseUrl()
  const form = new FormData()
  form.append('file', file)
  const res = await fetchAuthed(`${base}${path}`, { method: 'POST', body: form })
  const body = await parseJsonOrText(res)
  if (!res.ok) {
    const msg =
      typeof body === 'object' && body
        ? ((body as { error?: string; message?: string }).error ??
          (body as { message?: string }).message ??
          `Import failed (${res.status})`)
        : `Import failed (${res.status})`
    throw new Error(msg)
  }
  return body
}

