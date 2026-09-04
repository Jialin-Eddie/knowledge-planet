import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import NodeDrawer from '@/components/NodeDrawer'
import SectorWheel from '@/components/topics/SectorWheel'
import SectorSection from '@/components/topics/SectorSection'
import type { SectorStats } from '@/components/topics/SectorSection'
import { CATEGORIES, NODE_MAP, EDGES, nodesByCategory } from '@/data/nodes'
import type { CategoryId, KnowledgeNode } from '@/data/nodes'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

/** 各章文案与代表节点（芯片） */
const SECTOR_COPY: Record<CategoryId, { title: string; desc: string; chips: string[] }> = {
  science: {
    title: '科学 · 追问底层规则',
    desc: '从不确定性的量子到膨胀的宇宙，科学用可证伪的方式逼近真相。',
    chips: ['quantum-entanglement', 'dark-matter', 'crispr', 'second-law'],
  },
  technology: {
    title: '技术 · 工具反过来塑造人',
    desc: '每一项发明都是一次自我改造：我们造出工具，工具重新定义我们。',
    chips: ['transformer', 'turing-machine', 'tcp-ip', 'reinforcement-learning'],
  },
  humanity: {
    title: '人文 · 我们如何讲述自己',
    desc: '历史、制度与故事——人类用叙述搭建意义的脚手架。',
    chips: ['chunqiu-style', 'silk-road', 'printing-revolution', 'great-voyages'],
  },
  art: {
    title: '艺术 · 感性也是知识',
    desc: '审美不是装饰，而是一种理解世界的、先于语言的能力。',
    chips: ['impressionism', 'montage', 'ukiyo-e', 'dunhuang-murals'],
  },
  philosophy: {
    title: '哲学 · 没有标准答案的问题',
    desc: '那些两千年仍未解决的问题，恰恰是文明的操舵室。',
    chips: ['ship-of-theseus', 'allegory-of-cave', 'zhuangzi-butterfly', 'trolley-problem'],
  },
  nature: {
    title: '自然 · 生命系统的精妙',
    desc: '从菌根网络到质数周期的蝉，演化是最伟大的工程师。',
    chips: ['coral-bleaching', 'mycorrhizal-network', 'photosynthesis', 'cicada-prime'],
  },
}

function Eyebrow({ children, color = '#4DE3FF' }: { children: React.ReactNode; color?: string }) {
  return (
    <p
      className="flex items-center gap-3 font-grotesk text-[13px] font-medium uppercase tracking-[0.35em]"
      style={{ color }}
    >
      <span className="eyebrow-line" />
      {children}
    </p>
  )
}

