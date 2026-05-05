'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export function GAA3D() {
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

    const camera = new THREE.PerspectiveCamera(34, w / h, 1, 100)
    camera.position.set(8.8, 5.2, 10.2)
    camera.lookAt(0, 1.25, 0)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1.25, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controls.minDistance = 5
    controls.maxDistance = 22
    controls.maxPolarAngle = Math.PI * 0.7
    controls.update()

    scene.add(new THREE.AmbientLight(0x404060, 1.2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
    keyLight.position.set(10, 14, 10)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0x6080ff, 0.6)
    fillLight.position.set(-6, 4, -3)
    scene.add(fillLight)
    const rimLight = new THREE.DirectionalLight(0xff9060, 0.3)
    rimLight.position.set(0, 1, -9)
    scene.add(rimLight)

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

    const subMat = new THREE.MeshStandardMaterial({ color: 0x596070, roughness: 0.72, metalness: 0.04 })
    const substrate = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.48, 6.2), subMat)
    substrate.position.y = -0.24
    scene.add(substrate)
    addEdges(substrate, 0.14)

    const baseMat = new THREE.MeshStandardMaterial({ color: 0xc5d9e7, roughness: 0.68, metalness: 0.02 })
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.28, 5.2), baseMat)
    base.position.y = 0.14
    scene.add(base)
    addEdges(base, 0.18)

    const sheetCount = 3
    const sheetW = 1.75
    const sheetT = 0.12
    const sheetD = 4.2
    const sheetGap = 0.43
    const sheetY0 = 0.62
    const sheetMat = new THREE.MeshStandardMaterial({ color: 0x66a9e6, roughness: 0.26, metalness: 0.12 })

    for (let i = 0; i < sheetCount; i++) {
      const sy = sheetY0 + i * (sheetT + sheetGap)
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(sheetW, sheetT, sheetD), sheetMat)
      sheet.position.set(0, sy, 0)
      scene.add(sheet)
      addEdges(sheet, 0.26)
    }

    const gateLen = 1.05
    const oxThick = 0.055
    const gateThick = 0.13
    const gateOXMat = new THREE.MeshStandardMaterial({
      color: 0xff8a45,
      roughness: 0.42,
      metalness: 0.02,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
    })
    const gateMat = new THREE.MeshStandardMaterial({
      color: 0xd9b13d,
      roughness: 0.28,
      metalness: 0.55,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      side: THREE.DoubleSide,
    })

    for (let i = 0; i < sheetCount; i++) {
      const sy = sheetY0 + i * (sheetT + sheetGap)
      const oxTop = new THREE.Mesh(new THREE.BoxGeometry(sheetW + oxThick * 2, oxThick, gateLen), gateOXMat)
      oxTop.position.set(0, sy + sheetT / 2 + oxThick / 2, 0)
      scene.add(oxTop)

      const oxBottom = new THREE.Mesh(new THREE.BoxGeometry(sheetW + oxThick * 2, oxThick, gateLen), gateOXMat)
      oxBottom.position.set(0, sy - sheetT / 2 - oxThick / 2, 0)
      scene.add(oxBottom)

      const oxLeft = new THREE.Mesh(new THREE.BoxGeometry(oxThick, sheetT + oxThick * 2, gateLen), gateOXMat)
      oxLeft.position.set(-sheetW / 2 - oxThick / 2, sy, 0)
      scene.add(oxLeft)

      const oxRight = new THREE.Mesh(new THREE.BoxGeometry(oxThick, sheetT + oxThick * 2, gateLen), gateOXMat)
      oxRight.position.set(sheetW / 2 + oxThick / 2, sy, 0)
      scene.add(oxRight)

      const gateTop = new THREE.Mesh(new THREE.BoxGeometry(sheetW + oxThick * 2 + gateThick * 2, gateThick, gateLen), gateMat)
      gateTop.position.set(0, sy + sheetT / 2 + oxThick + gateThick / 2, 0)
      gateTop.renderOrder = 1
      scene.add(gateTop)
      addEdges(gateTop, 0.22)

      const gateBottom = new THREE.Mesh(new THREE.BoxGeometry(sheetW + oxThick * 2 + gateThick * 2, gateThick, gateLen), gateMat)
      gateBottom.position.set(0, sy - sheetT / 2 - oxThick - gateThick / 2, 0)
      gateBottom.renderOrder = 1
      scene.add(gateBottom)
      addEdges(gateBottom, 0.22)

      const gateLeft = new THREE.Mesh(new THREE.BoxGeometry(gateThick, sheetT + oxThick * 2, gateLen), gateMat)
      gateLeft.position.set(-sheetW / 2 - oxThick - gateThick / 2, sy, 0)
      gateLeft.renderOrder = 1
      scene.add(gateLeft)
      addEdges(gateLeft, 0.2)

      const gateRight = new THREE.Mesh(new THREE.BoxGeometry(gateThick, sheetT + oxThick * 2, gateLen), gateMat)
      gateRight.position.set(sheetW / 2 + oxThick + gateThick / 2, sy, 0)
      gateRight.renderOrder = 1
      scene.add(gateRight)
      addEdges(gateRight, 0.2)
    }

    const gateH = (sheetCount - 1) * (sheetT + sheetGap) + sheetT + 0.62
    const gateCY = sheetY0 + ((sheetCount - 1) * (sheetT + sheetGap)) / 2
    const gateShellMat = new THREE.MeshStandardMaterial({
      color: 0xd9b13d,
      roughness: 0.34,
      metalness: 0.5,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const gateWindow = new THREE.Mesh(new THREE.BoxGeometry(sheetW + 0.62, gateH, gateLen), gateShellMat)
    gateWindow.position.set(0, gateCY, 0)
    gateWindow.renderOrder = 0
    scene.add(gateWindow)
    addEdges(gateWindow, 0.3)

    const innerSpacerMat = new THREE.MeshStandardMaterial({ color: 0x676d7b, roughness: 0.44, metalness: 0.08 })
    const spacerLen = 0.15
    for (const zOff of [-gateLen / 2 - spacerLen / 2, gateLen / 2 + spacerLen / 2]) {
      const spH = gateH
      const spW = sheetW + 0.62
      const spacer = new THREE.Mesh(new THREE.BoxGeometry(spW, spH, spacerLen), innerSpacerMat)
      spacer.position.set(0, gateCY, zOff)
      scene.add(spacer)
      addEdges(spacer, 0.18)
    }

    const sdMat = new THREE.MeshStandardMaterial({
      color: 0x88aacc,
      roughness: 0.3,
      metalness: 0.15,
      transparent: true,
      opacity: 0.76,
      depthWrite: false,
    })
    const sdH = gateH + 0.18
    const sdW = sheetW + 0.42
    const source = new THREE.Mesh(new THREE.BoxGeometry(sdW, sdH, 0.64), sdMat)
    source.position.set(0, gateCY, -sheetD / 2 - 0.32)
    source.renderOrder = 1
    scene.add(source)
    addEdges(source, 0.24)

    const drain = new THREE.Mesh(new THREE.BoxGeometry(sdW, sdH, 0.64), sdMat)
    drain.position.set(0, gateCY, sheetD / 2 + 0.32)
    drain.renderOrder = 1
    scene.add(drain)
    addEdges(drain, 0.24)

    const contactMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.85 })
    const topY = gateCY + gateH / 2
    const contact = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.8, 16), contactMat)
    contact.position.set(0, topY + 0.5, 0)
    scene.add(contact)
    const contactPad = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.7), contactMat)
    contactPad.position.set(0, topY + 0.9, 0)
    scene.add(contactPad)

    const grid = new THREE.GridHelper(10, 20, 0x333344, 0x222233)
    grid.position.y = -0.3
    scene.add(grid)

    const labels: { text: string; x: number; y: number; z: number; scale?: number }[] = [
      { text: 'Nanosheets', x: -1.95, y: sheetY0 + sheetT + 0.16, z: 0.35, scale: 2.5 },
      { text: 'All-around gate', x: 2.08, y: gateCY + 0.42, z: -0.2, scale: 3.05 },
      { text: 'Source', x: 0.7, y: gateCY + sdH / 2 + 0.18, z: -sheetD / 2 - 0.38, scale: 2.25 },
      { text: 'Drain', x: -0.7, y: gateCY + sdH / 2 + 0.18, z: sheetD / 2 + 0.38, scale: 2.25 },
      { text: 'Contact', x: 0, y: topY + 1.3, z: 0, scale: 2.35 },
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
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, opacity: 0.9 }))
      s.position.set(l.x, l.y, l.z)
      s.scale.set(l.scale ?? 3.5, 0.82, 1)
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
          <span className="font-mono text-[11px] font-semibold">GAA 3D 结构 — 纳米片堆叠</span>
          <span className="font-mono text-[9px] text-[var(--muted-foreground)]">
            拖拽旋转 &middot; 滚轮缩放 &middot; 观察四面环绕栅极
          </span>
        </div>
        <div ref={containerRef} className="w-full" style={{ height: 380 }} />
      </div>

      <div className="grid gap-2 sm:grid-cols-5 text-[10px] font-mono">
        {[
          { color: '#66a9e6', label: '纳米片 (Si)' },
          { color: '#ff8a45', label: '栅氧 (High-k)' },
          { color: '#d9b13d', label: '全环绕栅极' },
          { color: '#676d7b', label: '内隔离层' },
          { color: '#88aacc', label: '源/漏 (Si)' },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: m.color }} />
            <span className="text-[var(--muted-foreground)]">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="p-3 border border-dashed border-[var(--border)] rounded-lg">
        <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
          <span className="font-mono text-[var(--accent)]">蓝色</span> = 3 层水平硅纳米片 &middot;
          <span className="font-mono" style={{ color: '#d9b13d' }}>金色</span> = 每一片在 gate 区域都有上下左右四段栅极 &middot;
          <span className="font-mono" style={{ color: '#ff8a45' }}>橙色半透明</span> = High-k 栅氧包覆片面 &middot;
          Source / Drain 连接所有纳米片层。
        </p>
      </div>
    </div>
  )
}
