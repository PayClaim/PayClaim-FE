export function getFriendlyErrorMessage(
  err: unknown,
  fallback = 'A system error occurred. Please try again later.',
): string {
  if (!err) return fallback
  if (typeof err === 'string') return err

  const errorObj = err as { message?: string; status?: number; data?: unknown }
  const message = errorObj.message?.trim() || ''

  if (!message) return fallback

  // Tangani kegagalan jaringan atau server tidak terjangkau
  if (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('koneksi jaringan') ||
    message.includes('Failed to connect to the server')
  ) {
    return 'Failed to connect to the server. Make sure your internet connection is active and the backend server is running.'
  }

  // Tangani kesalahan teknis runtime JavaScript
  if (
    message.includes('is not a function') ||
    message.includes('undefined is not') ||
    message.includes('cannot read property') ||
    message.includes('null is not')
  ) {
    return fallback
  }

  return message
}
