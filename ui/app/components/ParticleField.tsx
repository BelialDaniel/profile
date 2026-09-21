import { useEffect, useRef } from "react"

export function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let dispose: (() => void) | undefined

    void import("~/lib/particle-scene").then(({ mountParticleScene }) => {
      if (disposed || !containerRef.current) return
      dispose = mountParticleScene(container)
    })

    return () => {
      disposed = true
      dispose?.()
    }
  }, [])

  return <div ref={containerRef} className="particle-field" aria-hidden="true" />
}
