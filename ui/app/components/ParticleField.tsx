import { useEffect } from "react"

let persistentCanvas: HTMLCanvasElement | null = null
let sceneMounted = false

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

    if (sceneMounted) {
      return
    }

    sceneMounted = true
    void import("~/lib/particle-scene").then(({ mountParticleScene }) => {
      if (persistentCanvas) {
        mountParticleScene(persistentCanvas)
      }
    })
  }, [hidden])

  return null
}
