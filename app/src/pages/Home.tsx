import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { Link } from 'react-router'
import { motion, useReducedMotion, useInView, animate } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import type { KnowledgePlanetHandle, PlanetScrollState } from '@/components/KnowledgePlanet'
import NodeDrawer from '@/components/NodeDrawer'
import { NODES, CATEGORIES, CATEGORY_MAP, FEATURED_IDS, NODE_MAP } from '@/data/nodes'
import type { KnowledgeNode } from '@/data/nodes'

gsap.registerPlugin(ScrollTrigger)

// WebGL 星球场景代码分割加载
const KnowledgePlanet = lazy(() => import('@/components/KnowledgePlanet'))

function createScrollState(): PlanetScrollState {
  return { progress: 0, fresnel: 1, edgeBoost: 0, exitOpacity: 1, rotationY: 0 }
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

// ── 小部件 ────────────────────────────────────────────────────

function Eyebrow({ children, color = '#4DE3FF' }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="flex items-center gap-3 font-grotesk text-[13px] font-medium uppercase tracking-[0.35em]" style={{ color }}>
      <span className="eyebrow-line" />
      {children}
    </p>
  )
}

/** Hero 左上角伪天文坐标读数，随星球自转微变 */
function CoordReadout({ rotationRef }: { rotationRef: React.MutableRefObject<number> }) {
  const [text, setText] = useState('RA 05h 35m · DEC −05° 23′')
  useEffect(() => {
    const t = setInterval(() => {
      const r = rotationRef.current
      const m = 35 + Math.floor((r * 10) % 24)
      const d = 23 + Math.floor((r * 3) % 9)
      setText(`RA 05h ${String(m).padStart(2, '0')}m · DEC −05° ${String(d).padStart(2, '0')}′`)
    }, 400)
    return () => clearInterval(t)
  }, [rotationRef])
  return <span>{text}</span>
}

// ── Section 3 · 数据仪表 ──────────────────────────────────────

function StatCard({ value, label, zh, delay }: { value: number; label: string; zh: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30% 0px' })
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, reduced])
  return (
    <motion.div
      ref={ref}
      initial={{ y: 40, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : undefined}
      transition={{ delay, duration: 0.7, ease: EASE }}
      className="group relative border border-orbit-line bg-nebula/60 px-8 py-10 transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(77,227,255,0.15)]"
    >
      <div className="font-grotesk text-5xl font-bold text-star-white transition-transform duration-500 group-hover:scale-105">
        {display.toLocaleString('en-US')}
      </div>
      <div className="mt-3 font-mono text-xs tracking-[0.25em] text-dim-star">
        {label} · <span className="text-faint">{zh}</span>
      </div>
    </motion.div>
  )
}

// ── Section 4 · 精选节点卡片 ──────────────────────────────────

