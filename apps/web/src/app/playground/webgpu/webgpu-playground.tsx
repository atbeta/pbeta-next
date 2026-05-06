'use client'

import { useRef, useEffect, useState } from 'react'

const COMPUTE_SHADER = `@group(0) @binding(0) var<storage, read_write> particles: array<vec4<f32>>;
@group(0) @binding(1) var<uniform> params: vec4<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let i = gid.x;
    if (i >= arrayLength(&particles)) { return; }
    var p = particles[i];
    let pos = p.xy;
    let vel = p.zw;

    let mouse = vec2<f32>(params.y, params.z);
    let center = vec2<f32>(0.0, 0.0);
    let toCenter = center - pos;
    let dCenter = length(toCenter) + 0.01;
    var force = toCenter / (dCenter * dCenter) * params.x;

    let toMouse = mouse - pos;
    let dMouse = length(toMouse) + 0.01;
    force += toMouse / (dMouse * dMouse) * params.w;

    var newVel = vel + force * 0.00005;
    let speed = length(newVel);
    if (speed > 0.015) { newVel = newVel / speed * 0.015; }

    var newPos = pos + newVel;

    if (newPos.x < -1.0 || newPos.x > 1.0) { newVel.x *= -0.5; newPos.x = clamp(newPos.x, -1.0, 1.0); }
    if (newPos.y < -1.0 || newPos.y > 1.0) { newVel.y *= -0.5; newPos.y = clamp(newPos.y, -1.0, 1.0); }

    newVel *= 0.999;

    particles[i] = vec4<f32>(newPos, newVel);
}
`

const VERTEX_SHADER = `
struct Out {
    @builtin(position) pos: vec4<f32>,
    @location(0) color: vec3<f32>,
    @location(1) @interpolate(flat) pointSize: f32,
}

@vertex
fn vs(@location(0) p: vec2<f32>, @location(1) v: vec2<f32>) -> Out {
    var out: Out;
    out.pos = vec4<f32>(p, 0.0, 1.0);
    let s = length(v) * 80.0 + 3.0;
    out.pointSize = s;
    let hue = atan2(v.y, v.x) / 6.283 + 0.5;
    out.color = vec3<f32>(0.5 + 0.5 * cos(hue * 6.283 + 0.0), 0.5 + 0.5 * cos(hue * 6.283 + 2.0), 0.5 + 0.5 * cos(hue * 6.283 + 4.0));
    return out;
}

@fragment
fn fs(@location(0) color: vec3<f32>) -> @location(0) vec4<f32> {
    return vec4<f32>(color * 1.5, 1.0);
}
`

const PARTICLE_COUNT = 4096

