import * as THREE from "three"

const trailTangent = new THREE.Vector3()
const trailSide = new THREE.Vector3()
const trailUp = new THREE.Vector3(0, 1, 0)
const mappedHistory = new THREE.Vector3()

export type ShipTrail = {
  mesh: THREE.Mesh
  history: THREE.Vector3[]
  positions: Float32Array
  positionAttr: THREE.BufferAttribute
  segments: number
  length: number
  width: number
  dispose: () => void
}

export function createDynamicTrail(options?: {
  segments?: number
  length?: number
  width?: number
  opacity?: number
}): ShipTrail {
  const segments = options?.segments ?? 24
  const length = options?.length ?? 1.55
  const width = options?.width ?? 0.07
  const opacity = options?.opacity ?? 0.55
  const history = Array.from({ length: segments }, () => new THREE.Vector3())
  const vertexCount = segments * 2
  const positions = new Float32Array(vertexCount * 3)
  const colors = new Float32Array(vertexCount * 3)
  const indices: number[] = []

  for (let i = 0; i < segments; i++) {
    const fade = 1 - i / (segments - 1)
    for (let side = 0; side < 2; side++) {
      const i3 = (i * 2 + side) * 3
      colors[i3] = 0.58 * fade
      colors[i3 + 1] = 0.88 * fade
      colors[i3 + 2] = 1 * fade
    }
  }

  for (let i = 0; i < segments - 1; i++) {
    const a = i * 2
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }

  const geometry = new THREE.BufferGeometry()
  const positionAttr = new THREE.BufferAttribute(positions, 3)
  geometry.setAttribute("position", positionAttr)
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  geometry.setIndex(indices)

  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.frustumCulled = false

  return {
    mesh,
    history,
    positions,
    positionAttr,
    segments,
    length,
    width,
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}

export function seedTrail(trail: ShipTrail, nozzle: THREE.Vector3) {
  for (const point of trail.history) {
    point.copy(nozzle)
  }
}

export function updateTrail(
  trail: ShipTrail,
  nozzle: THREE.Vector3,
  back: THREE.Vector3,
  options?: {
    pull?: number
    follow?: boolean
    record?: THREE.Vector3
    mapHistory?: (point: THREE.Vector3, out: THREE.Vector3) => THREE.Vector3
  },
) {
  const pull = options?.pull ?? 2.6
  const follow = options?.follow ?? false

  for (let i = trail.segments - 1; i > 0; i--) {
    trail.history[i].copy(trail.history[i - 1])
  }
  trail.history[0].copy(options?.record ?? nozzle)

  for (let i = 0; i < trail.segments; i++) {
    const t = i / (trail.segments - 1)
    const lagged = options?.mapHistory
      ? options.mapHistory(trail.history[i], mappedHistory)
      : trail.history[i]
    const lagX = follow ? lagged.x - nozzle.x : nozzle.x - lagged.x
    const lagY = follow ? lagged.y - nozzle.y : nozzle.y - lagged.y
    const x = nozzle.x + back.x * t * trail.length + lagX * pull
    const y = nozzle.y + back.y * t * trail.length + lagY * pull
    const z = nozzle.z + back.z * t * trail.length
    trailTangent.copy(back)

    if (trailTangent.lengthSq() < 0.000001) {
      trailTangent.set(0, 0, 1)
    } else {
      trailTangent.normalize()
    }

    trailSide.crossVectors(trailTangent, trailUp)
    if (trailSide.lengthSq() < 0.000001) {
      trailSide.set(1, 0, 0)
    } else {
      trailSide.normalize()
    }

    const halfWidth = trail.width * (1 - t * 0.45) * 0.5
    const left = i * 6
    const right = left + 3

    trail.positions[left] = x - trailSide.x * halfWidth
    trail.positions[left + 1] = y - trailSide.y * halfWidth
    trail.positions[left + 2] = z - trailSide.z * halfWidth
    trail.positions[right] = x + trailSide.x * halfWidth
    trail.positions[right + 1] = y + trailSide.y * halfWidth
    trail.positions[right + 2] = z + trailSide.z * halfWidth
  }

  trail.positionAttr.needsUpdate = true
  trail.mesh.geometry.computeBoundingSphere()
}
