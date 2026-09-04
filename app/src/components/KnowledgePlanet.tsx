import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import gsap from 'gsap'
import { NODES, EDGES, CATEGORIES, CATEGORY_MAP } from '@/data/nodes'
import type { KnowledgeNode } from '@/data/nodes'

// ──────────────────────────────────────────────────────────────
// 类型与共享滚动状态
// ──────────────────────────────────────────────────────────────

export interface PlanetScrollState {
  /** Section 2 pin 进度 0-1 */
  progress: number
  /** fresnel 辉光强度倍数 1 → 1.6 */
  fresnel: number
  /** 连线透明度增量 0 → 0.55 */
  edgeBoost: number
  /** 退场不透明度 1 → 0 */
  exitOpacity: number
  /** 星球实时自转角（供 HUD 读数） */
  rotationY: number
}

export function createPlanetScrollState(): PlanetScrollState {
  return { progress: 0, fresnel: 1, edgeBoost: 0, exitOpacity: 1, rotationY: 0 }
}

export interface KnowledgePlanetHandle {
  focusNode: (id: string) => void
  resetCamera: () => void
}

interface KnowledgePlanetProps {
  onSelectNode: (node: KnowledgeNode) => void
  selectedId?: string | null
  scrollState?: MutableRefObject<PlanetScrollState>
  reducedMotion?: boolean
  /** 探索页扩展（可选）：外部驱动的悬停节点（列表 → 星球联动） */
  externalHoverId?: string | null
  /** 探索页扩展（可选）：星球悬停回调（星球 → 列表联动） */
  onHoverNode?: (id: string | null) => void
  /** 探索页扩展（可选）：需要淡出至低透明度的节点集合（搜索/筛选未命中） */
  dimmedIds?: ReadonlySet<string>
  /** 探索页扩展（可选）：分类聚合视图 —— 节点向所属分类星区插值迁移 */
  clusterMode?: boolean
  /** 探索页扩展（可选）：拖拽时暂停自转，松手 3s 后恢复 */
  pauseOnDrag?: boolean
  /** 探索页扩展（可选）：星球居中渲染（不做桌面端横向偏移） */
  centered?: boolean
  /** 探索页扩展（可选）：默认相机机位（亦用于重置视角） */
  defaultCamPos?: [number, number, number]
  /** 探索页扩展（可选）：关联聚焦时压暗与非活跃节点无关的连线 */
  muteInactiveEdges?: boolean
}

// ──────────────────────────────────────────────────────────────
// 工具
// ──────────────────────────────────────────────────────────────

const PLANET_R = 1

/** 球面均匀采样（斐波那契球），按节点索引稳定取点 */
function fibSpherePoint(i: number, n: number, r = PLANET_R): THREE.Vector3 {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const y = 1 - (i / (n - 1)) * 2
  const rad = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = golden * i
  return new THREE.Vector3(Math.cos(theta) * rad * r, y * r, Math.sin(theta) * rad * r)
}

/** 稳定的节点局部坐标表（模块级，确定性） */
const NODE_POSITIONS: Map<string, THREE.Vector3> = new Map(
  NODES.map((n, i) => [n.id, fibSpherePoint(i, NODES.length)]),
)

/** 分类聚合视图的节点目标坐标：同类节点聚拢成 6 个星区（确定性布局） */
const CLUSTER_POSITIONS: Map<string, THREE.Vector3> = (() => {
  const map = new Map<string, THREE.Vector3>()
  CATEGORIES.forEach((cat, ci) => {
    const center = fibSpherePoint(ci, CATEGORIES.length)
    const up =
      Math.abs(center.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
    const t1 = new THREE.Vector3().crossVectors(up, center).normalize()
    const t2 = new THREE.Vector3().crossVectors(center, t1).normalize()
    const members = NODES.filter((n) => n.category === cat.id)
    members.forEach((n, i) => {
      const ang = i * 2.399963 // 黄金角螺旋
      const rad = 0.05 + 0.34 * Math.sqrt((i + 0.5) / members.length)
      const p = center
        .clone()
        .addScaledVector(t1, Math.cos(ang) * rad * 0.55)
        .addScaledVector(t2, Math.sin(ang) * rad * 0.55)
        .normalize()
        .multiplyScalar(PLANET_R)
      map.set(n.id, p)
    })
  })
  return map
})()

/** 径向渐变光晕贴图 */
function makeGlowTexture(): THREE.Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const GLOW_TEX: { current: THREE.Texture | null } = { current: null }
function getGlowTexture() {
  if (!GLOW_TEX.current) GLOW_TEX.current = makeGlowTexture()
  return GLOW_TEX.current
}

const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3)

