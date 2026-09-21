import * as THREE from "three"
import { createShip } from "~/lib/create-ship"
import {
  createDynamicTrail,
  seedTrail,
  updateTrail,
} from "~/lib/ship-trails"

const STAR_COUNT = 900
const STAR_SPEED = 11.2
const Z_NEAR = 8
const Z_FAR = -80
const SHIP_LERP = 0.09
const SHIP_RANGE_X = 1.7
const SHIP_RANGE_Y = 1.05
const trailBack = new THREE.Vector3()

export function mountShipLabScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  scene.fog = new THREE.FogExp2(0x000000, 0.018)

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200)
  camera.position.set(0, 1.05, 6.4)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 1)

  scene.add(new THREE.AmbientLight(0xb8c6d9, 0.7))
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.35)
  keyLight.position.set(2.4, 4.2, 5.2)
  scene.add(keyLight)
  const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.65)
  rimLight.position.set(-3.2, 1.2, -4)
  scene.add(rimLight)

  const ship = createShip(1)
  scene.add(ship.group)

  const leftTrail = createDynamicTrail()
  const rightTrail = createDynamicTrail()
  scene.add(leftTrail.mesh, rightTrail.mesh)

  const { points, positionAttr, recycleStar } = createStarField()
  scene.add(points)

  const pointer = { x: 0, y: 0 }
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches
  const clock = new THREE.Clock()
  const leftNozzleWorld = new THREE.Vector3()
  const rightNozzleWorld = new THREE.Vector3()
  let trailsSeeded = false

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
    const delta = Math.min(clock.getDelta(), 0.05)
    const time = clock.elapsedTime

    if (!reducedMotion) {
      const targetX = pointer.x * SHIP_RANGE_X
      const targetY = -pointer.y * SHIP_RANGE_Y + Math.sin(time * 1.15) * 0.05
      ship.group.position.x += (targetX - ship.group.position.x) * SHIP_LERP
      ship.group.position.y += (targetY - ship.group.position.y) * SHIP_LERP

      const driftX = targetX - ship.group.position.x
      const driftY = targetY - ship.group.position.y
      ship.group.rotation.z += (-driftX * 0.55 - ship.group.rotation.z) * 0.12
      ship.group.rotation.x += (driftY * 0.4 - ship.group.rotation.x) * 0.12

      const pulse = 0.78 + Math.sin(time * 22) * 0.18
      const glowMat = ship.leftGlow.material as THREE.MeshBasicMaterial
      glowMat.opacity = pulse

      ship.group.updateMatrixWorld(true)
      ship.leftNozzle.getWorldPosition(leftNozzleWorld)
      ship.rightNozzle.getWorldPosition(rightNozzleWorld)

      if (!trailsSeeded) {
        seedTrail(leftTrail, leftNozzleWorld)
        seedTrail(rightTrail, rightNozzleWorld)
        trailsSeeded = true
      }

      trailBack.set(0, 0, 1).transformDirection(ship.group.matrixWorld)
      updateTrail(leftTrail, leftNozzleWorld, trailBack)
      updateTrail(rightTrail, rightNozzleWorld, trailBack)

      const step = STAR_SPEED * delta
      const positions = positionAttr.array as Float32Array
      for (let i = 0; i < STAR_COUNT; i++) {
        const zIndex = i * 3 + 2
        positions[zIndex] += step
        if (positions[zIndex] > Z_NEAR) {
          recycleStar(i)
        }
      }
      positionAttr.needsUpdate = true
    }

    camera.position.set(
      ship.group.position.x * 0.22,
      1.05 + ship.group.position.y * 0.22,
      6.4,
    )
    camera.lookAt(ship.group.position.x, ship.group.position.y, 0.15)
    renderer.render(scene, camera)
  })

  return () => {
    renderer.setAnimationLoop(null)
    window.removeEventListener("pointermove", onPointerMove)
    resizeObserver.disconnect()
    ship.dispose()
    leftTrail.dispose()
    rightTrail.dispose()
    points.geometry.dispose()
    ;(points.material as THREE.Material).dispose()
    renderer.dispose()
  }
}

function createStarField() {
  const positions = new Float32Array(STAR_COUNT * 3)
  const colors = new Float32Array(STAR_COUNT * 3)
  const palette = [
    new THREE.Color(0x5aa8ff),
    new THREE.Color(0xfff4e0),
    new THREE.Color(0xffc53d),
    new THREE.Color(0xff8c3a),
    new THREE.Color(0xff4d3a),
  ]

  const placeStar = (index: number) => {
    const i3 = index * 3
    positions[i3] = (Math.random() - 0.5) * 90
    positions[i3 + 1] = (Math.random() - 0.5) * 50
    positions[i3 + 2] = Z_FAR + Math.random() * (Z_NEAR - Z_FAR)

    const color = palette[index % palette.length]
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  for (let i = 0; i < STAR_COUNT; i++) {
    placeStar(i)
  }

  const geometry = new THREE.BufferGeometry()
  const positionAttr = new THREE.BufferAttribute(positions, 3)
  geometry.setAttribute("position", positionAttr)
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    sizeAttenuation: true,
  })

  return {
    points: new THREE.Points(geometry, material),
    positionAttr,
    recycleStar: placeStar,
  }
}
