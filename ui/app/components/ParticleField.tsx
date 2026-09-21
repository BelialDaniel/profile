import { useEffect, useRef } from "react"

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let disposed = false
    let dispose: (() => void) | undefined

    void import("~/lib/particle-scene").then(({ mountParticleScene }) => {
      if (disposed || !canvasRef.current) return
      dispose = mountParticleScene(canvas)
    })

    return () => {
      disposed = true
      dispose?.()
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />
  )
}
