import { useEffect } from "react"

let persistentCanvas: HTMLCanvasElement | null = null
let sceneMounted = false

function mountLoader() {
  const root = document.createElement("div")
  root.className = "particle-loader"
  root.setAttribute("role", "progressbar")
  root.setAttribute("aria-valuemin", "0")
  root.setAttribute("aria-valuemax", "100")
  root.setAttribute("aria-valuenow", "0")
  root.setAttribute(
    "aria-label",
    document.documentElement.lang.startsWith("es") ? "Cargando" : "Loading",
  )

  const label = document.createElement("span")
  label.className = "particle-loader__label"
  label.textContent = "0%"

  const track = document.createElement("div")
  track.className = "particle-loader__track"
  const fill = document.createElement("div")
  fill.className = "particle-loader__fill"
  track.append(fill)
  root.append(label, track)
  document.body.append(root)

  let progress = 0

  return {
    root,
    get progress() {
      return progress
    },
    setProgress(value: number) {
      progress = Math.min(100, Math.max(0, value))
      const pct = Math.round(progress)
      fill.style.width = `${progress}%`
      label.textContent = `${pct}%`
      root.setAttribute("aria-valuenow", String(pct))
    },
  }
}

function ensureParticleCanvas() {
  if (persistentCanvas?.isConnected) {
    return persistentCanvas
  }

  const existing = document.querySelector("canvas.particle-field")
  if (existing instanceof HTMLCanvasElement) {
    persistentCanvas = existing
    return persistentCanvas
  }

  const canvas = document.createElement("canvas")
  canvas.className = "particle-field"
  canvas.setAttribute("aria-hidden", "true")
  document.body.prepend(canvas)
  persistentCanvas = canvas
  return canvas
}

export function ParticleField({ hidden = false }: { hidden?: boolean }) {
  useEffect(() => {
    const canvas = ensureParticleCanvas()
    canvas.classList.toggle("is-hidden", hidden)
  }, [hidden])

  useEffect(() => {
    if (sceneMounted) return
    sceneMounted = true

    const canvas = ensureParticleCanvas()
    const loader = canvas.classList.contains("is-hidden") ? null : mountLoader()
    let frame = 0
    let waiting = true
    const started = performance.now()

    const pump = () => {
      if (!loader || !waiting) return
      const elapsed = performance.now() - started
      loader.setProgress(92 * (1 - Math.exp(-elapsed / 700)))
      frame = requestAnimationFrame(pump)
    }

    if (loader) frame = requestAnimationFrame(pump)

    void import("~/lib/particle-scene").then(({ mountParticleScene }) => {
      if (!persistentCanvas) return

      mountParticleScene(persistentCanvas, {
        onReady(reveal) {
          if (!loader) {
            reveal()
            return
          }

          waiting = false
          cancelAnimationFrame(frame)

          const finish = () => {
            const remaining = 100 - loader.progress
            if (remaining <= 0.5) {
              loader.setProgress(100)
              window.setTimeout(() => {
                loader.root.classList.add("is-done")
                reveal()
                window.setTimeout(() => loader.root.remove(), 480)
              }, 180)
              return
            }

            loader.setProgress(loader.progress + Math.max(0.85, remaining * 0.16))
            frame = requestAnimationFrame(finish)
          }

          finish()
        },
      })
    }).catch(() => {
      waiting = false
      cancelAnimationFrame(frame)
      loader?.root.remove()
    })
  }, [])

  return null
}
