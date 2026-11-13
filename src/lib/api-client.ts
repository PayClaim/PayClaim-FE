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

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return ''

  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, String(v)))
    } else {
      sp.append(key, String(value))
    }
  }

  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export async function api<T>(
  path: string,
  { body, params, headers, ...init }: Options = {},
): Promise<T> {
  const qs = buildQuery(params)
  const isFormData = body instanceof FormData

  const token = storage.get('token')
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}${qs}`, {
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
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
      ...init,
    })
  } catch (netErr: unknown) {
    throw new ApiError(
      0,
      'Failed to connect to the server. Make sure your network connection is active and the backend server is running.',
      netErr,
    )
  }

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
    let errorMessage: string =
      res.statusText || 'An error occurred while processing the request.'
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      errorMessage = data.errors.join('\n')
    } else if (data?.message) {
      errorMessage = data.message
    } else if (res.status === 401) {
      errorMessage = 'Your login session has expired. Please sign in again.'
    } else if (res.status === 403) {
      errorMessage =
        'Access denied: You do not have permission to perform this action.'
    } else if (res.status === 404) {
      errorMessage = 'The requested data or service was not found.'
    } else if (res.status >= 500) {
      errorMessage =
        'An internal server error occurred. Please try again later.'
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
