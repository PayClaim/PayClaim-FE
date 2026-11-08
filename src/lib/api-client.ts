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

  const token = storage.get('token')
  const res = await fetch(`${BASE_URL}${path}${qs}`, {
    // credentials: 'include', // kirim cookie sesi HttpOnly
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  })

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok)
    throw new ApiError(res.status, data?.message ?? res.statusText, data)
  return data as T
}

api.get = <T>(path: string, o?: Options) =>
  api<T>(path, { ...o, method: 'GET' })

api.post = <T>(path: string, body?: unknown, o?: Options) =>
  api<T>(path, { ...o, method: 'POST', body })

api.put = <T>(path: string, body?: unknown, o?: Options) =>
  api<T>(path, { ...o, method: 'PUT', body })

api.delete = <T>(path: string, body?: unknown, o?: Options) =>
  api<T>(path, { ...o, method: 'DELETE', body })
