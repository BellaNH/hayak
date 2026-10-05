/**
 * TEMP RECORD TOUR — remove this file + its SitePage import after filming.
 * Activate with: /?record=1
 * Press Esc to cancel mid-scroll.
 *
 * Same as Krispy: constant linear scroll over 16s (no slowdown at the end).
 * Redeploy stamp: 2026-10-05-record-tour
 */
import { useEffect } from 'react'

const START_DELAY_MS = 1000
const HERO_HOLD_MS = 1400
const SCROLL_DURATION_MS = 16000

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const id = window.setTimeout(resolve, ms)
    const onAbort = () => {
      window.clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function revealAll(root) {
  root.querySelectorAll('.reveal').forEach((node) => {
    node.classList.add('is-visible')
  })
}

function animateScrollLinear(toY, duration, signal) {
  const fromY = window.scrollY
  const dist = toY - fromY
  if (Math.abs(dist) < 2) return Promise.resolve()

  const t0 = performance.now()
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException('Aborted', 'AbortError'))
    signal?.addEventListener('abort', onAbort, { once: true })

    function step(now) {
      if (signal?.aborted) return
      const t = Math.min(1, (now - t0) / duration)
      window.scrollTo(0, fromY + dist * t)
      if (t < 1) requestAnimationFrame(step)
      else {
        window.scrollTo(0, toY)
        signal?.removeEventListener('abort', onAbort)
        resolve()
      }
    }
    requestAnimationFrame(step)
  })
}

async function runTour(root, signal) {
  const prevBehavior = document.documentElement.style.scrollBehavior
  document.documentElement.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)

  await wait(START_DELAY_MS, signal)
  await wait(HERO_HOLD_MS, signal)
  revealAll(root)

  const endY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  )
  await animateScrollLinear(endY, SCROLL_DURATION_MS, signal)

  document.documentElement.style.scrollBehavior = prevBehavior
}

/** DELETE after filming. Only runs with ?record=1 or ?demo=1. */
export function useRecordTour(rootRef) {
  useEffect(() => {
    const root = rootRef?.current
    if (!root) return undefined

    const params = new URLSearchParams(window.location.search)
    if (!params.has('record') && !params.has('demo')) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const controller = new AbortController()
    const { signal } = controller

    const onKeyDown = (event) => {
      if (event.key === 'Escape') controller.abort()
    }
    window.addEventListener('keydown', onKeyDown)

    runTour(root, signal).catch((err) => {
      if (err?.name !== 'AbortError') console.error(err)
    })

    return () => {
      controller.abort()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [rootRef])
}
