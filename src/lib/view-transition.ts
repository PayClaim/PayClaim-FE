/**
 * Util transisi halaman berbasis View Transitions API.
 *
 * Nama `record-card` dipakai bersama oleh baris tabel (sumber) dan kartu
 * detail (tujuan), sehingga browser dapat melakukan shared-element morph.
 */

export const RECORD_CARD_TRANSITION = 'record-card'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function canUseViewTransition(): boolean {
  return (
    typeof document !== 'undefined' && 'startViewTransition' in document
  )
}

/**
 * Opsi tambahan untuk `navigate()` TanStack Router. Aman dipakai di browser
 * lama karena router akan mengabaikannya bila API tidak tersedia.
 */
export function viewTransitionNavOptions(): { viewTransition?: true } {
  return canUseViewTransition() && !prefersReducedMotion()
    ? { viewTransition: true }
    : {}
}

/**
 * Tandai elemen sumber (mis. baris tabel) sebagai asal shared-element.
 * Dipanggil tepat sebelum navigasi. Elemen lama akan hilang setelah route
 * berganti, jadi tidak perlu cleanup manual.
 */
export function markRecordCardSource(element: Element | null) {
  if (!element || !canUseViewTransition() || prefersReducedMotion()) return

  ;(element as HTMLElement).style.viewTransitionName =
    RECORD_CARD_TRANSITION
}
