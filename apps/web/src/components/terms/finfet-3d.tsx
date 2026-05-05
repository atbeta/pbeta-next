'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export function FinFET3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const w = container.clientWidth
    const h = 380

    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(35, w / h, 1, 100)
    camera.position.set(8.4, 5.1, 10)
    camera.lookAt(0, 1, 0)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controls.minDistance = 4
    controls.maxDistance = 18
    controls.maxPolarAngle = Math.PI * 0.7
    controls.update()

    scene.add(new THREE.AmbientLight(0x556070, 1.05))
    const key = new THREE.DirectionalLight(0xffffff, 2.5)
    key.position.set(8, 12, 8)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0x7090ff, 0.5)
    fill.position.set(-4, 4, -4)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffaa70, 0.3)
    rim.position.set(0, 2, -8)
    scene.add(rim)

    const addEdges = (mesh: THREE.Mesh, opacity = 0.22) => {
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity }),
      )
      edges.position.copy(mesh.position)
      edges.rotation.copy(mesh.rotation)
      scene.add(edges)
      return edges
    }

    const subMat = new THREE.MeshStandardMaterial({ color: 0x6e7688, roughness: 0.72, metalness: 0.04 })
    const sub = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.65, 5.7), subMat)
    sub.position.y = -0.33
    scene.add(sub)
    addEdges(sub, 0.16)

    const stiMat = new THREE.MeshStandardMaterial({ color: 0xc6dff1, roughness: 0.62, metalness: 0.02 })
    const stiLeft = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.62, 4.65), stiMat)
    stiLeft.position.set(-1.78, 0.32, 0)
    scene.add(stiLeft)
    addEdges(stiLeft, 0.22)

    const stiRight = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.62, 4.65), stiMat)
    stiRight.position.set(1.78, 0.32, 0)
    scene.add(stiRight)
    addEdges(stiRight, 0.22)

    const finLen = 4.35
    const finW = 0.22
    const finH = 1.9
    const finBaseY = 0.28
    const finY = finBaseY + finH / 2

    const finMat = new THREE.MeshStandardMaterial({ color: 0x8c98aa, roughness: 0.34, metalness: 0.12 })
    const fin = new THREE.Mesh(new THREE.BoxGeometry(finW, finH, finLen), finMat)
    fin.position.set(0, finY, 0)
    scene.add(fin)
    addEdges(fin, 0.32)

    const sdH = 1.25
    const sdW = 0.62
    const sdD = 0.72
    const sdY = finBaseY + sdH / 2
    const sdMat = new THREE.MeshStandardMaterial({ color: 0x77aacc, roughness: 0.36, metalness: 0.1 })

    const sdSrc = new THREE.Mesh(new THREE.BoxGeometry(sdW, sdH, sdD), sdMat)
    sdSrc.position.set(0, sdY, -finLen / 2 - sdD / 2 + 0.08)
    scene.add(sdSrc)
    addEdges(sdSrc, 0.26)

    const sdDrn = new THREE.Mesh(new THREE.BoxGeometry(sdW, sdH, sdD), sdMat)
    sdDrn.position.set(0, sdY, finLen / 2 + sdD / 2 - 0.08)
    scene.add(sdDrn)
    addEdges(sdDrn, 0.26)

    const gateLen = 0.82
    const gateSpan = 4.85
    const gateH = finH + 0.42
    const gateCY = finBaseY + gateH / 2

    const gateMat = new THREE.MeshStandardMaterial({
      color: 0x9fbe45,
      roughness: 0.28,
      metalness: 0.28,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
      side: THREE.DoubleSide,
    })

    const gateBody = new THREE.Mesh(new THREE.BoxGeometry(gateSpan, gateH, gateLen), gateMat)
    gateBody.position.set(0, gateCY, 0)
    gateBody.renderOrder = 1
    scene.add(gateBody)
    addEdges(gateBody, 0.35)

    const gateOXMat = new THREE.MeshStandardMaterial({
      color: 0xff8a45,
      roughness: 0.42,
      metalness: 0.02,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    })
    const oxThick = 0.055
    const oxTop = new THREE.Mesh(new THREE.BoxGeometry(finW + oxThick * 2, oxThick, gateLen + 0.04), gateOXMat)
    oxTop.position.set(0, finBaseY + finH + oxThick / 2, 0)
    scene.add(oxTop)
    addEdges(oxTop, 0.2)

    const oxL = new THREE.Mesh(new THREE.BoxGeometry(oxThick, finH, gateLen + 0.04), gateOXMat)
    oxL.position.set(-finW / 2 - oxThick / 2, finY, 0)
    scene.add(oxL)

    const oxR = new THREE.Mesh(new THREE.BoxGeometry(oxThick, finH, gateLen + 0.04), gateOXMat)
    oxR.position.set(finW / 2 + oxThick / 2, finY, 0)
    scene.add(oxR)

    const spacerMat = new THREE.MeshStandardMaterial({
      color: 0x666b78,
      roughness: 0.46,
      metalness: 0.08,
      transparent: true,
      opacity: 0.86,
    })
    const spacerLen = 0.16
    for (const zOff of [-gateLen / 2 - spacerLen / 2, gateLen / 2 + spacerLen / 2]) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(gateSpan, gateH + 0.04, spacerLen), spacerMat)
      sp.position.set(0, gateCY, zOff)
      scene.add(sp)
      addEdges(sp, 0.18)
    }

    const channelMat = new THREE.MeshStandardMaterial({
      color: 0x273241,
      emissive: 0x172436,
      emissiveIntensity: 0.26,
      roughness: 0.3,
      transparent: true,
      opacity: 0.72,
    })
    const channel = new THREE.Mesh(new THREE.BoxGeometry(finW + 0.03, finH + 0.03, gateLen + 0.05), channelMat)
    channel.position.set(0, finY, 0)
    channel.renderOrder = 2
    scene.add(channel)
    addEdges(channel, 0.26)

    const grid = new THREE.GridHelper(10, 20, 0x333344, 0x222233)
    grid.position.y = -0.3
    scene.add(grid)

    const arrowMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.48 })
    const arrowHeadMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.48 })
    const arrowY = finBaseY + finH + 0.74
    const halfFD = finLen / 2 + sdD * 0.62
    const arrowPts = new Float32Array([
      -halfFD, arrowY, 0, halfFD, arrowY, 0,
    ])
    const arrowGeo = new THREE.BufferGeometry()
    arrowGeo.setAttribute('position', new THREE.BufferAttribute(arrowPts, 3))
    const arrowLine = new THREE.Line(arrowGeo, arrowMat)
    scene.add(arrowLine)

    const arrowHeadSize = 0.12
    const arrowHeadGeo = new THREE.ConeGeometry(arrowHeadSize, arrowHeadSize * 3, 8)
    const arrowHeadL = new THREE.Mesh(arrowHeadGeo, arrowHeadMat)
    arrowHeadL.position.set(-halfFD, arrowY, 0)
    arrowHeadL.rotation.z = -Math.PI / 2
    scene.add(arrowHeadL)
    const arrowHeadR = new THREE.Mesh(arrowHeadGeo, arrowHeadMat)
    arrowHeadR.position.set(halfFD, arrowY, 0)
    arrowHeadR.rotation.z = Math.PI / 2
    scene.add(arrowHeadR)

    const labels: { text: string; x: number; y: number; z: number; scale?: number }[] = [
      { text: 'Gate', x: -1.95, y: finBaseY + finH + 0.38, z: -0.08, scale: 2.3 },
      { text: 'Fin (Si)', x: 0.06, y: finBaseY + finH + 0.72, z: 1.28, scale: 2.55 },
      { text: 'Source', x: 0, y: sdY + sdH / 2 + 0.35, z: -finLen / 2 - sdD / 2 + 0.08, scale: 2.4 },
      { text: 'Drain', x: 0, y: sdY + sdH / 2 + 0.35, z: finLen / 2 + sdD / 2 - 0.08, scale: 2.4 },
      { text: 'Oxide / STI', x: -2.15, y: 0.83, z: 1.9, scale: 2.5 },
      { text: 'Substrate', x: 1.55, y: 0.02, z: 2.05, scale: 2.25 },
    ]

    for (const l of labels) {
      const c2 = document.createElement('canvas')
      c2.width = 256; c2.height = 64
      const ctx2 = c2.getContext('2d')!
      ctx2.font = 'bold 22px monospace'
      ctx2.fillStyle = '#fafafa'
      ctx2.textAlign = 'center'
      ctx2.textBaseline = 'middle'
      ctx2.fillText(l.text, 128, 32)
      const tex = new THREE.CanvasTexture(c2)
      tex.minFilter = THREE.LinearFilter
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, opacity: 0.85 }))
      s.position.set(l.x, l.y, l.z)
      s.scale.set(l.scale ?? 3, 0.75, 1)
      scene.add(s)
    }

    let animId: number
    function animate() {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const rw = container.clientWidth
      camera.aspect = rw / h
      camera.updateProjectionMatrix()
      renderer.setSize(rw, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      controls.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
      container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold">FinFET 3D 结构</span>
          <span className="font-mono text-[9px] text-[var(--muted-foreground)]">
            拖拽旋转 &middot; 半透明栅极可透视鳍片
          </span>
        </div>
        <div ref={containerRef} className="w-full" style={{ height: 380 }} />
      </div>

      <div className="grid gap-2 sm:grid-cols-5 text-[10px] font-mono">
        {[
          { color: '#8c98aa', label: 'Fin 硅鳍' },
          { color: '#ff8a45', label: 'Gate Oxide' },
          { color: '#9fbe45', label: 'Gate 栅极 (透明)' },
          { color: '#666b78', label: 'Spacer' },
          { color: '#77aacc', label: 'Source / Drain' },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: m.color }} />
            <span className="text-[var(--muted-foreground)]">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="p-3 border border-dashed border-[var(--border)] rounded-lg">
        <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
          一条连续窄硅鳍从 Source 延伸至 Drain &middot;
          <span className="font-mono" style={{ color: '#9fbe45' }}>绿色半透明</span> = 栅极横向跨过鳍片，并控制顶部和两侧壁 (Tri-Gate) &middot;
          旋转视角观察鳍如何穿过栅极下方。
        </p>
      </div>
    </div>
  )
}
