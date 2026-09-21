import * as THREE from "three"

const PARTICLE_COUNT = 2600
const FIELD = { x: 96, y: 58, z: 150 }
const CAMERA_Z = 68
const MAX_OFFSET_X = 12
const MAX_OFFSET_Y = 7
const LERP = 0.016

export function mountParticleScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  scene.fog = new THREE.FogExp2(0x000000, 0.011)

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400)
  camera.position.set(0, 0, CAMERA_Z)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 1)

  const texture = createSoftCircleTexture()
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const colors = new Float32Array(PARTICLE_COUNT * 3)
  const accent = new THREE.Color(0x7dd3fc)
  const white = new THREE.Color(0xf7fbff)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * FIELD.x * 2
    positions[i3 + 1] = (Math.random() - 0.5) * FIELD.y * 2
    positions[i3 + 2] = (Math.random() - 0.5) * FIELD.z * 2

    const color = white.clone().lerp(accent, Math.random() * 0.55)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 1.4,
    map: texture,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })

  scene.add(new THREE.Points(geometry, material))

  const pointer = { x: 0, y: 0 }
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches

  const onPointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1
  }

  const setSize = () => {
    const width = canvas.clientWidth || window.innerWidth
    const height = canvas.clientHeight || window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true })
  const resizeObserver = new ResizeObserver(setSize)
  resizeObserver.observe(canvas)
  setSize()

  renderer.setAnimationLoop(() => {
    if (!reducedMotion) {
      const targetX = -pointer.x * MAX_OFFSET_X
      const targetY = pointer.y * MAX_OFFSET_Y
      camera.position.x += (targetX - camera.position.x) * LERP
      camera.position.y += (targetY - camera.position.y) * LERP
    }

    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
  })

  return () => {
    renderer.setAnimationLoop(null)
    window.removeEventListener("pointermove", onPointerMove)
    resizeObserver.disconnect()
    geometry.dispose()
    material.dispose()
    texture.dispose()
    renderer.dispose()
  }
}

function createSoftCircleTexture() {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Could not create particle texture")
  }

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, "rgba(255,255,255,1)")
  gradient.addColorStop(0.35, "rgba(210,230,255,0.42)")
  gradient.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}
