import { useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

/**
 * 理念叙事区 —— 「为什么是一个星球」
 * pin 180vh，scrub 0.8：左侧大引文随进度切换（A→B→C），
 * 右侧纯 SVG 迷你演示：散点漂浮 → 连线生长 → 收拢成球并开始自转。
 * prefers-reduced-motion 时降级为三段静态图文纵排。
 */

const QUOTES = [
  { phase: 'PHASE 01 — SCATTER', text: '书架是线性的，' },
  { phase: 'PHASE 02 — WEAVE', text: '但思想从不排队。' },
  { phase: 'PHASE 03 — ORBIT', text: '它绕着自己的引力旋转。' },
]

const VB = 400
const CX = VB / 2
const CY = VB / 2
const SPHERE_R = 112
const DOT_COUNT = 40
const LINE_COUNT = 26

/** 确定性伪随机（避免每次渲染布局跳动） */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Dot {
  sx: number // 散点位
  sy: number
  fx: number // 成球位（斐波那契球面投影）
  fy: number
  r: number
  driftDur: number
  driftDelay: number
}

interface Line {
  x1: number
  y1: number
  x2: number
  y2: number
}

function useStoryGeometry() {
  return useMemo(() => {
    const rand = mulberry32(20250917)
    const dots: Dot[] = []
    for (let i = 0; i < DOT_COUNT; i++) {
      // 散点：环形随机分布
      const a = rand() * Math.PI * 2
      const d = 55 + rand() * 120
      const sx = CX + Math.cos(a) * d
      const sy = CY + Math.sin(a) * d * 0.92
      // 成球：斐波那契球面投影（轻微压扁暗示体积）
      const y = 1 - (i / (DOT_COUNT - 1)) * 2
      const rr = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = i * 2.399963
      const fx = CX + SPHERE_R * rr * Math.cos(theta)
      const fy = CY + SPHERE_R * y * 0.94
      dots.push({
        sx,
        sy,
        fx,
        fy,
        r: 1.6 + rand() * 1.6,
        driftDur: 2.4 + rand() * 1.8,
        driftDelay: -rand() * 4,
      })
    }
    const lines: Line[] = []
    for (let i = 0; i < LINE_COUNT; i++) {
      const a = dots[i]
      const b = dots[(i * 7 + 5) % DOT_COUNT]
      lines.push({ x1: a.fx, y1: a.fy, x2: b.fx, y2: b.fy })
    }
    return { dots, lines }
  }, [])
}

export default function OrbitStory({ reduced }: { reduced: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const { dots, lines } = useStoryGeometry()

  useGSAP(
    () => {
      if (reduced) return
      const q = gsap.utils.selector(wrapRef)

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: wrapRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      })

      // 引文 A → B → C
      tl.fromTo(q('.story-quote-0'), { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.08 }, 0)
        .to(q('.story-quote-0'), { opacity: 0, y: -24, duration: 0.06 }, 0.26)
        .fromTo(q('.story-quote-1'), { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.08 }, 0.33)
        .to(q('.story-quote-1'), { opacity: 0, y: -24, duration: 0.06 }, 0.58)
        .fromTo(q('.story-quote-2'), { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.08 }, 0.66)

      // 阶段标签同步切换
      tl.fromTo(q('.story-phase-0'), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0)
        .to(q('.story-phase-0'), { opacity: 0, duration: 0.04 }, 0.27)
        .fromTo(q('.story-phase-1'), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.34)
        .to(q('.story-phase-1'), { opacity: 0, duration: 0.04 }, 0.59)
        .fromTo(q('.story-phase-2'), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.67)

      // 连线生长（dash-offset 逐条绘制）
      tl.fromTo(
        q('.story-line'),
        { strokeDashoffset: 1, opacity: 0.55 },
        { strokeDashoffset: 0, duration: 0.05, stagger: 0.008, ease: 'power1.out' },
        0.35,
      )

      // 收拢成球：散点位 → 球面位
      tl.fromTo(
        q('.story-dot'),
        { x: (i: number) => dots[i].sx - dots[i].fx, y: (i: number) => dots[i].sy - dots[i].fy },
        { x: 0, y: 0, duration: 0.26, ease: 'power2.inOut', stagger: 0.002 },
        0.68,
      )
      // 连线收敛变淡
      tl.to(q('.story-line'), { opacity: 0.18, duration: 0.18 }, 0.74)
      // 球体轮廓与轨道环显现（随后持续自转，CSS 驱动）
      tl.fromTo(q('.story-sphere'), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.1, ease: 'power1.out', transformOrigin: '50% 50%' }, 0.88)
    },
    { scope: wrapRef, dependencies: [reduced] },
  )

  if (reduced) {
    return <StaticStory dots={dots} lines={lines} />
  }

  return (
    <div ref={wrapRef} className="relative" style={{ height: '180vh' }}>
      <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 px-6 lg:grid-cols-12 lg:px-12">
          {/* 左：引文切换 */}
          <div className="lg:col-span-6">
            <div className="relative h-6">
              {QUOTES.map((qt, i) => (
                <p
                  key={qt.phase}
                  className={`story-phase-${i} absolute inset-0 font-mono text-[11px] tracking-[0.3em] text-faint opacity-0`}
                >
                  {qt.phase}
                </p>
              ))}
            </div>
            <div className="relative mt-6 h-[180px] lg:h-[220px]">
              {QUOTES.map((qt, i) => (
                <p
                  key={qt.text}
                  className={`story-quote-${i} absolute inset-0 font-serif text-[34px] font-black leading-[1.3] text-star-white opacity-0 lg:text-[56px]`}
                >
                  {i === 2 ? (
                    <>
                      它绕着自己的<span className="text-ion-cyan">引力</span>旋转。
                    </>
                  ) : (
                    qt.text
                  )}
                </p>
              ))}
            </div>
            <p className="mt-4 max-w-[420px] font-sans text-[15px] leading-[1.85] text-dim-star">
              向下滚动，看散落的知识点如何被引力编织成一颗星球。
            </p>
          </div>

          {/* 右：迷你演示 */}
          <div className="relative lg:col-span-6">
            <div className="relative mx-auto aspect-square max-w-[520px] border border-orbit-line bg-deep-space/40">
              {/* HUD 角标 */}
              <span className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.25em] text-faint">
                FIG.01 — THOUGHT GRAVITY
              </span>
              <span className="absolute bottom-3 right-3 font-mono text-[10px] tracking-[0.25em] text-faint">
                SCRUB 0.8
              </span>
              <span aria-hidden className="absolute -left-px -top-px h-4 w-4 border-l border-t border-ion-cyan/60" />
              <span aria-hidden className="absolute -right-px -top-px h-4 w-4 border-r border-t border-ion-cyan/60" />
              <span aria-hidden className="absolute -bottom-px -left-px h-4 w-4 border-b border-l border-ion-cyan/60" />
              <span aria-hidden className="absolute -bottom-px -right-px h-4 w-4 border-b border-r border-ion-cyan/60" />

              <svg viewBox={`0 0 ${VB} ${VB}`} className="h-full w-full" role="img" aria-label="散点连结成球的演示">
                {/* 球体轮廓 + 轨道环（成球阶段显现，持续自转） */}
                <g className="story-sphere opacity-0">
                  <circle cx={CX} cy={CY} r={SPHERE_R} fill="none" stroke="#4DE3FF" strokeOpacity={0.5} strokeWidth={1} />
                  <circle cx={CX} cy={CY} r={SPHERE_R * 0.72} fill="none" stroke="#8B7CFF" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="2 6" />
                  <g className="story-ring-spin" style={{ transformOrigin: `${CX}px ${CY}px` }}>
                    <ellipse cx={CX} cy={CY} rx={SPHERE_R * 1.35} ry={SPHERE_R * 0.42} fill="none" stroke="#4DE3FF" strokeOpacity={0.35} strokeWidth={1} transform={`rotate(-23 ${CX} ${CY})`} />
                    <ellipse cx={CX} cy={CY} rx={SPHERE_R * 1.55} ry={SPHERE_R * 0.5} fill="none" stroke="#8B7CFF" strokeOpacity={0.2} strokeWidth={1} transform={`rotate(18 ${CX} ${CY})`} />
                  </g>
                </g>

                {/* 连线（初始 dashoffset 1 = 未绘制） */}
                {lines.map((l, i) => (
                  <line
                    key={`l-${i}`}
                    className="story-line"
                    x1={l.x1}
                    y1={l.y1}
                    x2={l.x2}
                    y2={l.y2}
                    stroke="#4DE3FF"
                    strokeWidth={1}
                    opacity={0}
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1}
                  />
                ))}

                {/* 散点（markup 停在成球位；GSAP 负责偏移到散点位并收拢） */}
                {dots.map((d, i) => (
                  <g key={`d-${i}`} className="story-dot">
                    <circle
                      cx={d.fx}
                      cy={d.fy}
                      r={d.r}
                      fill={i % 5 === 0 ? '#8B7CFF' : '#4DE3FF'}
                      className="story-drift"
                      style={{ animationDuration: `${d.driftDur}s`, animationDelay: `${d.driftDelay}s` }}
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .story-drift { animation: story-drift 3s ease-in-out infinite alternate; }
        @keyframes story-drift {
          from { transform: translate(0, 0); }
          to { transform: translate(4px, -5px); }
        }
        .story-ring-spin { animation: story-ring-rotate 12s linear infinite; }
        @keyframes story-ring-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/** 降级：三段静态图文纵排 */
function StaticStory({ dots, lines }: { dots: Dot[]; lines: Line[] }) {
  return (
    <div className="mx-auto max-w-[760px] space-y-16 px-6 py-20">
      {QUOTES.map((qt, i) => (
        <div key={qt.phase}>
          <p className="font-mono text-[11px] tracking-[0.3em] text-faint">{qt.phase}</p>
          <p className="mt-4 font-serif text-3xl font-black leading-[1.3] text-star-white">{qt.text}</p>
          <svg viewBox={`0 0 ${VB} ${VB}`} className="mt-6 aspect-[2/1] w-full border border-orbit-line bg-deep-space/40" role="img" aria-label={qt.phase}>
            {i >= 1 &&
              lines.map((l, j) => (
                <line key={j} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#4DE3FF" strokeOpacity={0.35} strokeWidth={1} />
              ))}
            {i === 2 && (
              <circle cx={CX} cy={CY} r={SPHERE_R} fill="none" stroke="#4DE3FF" strokeOpacity={0.5} strokeWidth={1} />
            )}
            {dots.map((d, j) => (
              <circle
                key={j}
                cx={i === 0 ? d.sx : d.fx}
                cy={i === 0 ? d.sy : d.fy}
                r={d.r}
                fill={j % 5 === 0 ? '#8B7CFF' : '#4DE3FF'}
              />
            ))}
          </svg>
        </div>
      ))}
    </div>
  )
}
