import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import type { CategoryMeta, KnowledgeNode } from '@/data/nodes'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

export interface SectorStats {
  nodes: number
  edges: number
  heat: number // 0–100
}

interface SectorSectionProps {
  index: number // 0-based
  category: CategoryMeta
  title: string
  description: string
  chips: KnowledgeNode[]
  stats: SectorStats
  onOpenNode: (id: string) => void
}

/** 迷你节点芯片：分类色光点 + 节点名，点击打开 NodeDrawer */
function NodeChip({
  node,
  color,
  delay,
  onOpen,
}: {
  node: KnowledgeNode
  color: string
  delay: number
  onOpen: (id: string) => void
}) {
  return (
    <motion.button
      initial={{ y: 16, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      onClick={() => onOpen(node.id)}
      className="group flex items-center gap-2.5 rounded-full border border-orbit-line bg-nebula/50 py-2 pl-3.5 pr-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-nebula"
      style={{ ['--chip-color' as string]: color }}
    >
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-60 chip-pulse"
          style={{ background: color }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
      </span>
      <span className="font-sans text-sm text-dim-star transition-colors duration-300 group-hover:text-star-white">
        {node.title}
      </span>
    </motion.button>
  )
}

export default function SectorSection({
  index,
  category,
  title,
  description,
  chips,
  stats,
  onOpenNode,
}: SectorSectionProps) {
  const reversed = index % 2 === 1
  const num = String(index + 1).padStart(2, '0')
  const [imgError, setImgError] = useState(false)
  const reduced = useReducedMotion()

  // 章节编号 parallax（随滚动 ±40px）
  const secRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: secRef, offset: ['start end', 'end start'] })
  const numY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40])

  const wipeFrom = reversed ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'

  return (
    <section
      ref={secRef}
      id={`sector-${category.id}`}
      className="relative scroll-mt-[72px] border-t border-orbit-line"
    >
      {/* 章节编号（描边大字，parallax） */}
      <motion.span
        aria-hidden
        style={{
          y: numY,
          WebkitTextStroke: `1px ${category.color}`,
          color: 'transparent',
        }}
        className={cn(
          'pointer-events-none absolute top-10 font-mono text-[64px] font-bold leading-none opacity-20 lg:text-[96px]',
          reversed ? 'right-6 lg:right-12' : 'left-6 lg:left-12',
        )}
      >
        {num}
      </motion.span>

      <div className="mx-auto max-w-[1280px] px-6 py-[72px] lg:px-12 lg:py-[120px]">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* 封面图（7 列） */}
          <motion.div
            initial={{ clipPath: wipeFrom }}
            whileInView={{ clipPath: 'inset(0 0% 0 0%)' }}
            viewport={{ once: true, margin: '-25% 0px' }}
            transition={{ duration: 1, ease: EASE }}
            className={cn('lg:col-span-7', reversed && 'lg:order-2')}
          >
            <div
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border transition-all duration-500"
              style={{ borderColor: `${category.color}4D` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${category.color}CC`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${category.color}4D`
              }}
            >
              {imgError ? (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${category.color}33 0%, #131832 70%)`,
                  }}
                />
              ) : (
                <motion.img
                  src={category.cover}
                  alt={`${category.zh}星区封面`}
                  loading="lazy"
                  onError={() => setImgError(true)}
                  initial={{ scale: 1.15 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: '-25% 0px' }}
                  transition={{ duration: 1.4, ease: EASE }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              {/* 20% 深色渐变罩 */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/60 via-transparent to-void/20" />
              {/* Mono 角标 */}
              <span className="absolute bottom-4 left-4 font-mono text-[11px] tracking-[0.25em] text-star-white/80 transition-opacity group-hover:animate-pulse">
                SECTOR {num} / 06
              </span>
              <span
                className="absolute right-4 top-4 font-mono text-[10px] tracking-[0.3em]"
                style={{ color: category.color }}
              >
                {category.en}
              </span>
            </div>
          </motion.div>

          {/* 文字区（5 列） */}
          <div className={cn('lg:col-span-5', reversed && 'lg:order-1')}>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-25% 0px' }}
              transition={{ staggerChildren: 0.08 }}
            >
              <motion.div
                variants={{ hidden: { y: 32, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } } }}
                className="flex items-center gap-4"
              >
                <span
                  className="inline-flex h-7 items-center gap-2 rounded-full border px-3 font-mono text-xs"
                  style={{ borderColor: category.color, color: category.color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: category.color }} />
                  {category.zh}
                </span>
                <span className="font-grotesk text-[13px] font-medium uppercase tracking-[0.35em] text-faint">
                  {category.en}
                </span>
              </motion.div>

              <motion.h2
                variants={{ hidden: { y: 32, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } } }}
                className="mt-6 font-serif text-[30px] font-semibold leading-[1.2] tracking-[0.01em] text-star-white lg:text-[44px]"
              >
                {title}
              </motion.h2>

              <motion.p
                variants={{ hidden: { y: 32, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } } }}
                className="mt-5 font-sans text-[15px] leading-[1.85] tracking-[0.02em] text-dim-star lg:text-base"
              >
                {description}
              </motion.p>

              {/* 三项数据 */}
              <motion.div
                variants={{ hidden: { y: 32, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } } }}
                className="mt-8 flex gap-10 border-t border-orbit-line pt-6"
              >
                {[
                  { v: String(stats.nodes), l: '节点 NODES' },
                  { v: String(stats.edges), l: '连接 EDGES' },
                  { v: `${stats.heat}%`, l: '热度 HEAT' },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-grotesk text-[28px] font-bold leading-none text-star-white">
                      {s.v}
                    </div>
                    <div className="mt-2 font-mono text-[11px] tracking-[0.2em] text-faint">{s.l}</div>
                  </div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                variants={{ hidden: { y: 32, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } } }}
                className="mt-9"
              >
                <Link
                  to={`/explore?sector=${category.id}`}
                  className="group relative inline-flex items-center gap-2 border px-6 py-3 font-sans text-sm font-medium tracking-[0.12em] transition-colors duration-400"
                  style={{ borderColor: category.color, color: category.color }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = category.color
                    e.currentTarget.style.color = '#05060F'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = category.color
                  }}
                >
                  在星球中查看该星区
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </motion.div>

              {/* 代表节点芯片 */}
              <motion.div
                variants={{ hidden: { y: 32, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } } }}
                className="mt-10"
              >
                <p className="mb-4 font-mono text-[11px] tracking-[0.25em] text-faint">
                  代表节点 · FEATURED NODES
                </p>
                <div className="flex flex-wrap gap-3">
                  {chips.map((n, i) => (
                    <NodeChip key={n.id} node={n} color={category.color} delay={i * 0.06} onOpen={onOpenNode} />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        .chip-pulse { animation: chip-breathe 2.5s ease-in-out infinite; }
        @keyframes chip-breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(2); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .chip-pulse { animation: none; }
        }
      `}</style>
    </section>
  )
}