// ──────────────────────────────────────────────────────────────
// 远景尘埃粒子
// ──────────────────────────────────────────────────────────────

function DustField({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const count = 800
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(4 + Math.random() * 14)
      positions.set([v.x, v.y, v.z], i * 3)
      const b = 0.2 + Math.random() * 0.3
      const tint = Math.random()
      colors.set(
        [b * (0.7 + tint * 0.3), b * (0.75 + tint * 0.15), b],
        i * 3,
      )
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])
  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) ref.current.rotation.y += delta * 0.004
  })
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// ──────────────────────────────────────────────────────────────
// 星球点云本体
// ──────────────────────────────────────────────────────────────

function PlanetPointCloud() {
  const geometry = useMemo(() => {
    const count = 4200
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const violet = new THREE.Color('#8B7CFF')
    const cyan = new THREE.Color('#4DE3FF')
    const tmp = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const p = fibSpherePoint(i, count, PLANET_R * (0.99 + Math.random() * 0.02))
      positions.set([p.x, p.y, p.z], i * 3)
      // 由纬度和噪声混合：核心偏紫、边缘偏青
      const t = Math.min(1, Math.max(0, Math.abs(p.y) * 0.9 + Math.random() * 0.35))
      tmp.copy(violet).lerp(cyan, t)
      colors.set([tmp.r, tmp.g, tmp.b], i * 3)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])
  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.011}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ──────────────────────────────────────────────────────────────
// 菲涅尔发光壳
// ──────────────────────────────────────────────────────────────

const FRESNEL_VERT = /* glsl */ `
  varying float vFresnel;
  void main() {
    vec3 n = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 viewDir = normalize(-mv.xyz);
    vFresnel = pow(1.0 - abs(dot(n, viewDir)), 2.4);
    gl_Position = projectionMatrix * mv;
  }
`
const FRESNEL_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vFresnel;
  void main() {
    gl_FragColor = vec4(uColor, vFresnel * 0.32 * uIntensity);
  }
