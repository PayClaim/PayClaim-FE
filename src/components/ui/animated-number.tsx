import { useEffect, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatter?: (val: number) => string
}

export function AnimatedNumber({
  value,
  duration = 200,
  formatter = (v) => String(Math.round(v)),
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced || duration <= 0 || value === 0) {
      setDisplayValue(value)
      return
    }

    let frameId = 0
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(value * eased)

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      } else {
        setDisplayValue(value)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [value, duration])

  return <>{formatter(displayValue)}</>
}
