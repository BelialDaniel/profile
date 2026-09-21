import { useEffect, useRef } from "react"

export function ShipLabCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let disposed = false
    let dispose: (() => void) | undefined

    void import("~/lib/ship-lab-scene").then(({ mountShipLabScene }) => {
      if (disposed || !canvasRef.current) return
      dispose = mountShipLabScene(canvas)
    })

    return () => {
      disposed = true
      dispose?.()
    }
  }, [])

  return <canvas ref={canvasRef} className="ship-lab__canvas" />
}
