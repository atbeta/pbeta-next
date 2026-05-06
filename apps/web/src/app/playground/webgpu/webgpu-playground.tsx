'use client'

import { useRef, useEffect, useState } from 'react'

const COMPUTE_SHADER = `@group(0) @binding(0) var<storage, read_write> particles: array<vec4<f32>>;
@group(0) @binding(1) var<uniform> params: vec4<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let i = gid.x;
    if (i >= arrayLength(&particles)) { return; }
    let p = particles[i];
    let pos = p.xy;
    let vel = p.zw;

    // gravity toward center + mouse attraction
    let center = vec2<f32>(0.0, 0.0);
    let to_center = center - pos;
    let dist = length(to_center) + 0.01;
    let force = to_center / (dist * dist) * params.x * 0.0001;

    // mouse position from params.yz
    let mouse = vec2<f32>(params.y * 2.0 - 1.0, (1.0 - params.z) * 2.0 - 1.0);
    let to_mouse = mouse - pos;
    let mdist = length(to_mouse) + 0.05;
    let mforce = to_mouse / (mdist * mdist) * params.w * 0.001;

    var new_vel = vel + force + mforce;
    // damping
    new_vel = new_vel * 0.995;
    var new_pos = pos + new_vel;

    // boundary bounce
    if (new_pos.x < -1.0 || new_pos.x > 1.0) { new_vel.x = -new_vel.x * 0.8; new_pos.x = clamp(new_pos.x, -1.0, 1.0); }
    if (new_pos.y < -1.0 || new_pos.y > 1.0) { new_vel.y = -new_vel.y * 0.8; new_pos.y = clamp(new_pos.y, -1.0, 1.0); }

    particles[i] = vec4<f32>(new_pos, new_vel);
}
`

const VERTEX_SHADER = `
struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) color: vec4<f32>,
}
@vertex
fn vs(@location(0) pos: vec2<f32>, @location(1) vel: vec2<f32>) -> VertexOutput {
    var out: VertexOutput;
    out.pos = vec4<f32>(pos, 0.0, 1.0);
    let speed = length(vel);
    out.color = vec4<f32>(0.3 + speed * 50.0 * 0.7, 0.5, 1.0 - speed * 0.5, 1.0);
    return out;
}
@fragment
fn fs(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
    return color;
}
`

const PARTICLE_COUNT = 8192
const WORKGROUP_SIZE = 64

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
        const radius = Math.sqrt(Math.random()) * 0.3
        particles[i * 4] = Math.cos(angle) * radius
        particles[i * 4 + 1] = Math.sin(angle) * radius
        particles[i * 4 + 2] = (Math.random() - 0.5) * 0.005
        particles[i * 4 + 3] = (Math.random() - 0.5) * 0.005
      }

      const particleBuf = device.createBuffer({
        size: particles.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      })
      new Float32Array(particleBuf.getMappedRange()).set(particles)
      particleBuf.unmap()

      const paramBuf = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      const computeModule = device.createShaderModule({ code: COMPUTE_SHADER })
      const vertexModule = device.createShaderModule({ code: VERTEX_SHADER })

      const bindGroupLayout = device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
          { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
        ],
      })

      const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] })

      const computePipeline = device.createComputePipeline({
        layout: pipelineLayout,
        compute: { module: computeModule, entryPoint: 'main' },
      })

      const renderPipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module: vertexModule, entryPoint: 'vs', buffers: [{ arrayStride: 16, attributes: [
          { shaderLocation: 0, offset: 0, format: 'float32x2' },
          { shaderLocation: 1, offset: 8, format: 'float32x2' },
        ]}] },
        fragment: { module: vertexModule, entryPoint: 'fs', targets: [{ format }] },
        primitive: { topology: 'point-list' },
      })

      const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
          { binding: 0, resource: { buffer: particleBuf } },
          { binding: 1, resource: { buffer: paramBuf } },
        ],
      })

      const paramData = new Float32Array(4)
      setLoading(false)

      function render() {
        animRef.current = requestAnimationFrame(render)

        paramData[0] = 0.5  // gravity strength
        paramData[1] = mouseRef.current.x
        paramData[2] = mouseRef.current.y
        paramData[3] = mouseRef.current.down ? 2.0 : -0.5  // mouse force
        device.queue.writeBuffer(paramBuf, 0, paramData)

        const encoder = device.createCommandEncoder()
        const computePass = encoder.beginComputePass()
        computePass.setPipeline(computePipeline)
        computePass.setBindGroup(0, bindGroup)
        computePass.dispatchWorkgroups(Math.ceil(PARTICLE_COUNT / WORKGROUP_SIZE))
        computePass.end()

        const textureView = ctx.getCurrentTexture().createView()
        const renderPass = encoder.beginRenderPass({
          colorAttachments: [{ view: textureView, clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1 }, loadOp: 'clear', storeOp: 'store' }],
        })
        renderPass.setPipeline(renderPipeline)
        renderPass.setVertexBuffer(0, particleBuf)
        renderPass.draw(PARTICLE_COUNT)
        renderPass.end()

        device.queue.submit([encoder.finish()])

        const now = performance.now()
        lastFps.current.frames++
        if (now - lastFps.current.time > 1000) {
          setFps(lastFps.current.frames)
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
          WebGPU not available in this browser. Try Chrome 113+, Edge 113+, or enable <code>chrome://flags/#enable-unsafe-webgpu</code>.
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
          <span className="font-mono text-[9px] text-[var(--muted-foreground)]">{fps} fps &middot; click to attract</span>
        </div>
        <canvas ref={canvasRef} onMouseMove={handleMouse} onMouseDown={handleMouse} onMouseUp={handleMouse}
          className="w-full aspect-video cursor-crosshair" width={1024} height={576} />
      </div>
      <div className="p-3 border border-dashed border-[var(--border)] rounded-lg text-[10px] text-[var(--muted-foreground)] leading-relaxed">
        <span className="font-mono text-[var(--accent)]">Compute Shader</span> 在 GPU 上并行更新 {PARTICLE_COUNT.toLocaleString()} 个粒子的位置和速度（每个粒子独立计算）&middot;
        <span className="font-mono text-[var(--accent)]">点击/拖动</span> 产生引力吸引粒子 &middot;
        <span className="font-mono text-[var(--accent)]">WGSL</span> 是 WebGPU 的着色语言，语法接近 Rust。
      </div>
    </div>
  )
}