function FeaturedCard({
  node,
  index,
  onOpen,
  onLocate,
}: {
  node: KnowledgeNode
  index: number
  onOpen: () => void
  onLocate: () => void
}) {
  const cat = CATEGORY_MAP[node.category]
  return (
    <motion.article
      initial={{ x: 80, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ delay: index * 0.08, duration: 0.7, ease: EASE }}
      className="group relative w-[320px] shrink-0 cursor-pointer border border-orbit-line bg-nebula/60 transition-all duration-500 hover:-translate-y-1.5"
      style={{ boxShadow: 'none' }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${cat.color}55, 0 8px 40px ${cat.color}22`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="h-[3px] w-full" style={{ background: cat.color }} />
      <div className="p-6">
        <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.2em] text-faint">
          <span>NODE-{String(NODES.findIndex((n) => n.id === node.id) + 1).padStart(3, '0')}</span>
          <MiniOrbit color={cat.color} />
        </div>
        <h3 className="mt-4 font-serif text-[22px] font-bold text-star-white">{node.title}</h3>
        <p className="mt-3 line-clamp-2 font-sans text-sm leading-relaxed text-dim-star">
          {node.summary}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <span
            className="inline-flex h-7 items-center gap-2 rounded-full border px-3 font-mono text-xs"
            style={{ borderColor: cat.color, color: cat.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
            {cat.zh}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLocate()
            }}
            className="font-mono text-xs text-dim-star transition-colors hover:text-ion-cyan"
          >
            ⌖ 定位
          </button>
        </div>
      </div>
    </motion.article>
  )
}

function MiniOrbit({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" className="transition-transform duration-700 group-hover:rotate-180">
      <circle cx="13" cy="13" r="4" fill="none" stroke={color} strokeWidth="1" />
      <ellipse cx="13" cy="13" rx="11" ry="4.5" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" transform="rotate(-20 13 13)" />
      <circle cx="22" cy="10" r="1.4" fill={color} />
    </svg>
  )
}

// ── 主页面 ────────────────────────────────────────────────────

export default function Home() {
  const reduced = useReducedMotion() ?? false
  const planetRef = useRef<KnowledgePlanetHandle>(null)
  const planetState = useRef(createScrollState())
  const rotationRef = useRef(0)
  const stickyWrapRef = useRef<HTMLDivElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)
  const sentRefs = useRef<(HTMLDivElement | null)[]>([])
  const hudRef = useRef<HTMLDivElement>(null)

  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      setWebglOk(!!(c.getContext('webgl2') || c.getContext('webgl')))
    } catch {
      setWebglOk(false)
    }
  }, [])

  // 同步 HUD 读数 ref
  useEffect(() => {
    const t = setInterval(() => {
      rotationRef.current = planetState.current.rotationY
    }, 100)
    return () => clearInterval(t)
  }, [])

  // Section 2 · pinned 滚动叙事
  useGSAP(
    () => {
      if (reduced) return
      const s = planetState.current
      ScrollTrigger.create({
        trigger: stickyWrapRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress
          s.progress = p
          s.edgeBoost = 0.55 * Math.min(1, Math.max(0, (p - 0.3) / 0.35))
          s.fresnel = 1 + 0.6 * Math.min(1, Math.max(0, (p - 0.65) / 0.2))
        },
      })
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stickyWrapRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      })
      tl.to(heroTextRef.current, { opacity: 0, y: -60, duration: 0.12, ease: 'none' }, 0)
        .fromTo(sentRefs.current[0], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.1 }, 0.04)
        .to(sentRefs.current[0], { opacity: 0, y: -30, duration: 0.08 }, 0.24)
        .fromTo(sentRefs.current[1], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.1 }, 0.32)
        .to(sentRefs.current[1], { opacity: 0, y: -30, duration: 0.08 }, 0.58)
        .fromTo(sentRefs.current[2], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.1 }, 0.68)
        .to(sentRefs.current[2], { opacity: 0, duration: 0.06 }, 0.9)
        .to(canvasWrapRef.current, { opacity: 0, duration: 0.08 }, 0.92)
        .to(hudRef.current, { opacity: 0, duration: 0.08 }, 0.86)
    },
    { scope: stickyWrapRef, dependencies: [reduced] },
  )

  const openNode = useCallback((node: KnowledgeNode) => setSelectedNode(node), [])
  const handleDrawerNavigate = useCallback((id: string) => {
    const n = NODE_MAP[id]
    if (!n) return
    setSelectedNode(n)
    planetRef.current?.focusNode(id)
  }, [])
  const handleLocate = useCallback((id: string) => {
    planetRef.current?.focusNode(id)
  }, [])
  const scrollToTopAndFocus = useCallback((id: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const n = NODE_MAP[id]
    if (n) setSelectedNode(n)
    // 等待滚动回顶后执行相机飞近
    setTimeout(() => planetRef.current?.focusNode(id), 700)
  }, [])

  const featured = useMemo(() => FEATURED_IDS.map((id) => NODE_MAP[id]).filter(Boolean), [])

  return (
    <div className="relative">
      {/* ════════ Section 1 + 2 · 粘性星球画布容器（100vh Hero + 150vh 叙事） ════════ */}
      <div ref={stickyWrapRef} className="relative -mt-[72px]" style={{ height: reduced ? 'auto' : '250vh' }}>
        <div className={reduced ? 'relative h-[100dvh] overflow-hidden' : 'sticky top-0 h-[100dvh] overflow-hidden'}>
          {/* 星野背景 */}
          <div
            className="absolute inset-0 bg-void"
            style={{
              backgroundImage: 'url(/starfield-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 1,
            }}
          />
          <div className="absolute inset-0 bg-void/65" />

          {/* 星球画布 */}
          <div ref={canvasWrapRef} className="absolute inset-0">
            {webglOk ? (
              <motion.div
                className="h-full w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.6, ease: EASE }}
              >
                <Suspense fallback={<div className="h-full w-full" />}>
                  <KnowledgePlanet
                    ref={planetRef}
                    onSelectNode={openNode}
                    selectedId={selectedNode?.id ?? null}
                    scrollState={planetState}
                    reducedMotion={reduced}
                  />
                </Suspense>
              </motion.div>
            ) : (
              <WebGLFallback onSelectNode={openNode} />
            )}
          </div>

          {/* Hero 文字块 */}
          <div
            ref={heroTextRef}
            className="pointer-events-none absolute inset-0 z-10 mx-auto flex max-w-[1280px] items-center px-6 lg:px-12"
          >
            <div className="pointer-events-auto max-w-[520px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
              >
                <Eyebrow>An Orbiting Atlas of Ideas</Eyebrow>
              </motion.div>
              <h1 className="mt-6 font-serif text-[44px] font-black leading-[1.1] tracking-[0.02em] text-star-white lg:text-[88px]">
                {['知识是一颗'].concat().map((line) => (
                  <span key={line} className="block overflow-hidden">
                    {line.split('').map((ch, i) => (
                      <motion.span
                        key={`${ch}-${i}`}
                        className="inline-block"
                        initial={{ y: 60, rotateX: 90, opacity: 0 }}
                        animate={{ y: 0, rotateX: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 0.8, ease: EASE }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </span>
                ))}
                <span className="block overflow-hidden">
                  {'旋转的'.split('').map((ch, i) => (
                    <motion.span
                      key={ch + i}
                      className="inline-block"
                      initial={{ y: 60, rotateX: 90, opacity: 0 }}
                      animate={{ y: 0, rotateX: 0, opacity: 1 }}
                      transition={{ delay: 0.75 + i * 0.05, duration: 0.8, ease: EASE }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                  {'星球'.split('').map((ch, i) => (
                    <motion.span
                      key={ch + i}
                      className="text-gradient-title inline-block"
                      initial={{ y: 60, rotateX: 90, opacity: 0 }}
                      animate={{ y: 0, rotateX: 0, opacity: 1 }}
                      transition={{ delay: 0.9 + i * 0.05, duration: 0.8, ease: EASE }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </span>
              </h1>
              <motion.p
                className="mt-7 max-w-[420px] font-sans text-base leading-[1.85] text-dim-star"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
              >
                128 个知识节点环绕运行，彼此以引力相连。拖动它，点击任何一颗光点，开始你的探索。
              </motion.p>
              <motion.div
                className="mt-9 flex flex-wrap items-center gap-5"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.8, ease: EASE }}
              >
                <Link
                  to="/explore"
                  className="group relative border border-ion-cyan px-7 py-3.5 font-sans text-sm font-medium tracking-[0.12em] text-ion-cyan transition-all duration-400 hover:bg-ion-cyan hover:text-void"
                >
                  开始探索
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1"> →</span>
                </Link>
                <Link
                  to="/about"
                  className="font-sans text-sm text-dim-star underline decoration-orbit-line underline-offset-8 transition-colors hover:text-star-white hover:decoration-ion-cyan"
                >
                  了解它的构造
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Section 2 · 叙事句子（覆盖于同一星球之上） */}
          {['孤立的知识点，只是漂浮的尘埃。', '当它们彼此相连 ——', '一张活的地图开始旋转。'].map(
            (s, i) => (
              <div
                key={s}
                ref={(el) => {
                  sentRefs.current[i] = el
                }}
                className="pointer-events-none absolute inset-0 z-10 mx-auto flex max-w-[1280px] items-center px-6 lg:px-12"
                style={{ opacity: reduced ? 0 : 0 }}
              >
                <p className="max-w-[560px] font-serif text-[30px] font-black leading-[1.3] text-star-white lg:text-[44px]">
                  {s}
                </p>
              </div>
            ),
          )}

          {/* HUD 覆盖层 */}
          <div ref={hudRef} className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
            <div className="absolute left-8 top-24 font-mono text-xs tracking-[0.12em] text-dim-star">
              <CoordReadout rotationRef={rotationRef} />
            </div>
            <div className="absolute right-8 top-24 flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-dim-star">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aurora-green" />
              ORBIT SYNC · 98.2%
            </div>
            <div className="absolute bottom-10 left-8 flex items-center gap-4 font-mono text-[11px] tracking-[0.1em] text-dim-star">
              {CATEGORIES.map((c) => (
                <span key={c.id} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                  {c.zh}
                </span>
              ))}
            </div>
            <div className="absolute bottom-10 right-8 font-mono text-[11px] tracking-[0.12em] text-dim-star">
              ▏▏▏▏▏ SCALE 1 : 10⁶
            </div>
            {/* 四角括线 */}
            <span className="absolute left-8 top-[88px] h-5 w-5 border-l border-t border-orbit-line" />
            <span className="absolute right-8 top-[88px] h-5 w-5 border-r border-t border-orbit-line" />
            <span className="absolute bottom-8 left-8 h-5 w-5 border-b border-l border-orbit-line" />
            <span className="absolute bottom-8 right-8 h-5 w-5 border-b border-r border-orbit-line" />
          </div>

          {/* 滚动提示 */}
          <motion.div
            className="pointer-events-none absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <span className="font-mono text-[11px] tracking-[0.3em] text-faint">SCROLL</span>
            <span className="relative h-[60px] w-px overflow-hidden bg-gradient-to-b from-ion-cyan/60 to-transparent">
              <motion.span
                className="absolute left-0 top-0 h-2 w-2 -translate-x-[3.5px] rounded-full bg-ion-cyan"
                animate={reduced ? undefined : { y: [0, 60] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeIn' }}
              />
            </span>
          </motion.div>
        </div>
      </div>

      {/* reduced-motion 时的叙事降级 */}
      {reduced && (
        <section className="border-t border-orbit-line bg-deep-space/40 py-20">
          <div className="mx-auto max-w-[840px] space-y-6 px-6 text-center font-serif text-3xl font-black text-star-white">
            <p>孤立的知识点，只是漂浮的尘埃。</p>
            <p>当它们彼此相连 ——</p>
            <p className="text-gradient-title">一张活的地图开始旋转。</p>
          </div>
        </section>
      )}

      {/* ════════ Section 3 · 数据仪表 ════════ */}
      <section className="relative bg-void py-[72px] lg:py-[120px]">
        <img src="/nebula-glow-1.png" alt="" className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] opacity-60" />
        <div className="relative mx-auto max-w-[1280px] px-6 lg:px-12">
          <Eyebrow>Telemetry · 遥测数据</Eyebrow>
          <h2 className="mt-5 font-serif text-[30px] font-semibold leading-[1.2] text-star-white lg:text-[44px]">
            一颗活着的星球
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-px bg-orbit-line lg:grid-cols-4">
            <StatCard value={128} label="NODES" zh="知识节点" delay={0} />
            <StatCard value={342} label="EDGES" zh="引力连接" delay={0.12} />
            <StatCard value={6} label="DOMAINS" zh="知识领域" delay={0.24} />
            <StatCard value={12847} label="EXPLORERS" zh="累计探索者" delay={0.36} />
          </div>
        </div>
      </section>

      {/* ════════ Section 4 · 精选节点 ════════ */}
      <section id="featured" className="relative bg-deep-space/40 py-[72px] lg:py-[120px]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
          <div className="flex items-end justify-between">
            <div>
              <Eyebrow>Featured Nodes · 亮点</Eyebrow>
              <h2 className="mt-5 font-serif text-[30px] font-semibold leading-[1.2] text-star-white lg:text-[44px]">
                本周亮点节点
              </h2>
            </div>
            <Link
              to="/explore"
              className="hidden shrink-0 font-sans text-sm text-dim-star transition-colors hover:text-ion-cyan sm:block"
            >
              查看全部 →
            </Link>
          </div>
        </div>
        <div className="no-scrollbar mt-12 flex gap-6 overflow-x-auto px-6 pb-4 lg:px-[max(48px,calc((100vw-1280px)/2+48px))]">
          {featured.map((node, i) => (
            <FeaturedCard
              key={node.id}
              node={node}
              index={i}
              onOpen={() => setSelectedNode(node)}
              onLocate={() => scrollToTopAndFocus(node.id)}
            />
          ))}
        </div>
      </section>

      {/* ════════ Section 5 · 知识域导览 ════════ */}
      <section className="relative bg-void py-[72px] lg:py-[120px]">
        <img src="/nebula-glow-2.png" alt="" className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] opacity-50" />
        <div className="relative mx-auto max-w-[1280px] px-6 lg:px-12">
          <Eyebrow>Sectors · 星区</Eyebrow>
          <h2 className="mt-5 font-serif text-[30px] font-semibold leading-[1.2] text-star-white lg:text-[44px]">
            选择你的着陆点
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ y: 48, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: EASE }}
              >
                <Link
                  to={`/topics#${c.id}`}
                  className="group relative block aspect-[4/3] overflow-hidden border border-orbit-line"
                  style={{ transition: 'box-shadow 0.5s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${c.color}66`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <img
                    src={c.cover}
                    alt={c.zh}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void/95 via-void/60 to-void/30 transition-opacity duration-500 group-hover:opacity-80" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <span className="font-grotesk text-[13px] font-medium uppercase tracking-[0.35em]" style={{ color: c.color }}>
                      {c.en}
                    </span>
                    <h3 className="mt-2 font-serif text-[32px] font-black text-star-white">{c.zh}</h3>
                    <p className="mt-2 font-sans text-sm text-dim-star">{c.description}</p>
                    <p className="mt-4 font-mono text-xs tracking-[0.15em] text-dim-star">
                      NODES: {NODES.filter((n) => n.category === c.id).length * 2 + 5} ·{' '}
                      <span className="text-ion-cyan">
                        进入星区
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"> →</span>
                      </span>
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Section 6 · 宣言区 ════════ */}
      <section className="relative bg-deep-space/40 py-[72px] lg:py-[120px]">
        <div className="mx-auto max-w-[840px] px-6 text-center">
          <motion.img
            src="/logo-planet.svg"
            alt=""
            className="mx-auto h-6 w-6 text-ion-cyan"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          />
          <motion.blockquote
            className="mt-10 font-serif text-[28px] font-black leading-[1.5] text-star-white lg:text-[44px]"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            「我们不是在收藏知识，
            <br />
            我们在<span className="text-gradient-title">豢养一颗会生长的星球</span>。」
          </motion.blockquote>
          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
          >
            <Link
              to="/explore"
              className="group border border-ion-cyan px-8 py-4 font-sans text-sm font-medium tracking-[0.12em] text-ion-cyan transition-all duration-400 hover:bg-ion-cyan hover:text-void"
            >
              进入星球探索
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1"> →</span>
            </Link>
            <Link
              to="/submit"
              className="font-sans text-sm text-dim-star underline decoration-orbit-line underline-offset-8 transition-colors hover:text-star-white hover:decoration-ion-cyan"
            >
              播种你的节点
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════ 节点详情抽屉 ════════ */}
      <NodeDrawer
        node={selectedNode}
        onClose={() => {
          setSelectedNode(null)
          planetRef.current?.resetCamera()
        }}
        onNavigate={handleDrawerNavigate}
        onLocate={handleLocate}
      />
    </div>
  )
}

// ── WebGL 不可用时的静态降级 ──────────────────────────────────

function WebGLFallback({ onSelectNode }: { onSelectNode: (n: KnowledgeNode) => void }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src="/planet-texture.jpg"
        alt="知识星球（静态）"
        className="absolute left-1/2 top-1/2 h-[72vh] w-[72vh] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full object-cover opacity-70"
        style={{
          maskImage: 'radial-gradient(circle, black 55%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 72%)',
        }}
      />
      {FEATURED_IDS.map((id, i) => {
        const node = NODE_MAP[id]
        const angle = (i / FEATURED_IDS.length) * Math.PI * 2
        const x = 50 + 22 * Math.cos(angle)
        const y = 50 + 22 * Math.sin(angle)
        return (
          <button
            key={id}
            onClick={() => onSelectNode(node)}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-orbit-line bg-void/80 px-3 py-1.5 backdrop-blur transition-colors hover:border-ion-cyan"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: CATEGORY_MAP[node.category].color }}
            />
            <span className="font-sans text-xs text-star-white">{node.title}</span>
          </button>
        )
      })}
    </div>
  )
}
