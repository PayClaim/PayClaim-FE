
export function normalizeTripProposalStatus(
  status?: string | null,
): string {
  return (status ?? '')
    .replace(/[\s_-]/g, '')
    .toLowerCase()
}

export function formatTripProposalDate(
  date?: string | null,
): string {
  if (!date) return '-'

  const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) return '-'

  return parsedDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTripProposalCurrency(
  amount?: number | null,
): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
}

export function getTripProposalInitials(
  name?: string | null,
): string {
  if (!name?.trim()) return '?'

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (
    parts[0][0] + parts[parts.length - 1][0]
  ).toUpperCase()
}

export function getSubmittedAtTime(
  value?: string | null,
): number {
  if (!value) return 0

  const timestamp = new Date(value).getTime()

  return Number.isFinite(timestamp) ? timestamp : 0
}

export function getTripProposalFileName(
  path?: string | null,
): string {
  if (!path) return ''

  const fileName =
    path.split(/[\\/]/).pop()?.split(/[?#]/)[0] || path

  try {
    return decodeURIComponent(fileName)
  } catch {
    return fileName
  }
}

export function isTripProposalImage(
  fileName?: string | null,
): boolean {
  return /\.(jpg|jpeg|png|webp|gif)(?:[?#].*)?$/i.test(
    fileName ?? '',
  )
}

export function isTripProposalPdf(
  fileName?: string | null,
): boolean {
  return /\.pdf(?:$|[?#])/i.test(fileName ?? '')
}

export function buildTripProposalAttachmentUrl(
  filePath?: string | null,
  apiUrl?: string,
): string {
  if (!filePath) return ''

  if (/^https?:\/\//i.test(filePath)) {
    return filePath
  }

  const backendBaseUrl = apiUrl
    ? apiUrl.replace(/\/api\/?$/, '')
    : ''

  return `${backendBaseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`
}

// =====================================================
// ACCOMMODATION BUDGET NOTES
// =====================================================

type AccommodationBudgetNotes = {
  notes: string | null
  accommodationAmountBefore?: number
  accommodationAmountAfter?: number
}

const ACCOMMODATION_BUDGET_MARKER =
  /^\[ACCOMMODATION_BUDGET:([0-9]+(?:\.[0-9]+)?)\|([0-9]+(?:\.[0-9]+)?)\]\r?\n?/

export function parseAccommodationBudgetNotes(
  notes?: string | null,
): AccommodationBudgetNotes {
  if (!notes) {
    return { notes: null }
  }

  const match = notes.match(ACCOMMODATION_BUDGET_MARKER)

  if (!match) {
    return { notes }
  }

  return {
    notes: notes.slice(match[0].length).trim() || null,
    accommodationAmountBefore: Number(match[1]),
    accommodationAmountAfter: Number(match[2]),
  }
}

export function stripAccommodationBudgetMarker(
  notes?: string | null,
): string | null {
  return parseAccommodationBudgetNotes(notes).notes
}