export default function Topics() {
  const navigate = useNavigate()
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [activeSector, setActiveSector] = useState<CategoryId>('science')

  const openNode = useCallback((id: string) => {
    const n = NODE_MAP[id]
    if (n) setSelectedNode(n)
  }, [])

  const handleLocate = useCallback(
    (id: string) => {
      setSelectedNode(null)
      navigate(`/explore?focus=${id}`)
    },
    [navigate],
  )

  // 每章统计：节点数 / 涉及该域节点的连接数 / 探索热度（按引力值加权）
  const statsByCategory = useMemo(() => {
    const map = {} as Record<CategoryId, SectorStats>
    for (const cat of CATEGORIES) {
      const nodes = nodesByCategory(cat.id)
      const ids = new Set(nodes.map((n) => n.id))
      const edges = EDGES.filter(([a, b]) => ids.has(a) && ids.has(b)).length
      const gravitySum = nodes.reduce((s, n) => s + n.gravity, 0)
      const heat = Math.round((gravitySum / (nodes.length * 3)) * 100)
      map[cat.id] = { nodes: nodes.length, edges, heat }
    }
    return map
  }, [])

  const chipsByCategory = useMemo(() => {
    const map = {} as Record<CategoryId, KnowledgeNode[]>
    for (const cat of CATEGORIES) {
      map[cat.id] = SECTOR_COPY[cat.id].chips.map((id) => NODE_MAP[id]).filter(Boolean)
    }
    return map
  }, [])

  // 滚动监听：当前章节对应的锚点 pill 自动激活
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('sector-', '') as CategoryId
            setActiveSector(id)
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    for (const cat of CATEGORIES) {
      const el = document.getElementById(`sector-${cat.id}`)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  const scrollToSector = useCallback((id: CategoryId) => {
    document.getElementById(`sector-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="relative">
      {/* ════════ Section 1 · 页头 ════════ */}
      <header className="mx-auto max-w-[1280px] px-6 pt-16 lg:px-12 lg:pt-[120px]">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Eyebrow>SECTORS OF THE PLANET</Eyebrow>
            </motion.div>
            <h1 className="mt-6 font-serif text-4xl font-black leading-[1.15] tracking-[0.02em] text-star-white lg:text-[64px]">
              {['六片星区，', '六种看世界的方式'].map((phrase, pi) => (
                <span key={phrase} className="block">
                  {phrase.split('').map((ch, i) => (
                    <motion.span
                      key={`${pi}-${i}`}
                      className={cn('inline-block', pi === 1 && 'text-gradient-title')}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 + (pi * phrase.length + i) * 0.06, duration: 0.8, ease: EASE }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>
            <motion.p
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
              className="mt-6 max-w-[560px] font-sans text-base leading-[1.85] tracking-[0.02em] text-dim-star"
            >
              每个领域都是星球上的一片大陆。它们彼此遥望，也在连线中互相照亮。
            </motion.p>
          </div>

          <motion.div
            initial={{ scale: 0.8, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1.2, ease: EASE }}
            className="hidden justify-center lg:col-span-5 lg:flex"
          >
            <SectorWheel />
          </motion.div>
        </div>

        {/* 锚点导航 */}
        <motion.nav
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 1 } } }}
          className="no-scrollbar mt-14 flex gap-3 overflow-x-auto pb-2 lg:mt-20"
          aria-label="星区锚点导航"
        >
          {CATEGORIES.map((cat) => {
            const active = activeSector === cat.id
            return (
              <motion.button
                key={cat.id}
                variants={{ hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: EASE } } }}
                onClick={() => scrollToSector(cat.id)}
                className={cn(
                  'flex h-8 shrink-0 items-center gap-2 rounded-full border px-4 font-mono text-xs transition-all duration-300',
                  active ? 'text-star-white' : 'text-dim-star hover:text-star-white',
                )}
                style={{
                  borderColor: active ? cat.color : 'rgba(148,163,255,0.14)',
                  background: active ? `${cat.color}26` : 'transparent',
                }}
              >
                <span
                  className={cn('h-1.5 w-1.5 rounded-full transition-opacity', active ? 'opacity-100' : 'opacity-40')}
                  style={{ background: cat.color }}
                />
                {cat.en} · {cat.zh}
              </motion.button>
            )
          })}
        </motion.nav>
      </header>

      {/* ════════ Section 2–7 · 六大领域章节 ════════ */}
      <div className="mt-14 lg:mt-20">
        {CATEGORIES.map((cat, i) => (
          <SectorSection
            key={cat.id}
            index={i}
            category={cat}
            title={SECTOR_COPY[cat.id].title}
            description={SECTOR_COPY[cat.id].desc}
            chips={chipsByCategory[cat.id]}
            stats={statsByCategory[cat.id]}
            onOpenNode={openNode}
          />
        ))}
      </div>

      {/* ════════ Section 8 · CTA ════════ */}
      <section className="relative overflow-hidden border-t border-orbit-line">
        <img
          src="/nebula-glow-1.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/2 w-[480px] -translate-y-1/2 opacity-50"
        />
        <img
          src="/nebula-glow-2.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-40 top-1/2 w-[480px] -translate-y-1/2 opacity-50"
        />
        <div className="relative mx-auto max-w-[1280px] px-6 py-24 text-center lg:px-12 lg:py-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <Eyebrow>READY FOR ORBIT</Eyebrow>
          </motion.div>
          <motion.h2
            initial={{ y: 32, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="mt-6 font-serif text-3xl font-semibold leading-[1.2] text-star-white lg:text-[44px]"
          >
            看完图鉴，该<span className="text-gradient-title">亲自驾驶</span>了。
          </motion.h2>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
            className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row"
          >
            <Link
              to="/explore"
              className="group inline-flex items-center gap-2 border border-ion-cyan px-8 py-3.5 font-sans text-sm font-medium tracking-[0.12em] text-ion-cyan transition-all duration-400 hover:bg-ion-cyan hover:text-void"
            >
              进入星球探索器
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/"
              className="font-sans text-sm text-dim-star underline decoration-orbit-line underline-offset-8 transition-colors hover:text-star-white hover:decoration-ion-cyan"
            >
              返回首页
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════ 节点详情抽屉 ════════ */}
      <NodeDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onNavigate={openNode}
        onLocate={handleLocate}
      />
    </div>
  )
}