export function WebGPUPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [supported, setSupported] = useState(true)
  const [loading, setLoading] = useState(true)
  const [fps, setFps] = useState(0)
  const animRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5, down: false })
  const lastFps = useRef({ time: 0, frames: 0 })

  useEffect(() => {
    if (!navigator.gpu) { setSupported(false); setLoading(false); return }
    const canvas = canvasRef.current; if (!canvas) return

    async function init() {
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter) { setSupported(false); setLoading(false); return }
      const device = await adapter.requestDevice()
      const ctx = canvas!.getContext('webgpu')!
      const format = navigator.gpu.getPreferredCanvasFormat()
      ctx.configure({ device, format, alphaMode: 'premultiplied' })

      const particles = new Float32Array(PARTICLE_COUNT * 4)
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.sqrt(Math.random()) * 0.2
        particles[i * 4] = Math.cos(angle) * radius
        particles[i * 4 + 1] = Math.sin(angle) * radius
        particles[i * 4 + 2] = (Math.random() - 0.5) * 0.003
        particles[i * 4 + 3] = (Math.random() - 0.5) * 0.003
      }

      const buf = device.createBuffer({
        size: particles.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      })
      new Float32Array(buf.getMappedRange()).set(particles)
      buf.unmap()

      const paramBuf = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      const computeMod = device.createShaderModule({ code: COMPUTE_SHADER })
      const vertMod = device.createShaderModule({ code: VERTEX_SHADER })

      const bgLayout = device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
          { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
        ],
      })

      const pipeLayout = device.createPipelineLayout({ bindGroupLayouts: [bgLayout] })

      const computePipe = device.createComputePipeline({
        layout: pipeLayout,
        compute: { module: computeMod, entryPoint: 'main' },
      })

      const renderPipe = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [] }),
        vertex: { module: vertMod, entryPoint: 'vs', buffers: [{ arrayStride: 16, stepMode: 'vertex', attributes: [
          { shaderLocation: 0, offset: 0, format: 'float32x2' },
          { shaderLocation: 1, offset: 8, format: 'float32x2' },
        ]}] },
        fragment: { module: vertMod, entryPoint: 'fs', targets: [{ format, blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' } } }] },
        primitive: { topology: 'point-list' },
      })

      const bindGroup = device.createBindGroup({
        layout: bgLayout,
        entries: [
          { binding: 0, resource: { buffer: buf } },
          { binding: 1, resource: { buffer: paramBuf } },
        ],
      })

      const paramData = new Float32Array(4)
      setLoading(false)

      function render() {
        animRef.current = requestAnimationFrame(render)

        const mx = mouseRef.current.x * 2 - 1
        const my = (1 - mouseRef.current.y) * 2 - 1
        paramData[0] = 0.15
        paramData[1] = mx
        paramData[2] = my
        paramData[3] = mouseRef.current.down ? 15.0 : -0.5
        device.queue.writeBuffer(paramBuf, 0, paramData)

        const encoder = device.createCommandEncoder()

        const computePass = encoder.beginComputePass()
        computePass.setPipeline(computePipe)
        computePass.setBindGroup(0, bindGroup)
        computePass.dispatchWorkgroups(Math.ceil(PARTICLE_COUNT / 64))
        computePass.end()

        const tex = ctx.getCurrentTexture().createView()
        const renderPass = encoder.beginRenderPass({
          colorAttachments: [{
            view: tex,
            clearValue: { r: 0.02, g: 0.02, b: 0.06, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
          }],
        })
        renderPass.setPipeline(renderPipe)
        renderPass.setVertexBuffer(0, buf)
        renderPass.draw(PARTICLE_COUNT)
        renderPass.end()

        device.queue.submit([encoder.finish()])

        const now = performance.now()
        lastFps.current.frames++
        if (now - lastFps.current.time > 1000) {
          setFps(prev => Math.round((prev + lastFps.current.frames) / 2))
          lastFps.current = { time: now, frames: 0 }
        }
      }
      render()
    }

    init()
    return () => { cancelAnimationFrame(animRef.current) }
  }, [])

  const handleMouse = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return
    mouseRef.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height, down: e.buttons > 0 }
  }

  if (!supported) {
    return (
      <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center anim-fade-up delay-1">
        <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
          WebGPU not available. Try Chrome 113+, Edge 113+.
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4 anim-fade-up delay-1">
      {loading && (
        <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center">
          <span className="font-mono text-[11px] text-[var(--muted-foreground)]">Initializing WebGPU...</span>
        </div>
      )}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold">WebGPU Compute — {PARTICLE_COUNT.toLocaleString()} Particles</span>
          <span className="font-mono text-[9px] text-[var(--muted-foreground)]">~{fps}fps &middot; click + drag to attract</span>
        </div>
        <canvas ref={canvasRef} onMouseMove={handleMouse} onMouseDown={handleMouse} onMouseUp={handleMouse} onMouseLeave={function(e) { mouseRef.current = {...mouseRef.current, down: false}; handleMouse(e) }}
          className="w-full" style={{ height: 420, aspectRatio: '16/9' }} width={1280} height={720} />
      </div>
      <div className="p-3 border border-dashed border-[var(--border)] rounded-lg text-[10px] text-[var(--muted-foreground)] leading-relaxed">
        <span className="font-mono text-[var(--accent)]">Compute Shader (WGSL)</span> 在 GPU 上并行更新每个粒子的位置 &middot;
        <span className="font-mono text-[var(--accent)]">粒子大小随速度变化</span>（快→大，慢→小）&middot;
        <span className="font-mono text-[var(--accent)]">点击/拖动鼠标</span> 产生引力吸引粒子飞向你 &middot;
        速度限制 0.015 防止飞散。
      </div>
    </div>
  )
}
