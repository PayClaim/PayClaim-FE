// Membaca marker perubahan Accommodation Budget dari Notes.
// Format marker:
// [ACCOMMODATION_BUDGET:nominalLama|nominalBaru]

export const MAX_TRIP_AMOUNT = 100000000

export function parseAccommodationBudgetNotes(
  notes: string | null | undefined,
): {
  notes: string | null
  accommodationAmountBefore?: number
  accommodationAmountAfter?: number
} {
  if (!notes) {
    return {
      notes: null,
    }
  }

  const markerRegex =
    /^\[ACCOMMODATION_BUDGET:([0-9]+(?:\.[0-9]+)?)\|([0-9]+(?:\.[0-9]+)?)\]\r?\n?/

  const match = notes.match(markerRegex)

  if (!match) {
    return {
      notes,
    }
  }

  const accommodationAmountBefore = Number(match[1])
  const accommodationAmountAfter = Number(match[2])

  return {
    notes: notes.slice(match[0].length).trim() || null,
    accommodationAmountBefore,
    accommodationAmountAfter,
  }
}

export function getFileName(path: string) {
  if (!path) return ''

  const fileName =
    path.split(/[\\/]/).pop()?.split(/[?#]/)[0] || path

  try {
    return decodeURIComponent(fileName)
  } catch {
    return fileName
  }
}

// Format input angka dengan titik pemisah ribuan.
// Contoh: 1000000 menjadi 1.000.000.
// Nilai mentah di state tetap berupa angka tanpa titik.
export function formatNumericInput(value: string | number) {
  const digits = String(value ?? '').replace(/\D/g, '')

  if (!digits) return ''

  return new Intl.NumberFormat('id-ID').format(Number(digits))
}