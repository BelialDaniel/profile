import * as THREE from "three"
import { createShip } from "~/lib/create-ship"
import {
  createDynamicTrail,
  seedTrail,
  updateTrail,
} from "~/lib/ship-trails"

const PARTICLE_COUNT = 2000
const FIELD = { x: 96, y: 58, z: 150 }
const CAMERA_Z = 68
const MAX_OFFSET_X = 12
const MAX_OFFSET_Y = 7
const LERP = 0.016
const STAR_SPEED = 11.2
const Z_NEAR = CAMERA_Z - 10
const Z_FAR = -FIELD.z
const SHIP_SCALE = 0.3
const SHIP_DISTANCE = 6.2
const INTRO_DELAY = 5
const INTRO_DURATION = 4.5
const INTRO_START_Y = -4.6
const WANDER_INTERVAL = 5
const WANDER_LERP = 0.018
const BOB_X = 0.03
const BOB_Y = 0.05
const BOB_ROLL = 0.04
const WANDER_TARGETS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(-1.55, 0, 0),
  new THREE.Vector3(1.55, 0, 0),
  new THREE.Vector3(0, 1.2, 0),
  new THREE.Vector3(0, 0, 2.3),
] as const

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
  const sunColors = [
    new THREE.Color(0x5aa8ff),
    new THREE.Color(0xfff4e0),
    new THREE.Color(0xffc53d),
    new THREE.Color(0xff8c3a),
    new THREE.Color(0xff4d3a),
  ]

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * FIELD.x * 2
    positions[i3 + 1] = (Math.random() - 0.5) * FIELD.y * 2
    positions[i3 + 2] = (Math.random() - 0.5) * FIELD.z * 2

    const color = sunColors[i % sunColors.length].clone()
    color.offsetHSL(0, (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.08)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  const geometry = new THREE.BufferGeometry()
  const positionAttr = new THREE.BufferAttribute(positions, 3)
  const colorAttr = new THREE.BufferAttribute(colors, 3)
  geometry.setAttribute("position", positionAttr)
  geometry.setAttribute("color", colorAttr)

  const material = new THREE.PointsMaterial({
    size: 1.85,
    map: texture,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })

  scene.add(new THREE.Points(geometry, material))

  scene.add(new THREE.AmbientLight(0xb8c6d9, 0.7))
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.35)
  keyLight.position.set(2.4, 4.2, CAMERA_Z + 5)
  scene.add(keyLight)
  const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.65)
  rimLight.position.set(-3.2, 1.2, CAMERA_Z - 10)
  scene.add(rimLight)

  const ship = createShip(SHIP_SCALE)
  ship.group.visible = false
  camera.add(ship.group)

  const leftTrail = createDynamicTrail({
    length: 1.3,
    width: 0.1,
    opacity: 0.8,
  })
  const rightTrail = createDynamicTrail({
    length: 1.3,
    width: 0.1,
    opacity: 0.8,
  })
  leftTrail.mesh.visible = false
  rightTrail.mesh.visible = false
  ship.group.add(leftTrail.mesh, rightTrail.mesh)
  scene.add(camera)

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

  const clock = new THREE.Clock()
  const shipOffset = new THREE.Vector3(0, INTRO_START_Y, 0)
  const shipTarget = new THREE.Vector3()
  const leftNozzleCamera = new THREE.Vector3()
  const rightNozzleCamera = new THREE.Vector3()
  const trailWorld = new THREE.Vector3()
  const trailBack = new THREE.Vector3(0, -0.35, 1).normalize()
  const cameraToShip = (point: THREE.Vector3, out: THREE.Vector3) => {
    camera.localToWorld(trailWorld.copy(point))
    return ship.group.worldToLocal(out.copy(trailWorld))
  }
  let shipVisible = false
  let wanderReady = false
  let nextWanderAt = INTRO_DELAY + INTRO_DURATION + WANDER_INTERVAL
  let trailsSeeded = false

  const recycleStar = (index: number) => {
    const i3 = index * 3
    positions[i3] = (Math.random() - 0.5) * FIELD.x * 2
    positions[i3 + 1] = (Math.random() - 0.5) * FIELD.y * 2
    positions[i3 + 2] = Z_FAR - Math.random() * 24

    const color = sunColors[Math.floor(Math.random() * sunColors.length)].clone()
    color.offsetHSL(0, (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.08)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(), 0.05)
    const time = clock.elapsedTime

    if (!reducedMotion) {
      const targetX = -pointer.x * MAX_OFFSET_X
      const targetY = pointer.y * MAX_OFFSET_Y
      camera.position.x += (targetX - camera.position.x) * LERP
      camera.position.y += (targetY - camera.position.y) * LERP

      let recycled = false
      const step = STAR_SPEED * delta

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const zIndex = i * 3 + 2
        positions[zIndex] += step

        if (positions[zIndex] > Z_NEAR) {
          recycleStar(i)
          recycled = true
        }
      }

      positionAttr.needsUpdate = true
      if (recycled) {
        colorAttr.needsUpdate = true
      }
    }

    camera.lookAt(0, 0, 0)
    updateMainShip(time, delta)
    renderer.render(scene, camera)
  })

  function updateMainShip(time: number, delta: number) {
    if (reducedMotion) {
      return
    }

    if (time < INTRO_DELAY) {
      return
    }

    if (!shipVisible) {
      ship.group.visible = true
      leftTrail.mesh.visible = true
      rightTrail.mesh.visible = true
      shipVisible = true
    }

    if (time < INTRO_DELAY + INTRO_DURATION) {
      const introT = smoothstep((time - INTRO_DELAY) / INTRO_DURATION)
      shipOffset.set(0, INTRO_START_Y * (1 - introT), 0)
      shipTarget.copy(shipOffset)
    } else {
      if (!wanderReady) {
        shipTarget.set(0, 0, 0)
        wanderReady = true
      }

      if (time >= nextWanderAt) {
        shipTarget.copy(
          WANDER_TARGETS[Math.floor(Math.random() * WANDER_TARGETS.length)],
        )
        nextWanderAt = time + WANDER_INTERVAL
      }

      const lerp = 1 - Math.pow(1 - WANDER_LERP, delta * 60)
      shipOffset.lerp(shipTarget, lerp)
    }

    const bobX = Math.sin(time * 0.85) * BOB_X
    const bobY = Math.sin(time * 1.15) * BOB_Y
    const bobPitch = Math.sin(time * 1.15) * 0.03
    const bobRoll = Math.sin(time * 0.95) * BOB_ROLL

    ship.group.position.set(
      shipOffset.x + bobX,
      shipOffset.y + bobY,
      -(SHIP_DISTANCE + shipOffset.z),
    )
    ship.group.rotation.set(bobPitch, 0, -shipOffset.x * 0.18 + bobRoll)

    const pulse = 0.78 + Math.sin(time * 22) * 0.18
    const glowMat = ship.leftGlow.material as THREE.MeshBasicMaterial
    glowMat.opacity = pulse

    camera.updateMatrixWorld(true)
    ship.leftNozzle.getWorldPosition(leftNozzleCamera)
    ship.rightNozzle.getWorldPosition(rightNozzleCamera)
    camera.worldToLocal(leftNozzleCamera)
    camera.worldToLocal(rightNozzleCamera)

    if (!trailsSeeded) {
      seedTrail(leftTrail, leftNozzleCamera)
      seedTrail(rightTrail, rightNozzleCamera)
      trailsSeeded = true
    }

    updateTrail(leftTrail, ship.leftNozzle.position, trailBack, {
      pull: 1.35,
      follow: true,
      record: leftNozzleCamera,
      mapHistory: cameraToShip,
    })
    updateTrail(rightTrail, ship.rightNozzle.position, trailBack, {
      pull: 1.35,
      follow: true,
      record: rightNozzleCamera,
      mapHistory: cameraToShip,
    })
  }

  return () => {
    renderer.setAnimationLoop(null)
    window.removeEventListener("pointermove", onPointerMove)
    resizeObserver.disconnect()
    ship.dispose()
    leftTrail.dispose()
    rightTrail.dispose()
    geometry.dispose()
    material.dispose()
    texture.dispose()
    renderer.dispose()
  }
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
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
  gradient.addColorStop(0.18, "rgba(255,244,210,0.95)")
  gradient.addColorStop(0.42, "rgba(255,210,120,0.38)")
  gradient.addColorStop(1, "rgba(255,180,80,0)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}