`

function FresnelShell({
  scrollState,
}: {
  scrollState?: MutableRefObject<PlanetScrollState>
}) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color('#4DE3FF') }, uIntensity: { value: 1 } }),
    [],
  )
  useFrame(() => {
    if (mat.current && scrollState) {
      mat.current.uniforms.uIntensity.value = scrollState.current.fresnel
    }
  })
  return (
    <mesh scale={1.035}>
      <sphereGeometry args={[PLANET_R, 64, 64]} />
      <shaderMaterial
        ref={mat}
        vertexShader={FRESNEL_VERT}
        fragmentShader={FRESNEL_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

// ──────────────────────────────────────────────────────────────
// 引力连线（单次构建，顶点色表达高亮）
// ──────────────────────────────────────────────────────────────

function EdgeLines({
  hoveredId,
  selectedId,
  scrollState,
  muteInactive,
}: {
  hoveredId: string | null
  selectedId: string | null
  scrollState?: MutableRefObject<PlanetScrollState>
  muteInactive?: boolean
}) {
  const dimColor = useMemo(() => new THREE.Color('#94A3FF').multiplyScalar(0.16), [])
  const hotColor = useMemo(() => new THREE.Color('#4DE3FF').multiplyScalar(0.75), [])

  const { geometry, edgeRanges } = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const ranges: { a: string; b: string; start: number; count: number }[] = []
    for (const [a, b] of EDGES) {
      const pa = NODE_POSITIONS.get(a)!
      const pb = NODE_POSITIONS.get(b)!
      const mid = pa
        .clone()
        .add(pb)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(PLANET_R * 1.16)
      const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb)
      const pts = curve.getPoints(16)
      const start = positions.length / 3
      for (let i = 0; i < pts.length - 1; i++) {
        positions.push(...pts[i].toArray(), ...pts[i + 1].toArray())
        for (let k = 0; k < 6; k++) colors.push(dimColor.r, dimColor.g, dimColor.b)
      }
      ranges.push({ a, b, start, count: (pts.length - 1) * 2 })
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return { geometry: geo, edgeRanges: ranges }
  }, [dimColor])

  // 高亮更新 + 滚动增亮
  useFrame(() => {
    const attr = geometry.getAttribute('color') as THREE.BufferAttribute
    const boost = scrollState ? scrollState.current.edgeBoost : 0
    const base = dimColor.clone().multiplyScalar(1 + boost * 3.2)
    const active = hoveredId ?? selectedId
    if (muteInactive && active) base.multiplyScalar(0.3)
    for (const r of edgeRanges) {
      const isHot = !!active && (r.a === active || r.b === active)
      const c = isHot ? hotColor : base
      for (let i = r.start; i < r.start + r.count; i++) {
        attr.setXYZ(i, c.r, c.g, c.b)
      }
    }
    attr.needsUpdate = true
  })

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

// ──────────────────────────────────────────────────────────────
// 单个知识节点（亮点 + 光晕 + 脉冲环）
// ──────────────────────────────────────────────────────────────

const GRAVITY_SIZE: Record<number, number> = { 1: 0.02, 2: 0.028, 3: 0.038 }

interface PlanetNodeProps {
  node: KnowledgeNode
  hovered: boolean
  selected: boolean
  dimmed: boolean
  clusterTarget: THREE.Vector3 | null
  pulseAt: number
  appearDelay: number
  onHover: (id: string | null) => void
  onClick: (node: KnowledgeNode) => void
  registerRef: (id: string, obj: THREE.Object3D | null) => void
}

function PlanetNode({
  node,
  hovered,
  selected,
  dimmed,
  clusterTarget,
  pulseAt,
  appearDelay,
  onHover,
  onClick,
  registerRef,
}: PlanetNodeProps) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Sprite>(null)
  const ring = useRef<THREE.Mesh>(null)
  const dimK = useRef(0)
  const pos = NODE_POSITIONS.get(node.id)!
  const color = CATEGORY_MAP[node.category].color
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const breathSpeed = useMemo(() => 1.6 + Math.random() * 1.6, [])

  useEffect(() => {
    // 初始位置（之后的位移由 useFrame 插值驱动，支持分类聚合迁移）
    group.current?.position.copy(pos)
    registerRef(node.id, group.current)
    return () => registerRef(node.id, null)
  }, [node.id, pos, registerRef])

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const g = group.current
    if (!g) return
    // 自由布局 ↔ 分类聚合布局 插值迁移
    const target = clusterTarget ?? pos
    if (!g.position.equals(target)) {
      g.position.lerp(target, Math.min(1, delta * 2.4))
    }
    // 入场点亮
    const appear = EASE_OUT(Math.min(1, Math.max(0, (t - appearDelay) / 0.5)))
    g.scale.setScalar(Math.max(0.0001, appear))
    // 搜索/筛选淡出（最低 0.15 透明度，0.4s 左右收敛）
    dimK.current += ((dimmed ? 1 : 0) - dimK.current) * Math.min(1, delta * 6)
    const vis = 1 - dimK.current * 0.85
    if (core.current) {
      ;(core.current.material as THREE.MeshBasicMaterial).opacity = vis
    }
    // 呼吸光晕 + 悬停/选中放大
    const breath = 1 + 0.18 * Math.sin(t * breathSpeed + phase)
    const boost = hovered || selected ? 1.8 : 1
    if (glow.current) {
      glow.current.scale.setScalar(GRAVITY_SIZE[node.gravity] * 9 * breath * boost)
      ;(glow.current.material as THREE.SpriteMaterial).opacity = 0.55 * vis
    }
    // 点击脉冲环：scale 1 → 1.6 → 1（0.6s）
    if (ring.current) {
      const dt = t - pulseAt
      if (dt >= 0 && dt < 0.6) {
        const k = dt / 0.6
        ring.current.scale.setScalar(1 + 0.6 * Math.sin(k * Math.PI))
        ;(ring.current.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - k)
        ring.current.visible = true
      } else {
        ring.current.visible = false
      }
    }
  })

  return (
    <group ref={group}>
      {/* 核心亮点 */}
      <mesh
        ref={core}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(node.id)
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick(node)
        }}
      >
        <sphereGeometry args={[GRAVITY_SIZE[node.gravity], 16, 16]} />
        <meshBasicMaterial color={color} transparent />
      </mesh>
      {/* 光晕 sprite */}
      <sprite ref={glow}>
        <spriteMaterial
          map={getGlowTexture()}
          color={color}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* 脉冲环 */}
      <mesh ref={ring} visible={false}>
        <ringGeometry args={[GRAVITY_SIZE[node.gravity] * 2.2, GRAVITY_SIZE[node.gravity] * 2.6, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* 悬停标签 */}
      {hovered && (
        <Html
          center
          distanceFactor={6}
          position={[0, GRAVITY_SIZE[node.gravity] * 3 + 0.04, 0]}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[30, 0]}
        >
          <div className="flex items-center gap-2 whitespace-nowrap rounded border border-orbit-line bg-void/80 px-2.5 py-1.5 backdrop-blur-sm">
            <span className="font-sans text-[11px] font-medium text-star-white">{node.title}</span>
            <span
              className="rounded-full border px-1.5 py-px font-mono text-[10px]"
              style={{ borderColor: color, color }}
            >
              {CATEGORY_MAP[node.category].zh}
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}

// ──────────────────────────────────────────────────────────────
// 轨道环
// ──────────────────────────────────────────────────────────────

function OrbitRing({ radius, tilt, speed }: { radius: number; tilt: number; speed: number }) {
  const ref = useRef<THREE.Group>(null)
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const seg = 128
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [radius])
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed
  })
  return (
    <group rotation={[tilt, 0, tilt * 0.6]}>
      <group ref={ref}>
        <lineLoop geometry={geometry}>
          <lineBasicMaterial color="#94A3FF" transparent opacity={0.22} />
        </lineLoop>
      </group>
    </group>
  )
}

// ──────────────────────────────────────────────────────────────
// 场景内部（可访问 useThree）
// ──────────────────────────────────────────────────────────────

interface SceneProps extends KnowledgePlanetProps {
  handleRef: MutableRefObject<KnowledgePlanetHandle | null>
}

const DEFAULT_CAM = new THREE.Vector3(0.2, 0.18, 3.4)

function PlanetScene({
  onSelectNode,
  selectedId,
  scrollState,
  reducedMotion,
  handleRef,
  externalHoverId,
  onHoverNode,
  dimmedIds,
  clusterMode,
  pauseOnDrag,
  centered,
  defaultCamPos,
  muteInactiveEdges,
}: SceneProps) {
  const planetGroup = useRef<THREE.Group>(null)
  const controls = useRef<OrbitControlsImpl>(null)
  const nodeObjs = useRef<Map<string, THREE.Object3D>>(new Map())
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pulses, setPulses] = useState<Map<string, number>>(new Map())
  const speedRef = useRef(1)
  const clockRef = useRef(0)
  const dragRef = useRef({ dragging: false, resumeAt: -1 })
  const { camera, size } = useThree()

  const isDesktop = size.width >= 1024
  const baseOffsetX = centered ? 0 : isDesktop ? 0.42 : 0

  // 星球内部悬停优先，其次外部（列表）悬停
  const effHoverId = hoveredId ?? externalHoverId ?? null

  const handleHover = useCallback(
    (id: string | null) => {
      setHoveredId(id)
      onHoverNode?.(id)
    },
    [onHoverNode],
  )

  // 悬停时光标
  useEffect(() => {
    document.body.style.cursor = effHoverId ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [effHoverId])

  const registerRef = useCallback((id: string, obj: THREE.Object3D | null) => {
    if (obj) nodeObjs.current.set(id, obj)
    else nodeObjs.current.delete(id)
  }, [])

  const planetCenter = useCallback(() => {
    const v = new THREE.Vector3()
    planetGroup.current?.getWorldPosition(v)
    return v
  }, [])

  const flyTo = useCallback(
    (target: THREE.Vector3, camPos: THREE.Vector3, duration: number) => {
      if (!controls.current) return
      gsap.to(controls.current.target, {
        x: target.x, y: target.y, z: target.z,
        duration, ease: 'expo.out',
        onUpdate: () => controls.current?.update(),
      })
      gsap.to(camera.position, { x: camPos.x, y: camPos.y, z: camPos.z, duration, ease: 'expo.out' })
    },
    [camera],
  )

  const focusNode = useCallback(
    (id: string) => {
      const obj = nodeObjs.current.get(id)
      if (!obj) return
      const world = new THREE.Vector3()
      obj.getWorldPosition(world)
      const center = planetCenter()
      const dir = world.clone().sub(center).normalize()
      flyTo(world, center.clone().add(dir.multiplyScalar(PLANET_R * 1.6)), 1.2)
      setPulses((m) => new Map(m).set(id, clockRef.current))
    },
    [flyTo, planetCenter],
  )

  const resetCamera = useCallback(() => {
    const d = defaultCamPos
    flyTo(planetCenter(), d ? new THREE.Vector3(d[0], d[1], d[2]) : DEFAULT_CAM.clone(), 1.0)
  }, [flyTo, planetCenter, defaultCamPos])

  useImperativeHandle(handleRef, () => ({ focusNode, resetCamera }), [focusNode, resetCamera])

  const handleNodeClick = useCallback(
    (node: KnowledgeNode) => {
      focusNode(node.id)
      onSelectNode(node)
    },
    [focusNode, onSelectNode],
  )

  // 主循环：自转（悬停减速至 20%）、滚动驱动、HUD 读数
  useFrame(({ clock }, delta) => {
    clockRef.current = clock.elapsedTime
    const g = planetGroup.current
    if (!g) return
    let target = effHoverId ? 0.2 : 1
    // 探索页：拖拽中断自转，松手 3s 后恢复
    if (
      pauseOnDrag &&
      (dragRef.current.dragging || clock.elapsedTime < dragRef.current.resumeAt)
    ) {
      target = 0
    }
    speedRef.current += (target - speedRef.current) * Math.min(1, delta * 4)
    if (!reducedMotion) {
      g.rotation.y += delta * ((Math.PI * 2) / 40) * speedRef.current
    }
    // 滚动驱动（Section 2）
    const s = scrollState?.current
    if (s) {
      const p = s.progress
      const t1 = Math.min(1, Math.max(0, p / 0.3)) // 0-30% 放大归中
      const t3 = Math.min(1, Math.max(0, (p - 0.65) / 0.35)) // 65-100% 退场
      const scale = (1 + 0.35 * t1) * (1 - 0.4 * Math.max(0, t3 - 0.45) / 0.55)
      g.scale.setScalar(Math.max(0.0001, scale))
      g.position.x = baseOffsetX * (1 - t1)
      s.rotationY = g.rotation.y
    } else {
      // 无滚动驱动时：入场 scale 0.85 → 1，缓慢趋近默认布局
      const k = Math.min(1, delta * 2.2)
      const cur = g.scale.x
      g.scale.setScalar(cur + (1 - cur) * k)
      g.position.x += (baseOffsetX - g.position.x) * k
    }
  })

  const appearDelays = useMemo(
    () => new Map(NODES.map((n) => [n.id, 0.3 + Math.random() * 1.2])),
    [],
  )

  return (
    <>
      <DustField reducedMotion={!!reducedMotion} />
      <group ref={planetGroup} position={[baseOffsetX, 0, 0]} scale={reducedMotion ? 1 : 0.85}>
        <PlanetPointCloud />
        <FresnelShell scrollState={scrollState} />
        <EdgeLines
          hoveredId={effHoverId}
          selectedId={selectedId ?? null}
          scrollState={scrollState}
          muteInactive={muteInactiveEdges}
        />
        {NODES.map((node) => (
          <PlanetNode
            key={node.id}
            node={node}
            hovered={effHoverId === node.id}
            selected={selectedId === node.id}
            dimmed={dimmedIds?.has(node.id) ?? false}
            clusterTarget={clusterMode ? (CLUSTER_POSITIONS.get(node.id) ?? null) : null}
            pulseAt={pulses.get(node.id) ?? -10}
            appearDelay={reducedMotion ? 0 : (appearDelays.get(node.id) ?? 0)}
            onHover={handleHover}
            onClick={handleNodeClick}
            registerRef={registerRef}
          />
        ))}
        <OrbitRing radius={1.42} tilt={0.4} speed={0.05} />
        <OrbitRing radius={1.62} tilt={-0.28} speed={-0.033} />
        <OrbitRing radius={1.85} tilt={0.75} speed={0.021} />
      </group>
      <OrbitControls
        ref={controls}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={PLANET_R * 1.4}
        maxDistance={PLANET_R * 4}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
        onStart={() => {
          dragRef.current.dragging = true
        }}
        onEnd={() => {
          dragRef.current.dragging = false
          dragRef.current.resumeAt = clockRef.current + 3
        }}
      />
    </>
  )
}

// ──────────────────────────────────────────────────────────────
// 导出的 Canvas 包装
// ──────────────────────────────────────────────────────────────

const KnowledgePlanet = forwardRef<KnowledgePlanetHandle, KnowledgePlanetProps>(
  function KnowledgePlanet(props, ref) {
    const handleRef = useRef<KnowledgePlanetHandle | null>(null)
    useImperativeHandle(ref, () => ({
      focusNode: (id) => handleRef.current?.focusNode(id),
      resetCamera: () => handleRef.current?.resetCamera(),
    }))
    return (
      <Canvas
        dpr={[1, 2]}
        camera={{
          position: props.defaultCamPos ?? DEFAULT_CAM.toArray(),
          fov: 45,
          near: 0.1,
          far: 60,
        }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        onPointerMissed={() => {
          if (props.selectedId) handleRef.current?.resetCamera()
        }}
      >
        <PlanetScene {...props} handleRef={handleRef} />
      </Canvas>
    )
  },
)

export default KnowledgePlanet
