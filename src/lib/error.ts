export function getFriendlyErrorMessage(
  err: unknown,
  fallback = 'Terjadi kesalahan sistem, silakan coba beberapa saat lagi',
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
    message.includes('koneksi jaringan')
  ) {
    return 'Gagal terhubung ke server. Pastikan koneksi internet aktif dan server backend sedang berjalan.'
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
