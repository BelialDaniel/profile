import * as THREE from "three"

export type ShipModel = {
  group: THREE.Group
  leftNozzle: THREE.Object3D
  rightNozzle: THREE.Object3D
  leftGlow: THREE.Mesh
  rightGlow: THREE.Mesh
  dispose: () => void
}

export function createShip(): ShipModel {
  const group = new THREE.Group()
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf4f6f8,
    metalness: 0.18,
    roughness: 0.42,
  })
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x0b0f16,
    metalness: 0.82,
    roughness: 0.28,
  })
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x7a808a,
    metalness: 0.28,
    roughness: 0.5,
  })
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x9be7ff,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  })
  materials.push(bodyMat, engineMat, cabinMat, glowMat)

  const hullHeight = 0.34 * 0.85
  const hullGeo = new THREE.BoxGeometry(0.58, hullHeight, 1.7)
  geometries.push(hullGeo)
  group.add(new THREE.Mesh(hullGeo, bodyMat))

  const cabinLength = 0.72
  const cabinHeight = 0.2
  const cabinWidth = 0.4
  const cabinShape = new THREE.Shape()
  cabinShape.moveTo(0, 0)
  cabinShape.lineTo(cabinLength, 0)
  cabinShape.lineTo(0, cabinHeight)
  cabinShape.closePath()

  const cabinGeo = new THREE.ExtrudeGeometry(cabinShape, {
    depth: cabinWidth,
    bevelEnabled: false,
  })
  cabinGeo.translate(0, 0, -cabinWidth / 2)
  cabinGeo.rotateY(Math.PI / 2)
  geometries.push(cabinGeo)

  const cabin = new THREE.Mesh(cabinGeo, cabinMat)
  cabin.position.set(0, hullHeight / 2, 0.48)
  group.add(cabin)

  const wingGeo = new THREE.BoxGeometry(1.7, 0.075, 0.7)
  geometries.push(wingGeo)
  const wings = new THREE.Mesh(wingGeo, bodyMat)
  wings.position.set(0, -0.04, 0.12)
  group.add(wings)

  const thrusterGeo = new THREE.BoxGeometry(0.22, 0.22, 0.4)
  geometries.push(thrusterGeo)

  const leftThruster = new THREE.Mesh(thrusterGeo, engineMat)
  leftThruster.position.set(-0.4, -0.01, 0.48)
  const rightThruster = new THREE.Mesh(thrusterGeo, engineMat)
  rightThruster.position.set(0.4, -0.01, 0.48)
  group.add(leftThruster, rightThruster)

  const nozzleGeo = new THREE.CircleGeometry(0.08, 20)
  geometries.push(nozzleGeo)

  const leftGlow = new THREE.Mesh(nozzleGeo, glowMat)
  leftGlow.position.set(-0.4, -0.01, 0.69)
  const rightGlow = new THREE.Mesh(nozzleGeo, glowMat)
  rightGlow.position.set(0.4, -0.01, 0.69)
  group.add(leftGlow, rightGlow)

  const leftNozzle = new THREE.Object3D()
  leftNozzle.position.set(-0.4, -0.01, 0.74)
  const rightNozzle = new THREE.Object3D()
  rightNozzle.position.set(0.4, -0.01, 0.74)
  group.add(leftNozzle, rightNozzle)

  return {
    group,
    leftNozzle,
    rightNozzle,
    leftGlow,
    rightGlow,
    dispose() {
      for (const geometry of geometries) {
        geometry.dispose()
      }
      for (const material of materials) {
        material.dispose()
      }
    },
  }
}
