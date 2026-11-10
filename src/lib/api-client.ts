import { storage } from './storage'

// lib/api-client.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message)
  }
}

const BASE_URL = import.meta.env.VITE_API_URL

type Options = Omit<RequestInit, 'body'> & {
  body?: unknown
  params?: Record<string, string | number>
}

export async function api<T>(
  path: string,
  { body, params, headers, ...init }: Options = {},
): Promise<T> {
  const qs = params
    ? '?' + new URLSearchParams(params as Record<string, string>)
    : ''
  const isFormData = body instanceof FormData

  const token = storage.get('token')
  const res = await fetch(`${BASE_URL}${path}${qs}`, {
    // credentials: 'include', // kirim cookie sesi HttpOnly
    headers: {
      ...(!isFormData && body !== undefined
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    // jika tidak memiliki body : undefined
    // jika memiliki body dan form-data : body as form data
    // jika regular json body : kirim as json
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    ...init,
  })

  let data: any = null
  if (res.status !== 204) {
    const text = await res.text().catch(() => '')
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text ? { message: text } : null
    }
  }

  if (!res.ok) {
    let errorMessage: string = res.statusText
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      errorMessage = data.errors.join('\n')
    } else if (data?.message) {
      errorMessage = data.message
    }
    throw new ApiError(res.status, errorMessage, data)
  }
  return data as T
}

api.get = <T>(path: string, o?: Options) =>
  api<T>(path, { ...o, method: 'GET' })

api.post = <T>(path: string, body?: unknown, o?: Options) =>
  api<T>(path, { ...o, method: 'POST', body })

api.put = <T>(path: string, body?: unknown, o?: Options) =>
  api<T>(path, { ...o, method: 'PUT', body })

api.patch = <T>(path: string, body?: unknown, o?: Options) =>
  api<T>(path, { ...o, method: 'PATCH', body })

api.delete = <T>(path: string, body?: unknown, o?: Options) =>
  api<T>(path, { ...o, method: 'DELETE', body })
