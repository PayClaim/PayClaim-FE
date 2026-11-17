import {
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

type SkeletonSwapProps = {
  loading: boolean
  skeleton: ReactNode
  children: ReactNode
  className?: string
  /** Tinggi minimum saat skeleton tampil agar layout tidak melompat. */
  minHeight?: string
}

const FADE_OUT_MS = 260

/**
 * Crossfade skeleton -> konten tanpa meng-unmount konten saat refetch.
 * Overlay skeleton berada di atas konten (absolute) lalu memudar keluar,
 * sementara konten memudar masuk. Hanya opacity yang dianimasikan.
 */
export function SkeletonSwap({
  loading,
  skeleton,
  children,
  className,
  minHeight = '60vh',
}: SkeletonSwapProps) {
  const [overlayMounted, setOverlayMounted] = useState(loading)
  const [overlayVisible, setOverlayVisible] = useState(loading)
  const [contentReady, setContentReady] = useState(!loading)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (loading) {
      setOverlayMounted(true)

      const frame = requestAnimationFrame(() => {
        setOverlayVisible(true)
      })

      setContentReady(false)

      return () => cancelAnimationFrame(frame)
    }

    setOverlayVisible(false)

    const frame = requestAnimationFrame(() => {
      setContentReady(true)
    })

    timerRef.current = window.setTimeout(() => {
      setOverlayMounted(false)
    }, FADE_OUT_MS)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timerRef.current)
    }
  }, [loading])

  return (
    <div
      aria-busy={loading}
      className={cn('relative min-w-0', className)}
      style={loading && !overlayMounted ? { minHeight } : undefined}
    >
      <div
        className={cn(
          'min-w-0 transition-opacity duration-300 ease-out motion-reduce:transition-none',
          contentReady ? 'opacity-100' : 'opacity-0',
        )}
      >
        {children}
      </div>

      {overlayMounted ? (
        <div
          aria-hidden={!loading}
          className={cn(
            'absolute inset-0 z-10 overflow-hidden bg-background transition-opacity duration-300 ease-out motion-reduce:transition-none',
            overlayVisible && loading
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0',
          )}
          style={loading ? { minHeight } : undefined}
        >
          {skeleton}
        </div>
      ) : null}
    </div>
  )
}
