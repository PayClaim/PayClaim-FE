import { useEffect } from 'react'
import type { RefObject } from 'react'

const MAX_PULL_DOWN = 18
const MAX_PULL_UP = 22
const RESISTANCE = 85
const IDLE_RELEASE_MS = 70
/** Batas maksimal konten "ditahan" di ujung walau wheel terus berputar. */
const MAX_HOLD_MS = 200
/** Jeda sebelum bounce boleh dipicu lagi di ujung yang sama. */
const COOLDOWN_MS = 120
const RELEASE_MS = 240
/** Sedikit overshoot supaya terasa kenyal, tapi ekornya pendek. */
const RELEASE_EASING = 'cubic-bezier(0.94, 1.4, 0.64, 1)'

/**
 * Memberi efek "mentok" (rubber-band) saat scroll halaman mencapai ujung
 * atas/bawah. Target `ref` sebaiknya elemen konten saja (bukan header),
 * supaya header tidak ikut bergeser.
 *
 * Catatan performa:
 * - hanya mengubah `transform` (compositor-friendly), tanpa layout reflow
 * - listener wheel non-blocking, satu rAF per event
 * - otomatis nonaktif pada prefers-reduced-motion dan perangkat sentuh
 *   (agar tidak dobel dengan bounce native Safari/mobile)
 */
export function useOverscrollBounce(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || typeof window === 'undefined') return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const precisePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    )

    if (reduceMotion.matches || !precisePointer.matches) return

    const root = document.documentElement
    let raw = 0
    let rafId = 0
    let idleTimer: ReturnType<typeof setTimeout> | undefined
    let cleanupTimer: ReturnType<typeof setTimeout> | undefined
    let holdStartedAt = 0
    let coolingDown = false
    let cooldownTimer: ReturnType<typeof setTimeout> | undefined

    const pageScrollable = () =>
      root.scrollHeight - window.innerHeight > 2

    const atTop = () => window.scrollY <= 0

    const atBottom = () =>
      window.scrollY + window.innerHeight >= root.scrollHeight - 1

    const paint = () => {
      rafId = 0

      const limit = raw >= 0 ? MAX_PULL_DOWN : MAX_PULL_UP
      // Kurva jenuh: tarikan awal terasa langsung, makin ditarik makin berat.
      const distance = limit * (1 - Math.exp(-Math.abs(raw) / RESISTANCE))
      const y = Math.sign(raw) * distance

      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`
    }

    const schedulePaint = () => {
      if (!rafId) rafId = requestAnimationFrame(paint)
    }

    const cancelPaint = () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    }

    const release = () => {
      raw = 0
      cancelPaint()
      el.style.transition = `transform ${RELEASE_MS}ms ${RELEASE_EASING}`
      el.style.transform = ''

      cleanupTimer = setTimeout(() => {
        el.style.willChange = ''
        el.style.transition = ''
      }, RELEASE_MS + 60)
    }

    const armCooldown = () => {
      coolingDown = true
      clearTimeout(cooldownTimer)
      cooldownTimer = setTimeout(() => {
        coolingDown = false
      }, COOLDOWN_MS)
    }

    /**
     * Jangan ganggu container yang punya scroll sendiri
     * (mis. panel detail dengan overflow-y-auto atau dialog).
     */
    const hasNestedVerticalScroller = (target: EventTarget | null) => {
      let node = target as HTMLElement | null

      while (node && node !== el) {
        const overflowY = getComputedStyle(node).overflowY

        if (
          (overflowY === 'auto' || overflowY === 'scroll') &&
          node.scrollHeight > node.clientHeight + 4
        ) {
          return true
        }

        node = node.parentElement
      }

      return false
    }

    const onWheel = (event: WheelEvent) => {
      // Ctrl+wheel = zoom browser, jangan diintervensi.
      if (event.ctrlKey || event.defaultPrevented) return
      if (!pageScrollable()) return
      if (!el.contains(event.target as Node)) return

      // Beberapa mouse mengirim delta dalam satuan baris, bukan piksel.
      const delta =
        event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
      if (!delta) return

      // Arah pull: positif = konten turun (mentok atas),
      // negatif = konten naik (mentok bawah).
      let direction = 0

      if (delta < 0 && atTop()) direction = 1
      else if (delta > 0 && atBottom()) direction = -1

      // Sudah lepas dari ujung -> boleh bounce lagi pada tarikan berikutnya.
      if (!direction) {
        coolingDown = false
        clearTimeout(cooldownTimer)
        return
      }

      // Setelah satu sesi bounce selesai, abaikan sisa momentum wheel
      // sebentar; timer diperpanjang selama wheel masih berputar.
      if (coolingDown) {
        armCooldown()
        return
      }

      // Cek container scroll internal hanya ketika sudah mentok,
      // supaya wheel di area normal tetap murah.
      if (hasNestedVerticalScroller(event.target)) return

      const now = performance.now()

      if (!raw) holdStartedAt = now

      // Wheel free-spin / trackpad momentum bisa terus mengirim event
      // selama 1-2 detik. Batasi durasi tarikan agar tidak terasa "nyangkut".
      if (now - holdStartedAt > MAX_HOLD_MS) {
        clearTimeout(idleTimer)
        armCooldown()
        release()
        return
      }

      clearTimeout(idleTimer)
      clearTimeout(cleanupTimer)

      raw = direction * Math.min(Math.abs(raw) + Math.abs(delta), 2400)

      el.style.transition = 'none'
      el.style.willChange = 'transform'
      schedulePaint()

      idleTimer = setTimeout(release, IDLE_RELEASE_MS)
    }

    const onScroll = () => {
      if (!atTop() && !atBottom()) {
        coolingDown = false
        clearTimeout(cooldownTimer)
      }
      if (!raw) return

      clearTimeout(idleTimer)
      clearTimeout(cleanupTimer)
      release()
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
      clearTimeout(idleTimer)
      clearTimeout(cleanupTimer)
      clearTimeout(cooldownTimer)
      cancelPaint()

      el.style.transform = ''
      el.style.transition = ''
      el.style.willChange = ''
    }
  }, [ref, enabled])
}
