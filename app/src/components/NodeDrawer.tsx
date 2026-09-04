import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NODE_MAP, CATEGORY_MAP } from '@/data/nodes'
import type { KnowledgeNode } from '@/data/nodes'

interface NodeDrawerProps {
  node: KnowledgeNode | null
  onClose: () => void
  /** 点击关联节点：切换到另一个节点 */
  onNavigate: (id: string) => void
  /** 底部「在星球中定位」 */
  onLocate?: (id: string) => void
  /** 探索页扩展（可选）：插入在「延伸阅读」与底部按钮之间的额外区块 */
  extraSections?: ReactNode
}

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.12 + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function NodeDrawer({ node, onClose, onNavigate, onLocate, extraSections }: NodeDrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[60] bg-void/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            className="fixed inset-y-0 right-0 z-[70] flex w-full flex-col overflow-y-auto border-l border-ion-cyan/60 bg-deep-space shadow-[0_0_60px_rgba(77,227,255,0.12)] sm:w-[440px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label={`节点详情：${node.title}`}
          >
            <DrawerBody node={node} onClose={onClose} onNavigate={onNavigate} onLocate={onLocate} extraSections={extraSections} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function DrawerBody({
  node,
  onClose,
  onNavigate,
  onLocate,
  extraSections,
}: {
  node: KnowledgeNode
  onClose: () => void
  onNavigate: (id: string) => void
  onLocate?: (id: string) => void
  extraSections?: ReactNode
}) {
  const cat = CATEGORY_MAP[node.category]
  const index = String(
    Object.values(NODE_MAP).findIndex((n) => n.id === node.id) + 1,
  ).padStart(3, '0')
  const related = node.related
    .map((id) => NODE_MAP[id])
    .filter(Boolean)

  return (
    <div className="flex flex-1 flex-col px-8 py-10">
      {/* 头部：分类胶囊 + 编号 + 关闭 */}
      <motion.div custom={0} variants={itemVariants} initial="hidden" animate="show" className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-7 items-center gap-2 rounded-full border px-3 font-mono text-xs"
            style={{ borderColor: cat.color, color: cat.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
            {cat.en} · {cat.zh}
          </span>
          <span className="font-mono text-xs tracking-[0.2em] text-faint">NODE-{index}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="关闭"
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-orbit-line text-dim-star transition-colors hover:border-ion-cyan hover:text-star-white"
        >
          <span className="text-lg leading-none transition-transform duration-300 group-hover:rotate-90">✕</span>
        </button>
      </motion.div>

      {/* 标题 */}
      <motion.h2 custom={1} variants={itemVariants} initial="hidden" animate="show" className="mt-8 font-serif text-[32px] font-black leading-tight text-star-white">
        {node.title}
      </motion.h2>
      <motion.p custom={2} variants={itemVariants} initial="hidden" animate="show" className="mt-2 font-grotesk text-sm tracking-[0.08em] text-dim-star">
        {node.enTitle}
      </motion.p>

      <motion.div custom={3} variants={itemVariants} initial="hidden" animate="show" className="my-7 h-px w-full bg-orbit-line" />

      {/* 摘要 */}
      <motion.p custom={4} variants={itemVariants} initial="hidden" animate="show" className="font-sans text-[15px] leading-[1.9] text-dim-star">
        {node.summary}
      </motion.p>

      {/* 引力纽带 */}
      <motion.div custom={5} variants={itemVariants} initial="hidden" animate="show" className="mt-9">
        <h3 className="mb-4 font-mono text-xs tracking-[0.25em] text-faint">引力纽带 · GRAVITY LINKS</h3>
        <ul className="space-y-1">
          {related.map((r) => {
            const rc = CATEGORY_MAP[r.category]
            return (
              <li key={r.id}>
                <button
                  onClick={() => onNavigate(r.id)}
                  className="group flex w-full items-center gap-3 rounded px-2 py-2.5 text-left transition-colors hover:bg-nebula"
                >
                  <span className="font-mono text-sm text-ion-cyan opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2">
                    →
                  </span>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: rc.color }} />
                  <span className="font-sans text-sm text-star-white">{r.title}</span>
                  <span className="ml-auto font-mono text-[10px] tracking-[0.15em] text-faint">{rc.en}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </motion.div>

      {/* 延伸阅读 */}
      <motion.div custom={6} variants={itemVariants} initial="hidden" animate="show" className="mt-9">
        <h3 className="mb-4 font-mono text-xs tracking-[0.25em] text-faint">延伸阅读 · FURTHER READING</h3>
        <ul className="space-y-2.5">
          {node.furtherReading.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-baseline gap-2 font-sans text-sm text-dim-star transition-colors hover:text-ion-cyan"
              >
                <span className="font-mono text-xs text-ion-cyan">↗</span>
                <span className="underline decoration-orbit-line underline-offset-4 group-hover:decoration-ion-cyan">
                  {r.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* 页面自定义扩展区块（如探索页的探索路径/推荐） */}
      {extraSections}

      {/* 底部按钮 */}
      <motion.div custom={7} variants={itemVariants} initial="hidden" animate="show" className="mt-auto pt-10">
        <button
          onClick={() => onLocate?.(node.id)}
          className="w-full border border-ion-cyan py-3 font-sans text-sm font-medium tracking-[0.12em] text-ion-cyan transition-all duration-400 hover:bg-ion-cyan hover:text-void"
        >
          在星球中定位 ⌖
        </button>
      </motion.div>
    </div>
  )
}
