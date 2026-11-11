import { toast } from 'sonner'
import { createServerFn } from '@tanstack/react-start'

/**
 * Server function yang dieksekusi di Node.js (TanStack Start / Nitro).
 * Node.js dapat mengambil file dari backend tanpa terhalang CORS browser,
 * sehingga file static selalu berhasil diambil meskipun backend belum menambahkan CORS header.
 */
export const fetchFileAsBase64ServerFn = createServerFn({ method: 'GET' })
  .validator((url: string) => url)
  .handler(async ({ data: targetUrl }) => {
    const res = await fetch(targetUrl)
    if (!res.ok) {
      throw new Error(`Failed to fetch file from backend: ${res.status} ${res.statusText}`)
    }
    const arrayBuffer = await res.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    return { base64, contentType }
  })

function triggerBlobDownload(blob: Blob, fileName: string) {
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl)
  }, 2000)
}

function base64ToBlob(base64: string, contentType: string): Blob {
  const binaryString = window.atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return new Blob([bytes], { type: contentType })
}

/**
 * Mengunduh file PDF atau gambar tanpa membuka tab baru (viewer).
 * Memastikan file langsung terunduh ke komputer pengguna (folder Downloads).
 */
export async function downloadFile(
  urlOrPath: string | null | undefined,
  preferredFileName?: string | null,
): Promise<void> {
  if (!urlOrPath) {
    toast.error('File link is not available.')
    return
  }

  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : ''

  const rawFileName =
    preferredFileName ||
    urlOrPath.split('/').pop()?.split('?')[0]?.split('#')[0] ||
    'document'

  const fileName = rawFileName.trim() || 'download'

  let directUrl = urlOrPath
  if (!urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://')) {
    directUrl = `${backendBaseUrl}${urlOrPath.startsWith('/') ? '' : '/'}${urlOrPath}`
  }

  toast.info(`Preparing download for ${fileName}...`)

  // 1. Coba unduh langsung via client-side blob fetch
  try {
    const response = await fetch(directUrl)
    if (response.ok) {
      const blob = await response.blob()
      triggerBlobDownload(blob, fileName)
      toast.success(`Downloading ${fileName}`)
      return
    }
  } catch {
    // Client-side fetch terhambat CORS browser
    // Lanjutkan ke server-side proxy TanStack Start
  }

  // 2. Gunakan Server Function Node.js untuk bypass CORS browser
  try {
    const result = await fetchFileAsBase64ServerFn({ data: directUrl })
    const blob = base64ToBlob(result.base64, result.contentType)
    triggerBlobDownload(blob, fileName)
    toast.success(`Downloading ${fileName}`)
  } catch (err) {
    console.error('Download failed:', err)
    toast.error(`Failed to download ${fileName}.`)
  }
}
