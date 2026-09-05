<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'

const canvas = ref<HTMLCanvasElement | null>(null)
const sceneReady = ref(false)
const PIXEL_LOGO_URL = 'https://assets.mcyzw.top/images/logo.png'

let renderer: THREE.WebGLRenderer | null = null
let animationFrame = 0
let resizeObserver: ResizeObserver | null = null
let cleanupPointer: (() => void) | null = null
let disposeScene: (() => void) | null = null
let disposed = false

onMounted(async () => {
  try {
    if (!canvas.value) return

    const host = canvas.value.parentElement
    if (!host) return

    const logo = new Image()
    // Canvas 读取跨域图片像素前必须启用匿名 CORS。
    logo.crossOrigin = 'anonymous'
    logo.src = PIXEL_LOGO_URL
    await logo.decode()
    if (disposed) return

  const source = document.createElement('canvas')
  source.width = logo.naturalWidth
  source.height = logo.naturalHeight
  const context = source.getContext('2d', { willReadFrequently: true })
  if (!context) return
  context.drawImage(logo, 0, 0)

  const { data } = context.getImageData(0, 0, source.width, source.height)
  const pixels: Array<{ x: number; y: number; color: THREE.Color }> = []
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const index = (y * source.width + x) * 4
      const alpha = data[index + 3] / 255
      if (alpha < 0.08) continue
      pixels.push({
        x,
        y,
        color: new THREE.Color().setRGB(
          data[index] / 255,
          data[index + 1] / 255,
          data[index + 2] / 255,
          THREE.SRGBColorSpace,
        ),
      })
    }
  }

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0.2, 22.5)

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const logoGroup = new THREE.Group()
  logoGroup.rotation.set(-0.06, -0.12, 0)
  const pixelSize = 0.65
  const spacing = 0.74
  const offsetX = (source.width - 1) / 2
  const offsetY = (source.height - 1) / 2
  const cube = new THREE.BoxGeometry(pixelSize, pixelSize, pixelSize)
  const createFaceMaterial = (tint: number) => new THREE.MeshBasicMaterial({
    color: tint,
    toneMapped: false,
  })
  const materials = [
    createFaceMaterial(0xc8c8c8),
    createFaceMaterial(0x929292),
    createFaceMaterial(0xf0f0f0),
    createFaceMaterial(0x858585),
    createFaceMaterial(0xffffff),
    createFaceMaterial(0x777777),
  ]
  const blocks = new THREE.InstancedMesh(cube, materials, pixels.length)
  const transform = new THREE.Object3D()

  pixels.forEach((pixel, index) => {
    transform.position.set((pixel.x - offsetX) * spacing, (offsetY - pixel.y) * spacing, 0)
    transform.rotation.set(0, 0, 0)
    transform.updateMatrix()
    blocks.setMatrixAt(index, transform.matrix)
    blocks.setColorAt(index, pixel.color)
  })
  blocks.instanceMatrix.needsUpdate = true
  if (blocks.instanceColor) blocks.instanceColor.needsUpdate = true
  logoGroup.add(blocks)

  scene.add(logoGroup)

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const pointer = { x: 0, y: 0 }
  const onPointerMove = (event: PointerEvent) => {
    const bounds = host.getBoundingClientRect()
    pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
    pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
  }
  host.addEventListener('pointermove', onPointerMove, { passive: true })
  cleanupPointer = () => host.removeEventListener('pointermove', onPointerMove)

  const resize = () => {
    if (!renderer) return
    const width = Math.max(host.clientWidth, 1)
    const height = Math.max(host.clientHeight, 1)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    const mobileScale = THREE.MathUtils.clamp(camera.aspect * 0.95, 0.5, 0.72)
    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches
    logoGroup.scale.setScalar(isMobileViewport ? mobileScale : 1)
  }
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  resize()

  const clock = new THREE.Clock()
    disposeScene = () => {
    cube.dispose()
    materials.forEach(material => material.dispose())
    }

    const render = () => {
      const elapsed = clock.getElapsedTime()
      if (!prefersReducedMotion) {
        logoGroup.rotation.y += (-0.12 + pointer.x * 0.18 - logoGroup.rotation.y) * 0.045
        logoGroup.rotation.x += (-0.06 - pointer.y * 0.1 - logoGroup.rotation.x) * 0.045
        logoGroup.position.y = Math.sin(elapsed * 0.75) * 0.14
        logoGroup.rotation.z = Math.sin(elapsed * 0.45) * 0.018
      }
      renderer?.render(scene, camera)
      sceneReady.value = true
      animationFrame = window.requestAnimationFrame(render)
    }
    render()
  } catch (error) {
    console.warn('Unable to initialize the 3D pixel logo.', error)
  }
})

onBeforeUnmount(() => {
  disposed = true
  window.cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  cleanupPointer?.()
  disposeScene?.()
  renderer?.dispose()
  renderer = null
})
</script>

<template>
  <div class="pixel-logo-scene" aria-label="悠哉世界像素 Logo 3D 展示">
    <img
      :src="PIXEL_LOGO_URL"
      crossorigin="anonymous"
      alt=""
      class="pixel-logo-fallback"
      :class="{ 'is-hidden': sceneReady }"
    >
    <canvas ref="canvas" class="pixel-logo-canvas" />
  </div>
</template>
