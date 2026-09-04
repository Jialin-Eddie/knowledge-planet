import { useId } from 'react'
import { motion } from 'framer-motion'
import { Search, RotateCcw } from 'lucide-react'
import { CATEGORIES } from '@/data/nodes'
import type { CategoryId } from '@/data/nodes'
import { cn } from '@/lib/utils'

export type ViewMode = 'free' | 'cluster' | 'focus'

const VIEW_MODES: { id: ViewMode; zh: string; en: string }[] = [
  { id: 'free', zh: '自由模式', en: 'FREE' },
  { id: 'cluster', zh: '分类聚合', en: 'CLUSTER' },
  { id: 'focus', zh: '关联聚焦', en: 'FOCUS' },
]

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.1 + i * 0.06, duration: 0.5, ease: EASE },
  }),
}

interface ControlDeckProps {
  query: string
  onQueryChange: (q: string) => void
  /** 搜索/筛选命中数；query 为空时展示总节点数 */
  matchCount: number
  totalCount: number
  activeCats: ReadonlySet<CategoryId>
  onToggleCat: (id: CategoryId) => void
  counts: Record<CategoryId, number>
  viewMode: ViewMode
  onViewModeChange: (m: ViewMode) => void
  /** 关联聚焦模式下尚未选中节点 */
  focusNeedsSelection: boolean
  onResetView: () => void
}

/** 左侧控制面板：搜索 + 分类筛选 + 视图模式 */
export default function ControlDeck({
  query,
  onQueryChange,
  matchCount,
  totalCount,
  activeCats,
  onToggleCat,
  counts,
  viewMode,
  onViewModeChange,
  focusNeedsSelection,
  onResetView,
}: ControlDeckProps) {
  const uid = useId()
  const searching = query.trim().length > 0

  return (
    <div className="relative w-[280px] border border-orbit-line bg-nebula/80 p-5 backdrop-blur-[24px]">
      {/* 四角 HUD 括线 */}
      <span className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-ion-cyan/70" />
      <span className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-ion-cyan/70" />
      <span className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-ion-cyan/70" />
      <span className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-ion-cyan/70" />

      {/* 标题行 */}
      <motion.div custom={0} variants={itemVariants} initial="hidden" animate="show">
        <p className="flex items-center gap-3 font-grotesk text-[11px] font-medium uppercase tracking-[0.35em] text-ion-cyan">
          <span className="eyebrow-line" />
          Control Deck
        </p>
        <h2 className="mt-2 font-serif text-[22px] font-bold text-star-white">控制台</h2>
      </motion.div>

      {/* 搜索框 */}
      <motion.div custom={1} variants={itemVariants} initial="hidden" animate="show" className="mt-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="搜索节点…"
            className="h-10 w-full border border-orbit-line bg-void/70 pl-9 pr-3 font-sans text-sm text-star-white placeholder:text-faint focus:border-ion-cyan/60 focus:outline-none"
          />
        </div>
        <p
          className={cn(
            'mt-2 font-mono text-[11px] tracking-[0.15em]',
            searching ? 'text-ion-cyan' : 'text-faint',
          )}
        >
          {searching ? `${matchCount} MATCHES` : `${totalCount} NODES`}
        </p>
      </motion.div>

      {/* 分类筛选器 */}
      <motion.div custom={2} variants={itemVariants} initial="hidden" animate="show" className="mt-3">
        <p className="mb-2.5 font-mono text-[10px] tracking-[0.25em] text-faint">分类筛选 · DOMAINS</p>
        <ul className="space-y-1.5">
          {CATEGORIES.map((c) => {
            const active = activeCats.has(c.id)
            return (
              <li key={c.id}>
                <button
                  onClick={() => onToggleCat(c.id)}
                  className={cn(
                    'flex h-8 w-full items-center gap-2.5 rounded-full border px-3 transition-all duration-300',
                    active ? 'border-transparent' : 'border-orbit-line hover:border-dim-star/50',
                  )}
                  style={active ? { background: `${c.color}26` } : undefined}
                  aria-pressed={active}
                >
                  <span
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full transition-all duration-300',
                      active ? 'opacity-100' : 'opacity-40',
                    )}
                    style={{
                      background: c.color,
                      boxShadow: active ? `0 0 8px ${c.color}` : 'none',
                    }}
                  />
                  <span
                    className={cn(
                      'font-sans text-xs transition-colors',
                      active ? 'text-star-white' : 'text-dim-star',
                    )}
                  >
                    {c.zh}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.12em] text-faint">{c.en}</span>
                  <span
                    className={cn(
                      'ml-auto font-mono text-[11px] transition-colors',
                      active ? 'text-star-white' : 'text-faint',
                    )}
                  >
                    {counts[c.id]}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </motion.div>

      {/* 视图模式切换 */}
      <motion.div custom={3} variants={itemVariants} initial="hidden" animate="show" className="mt-5">
        <p className="mb-2.5 font-mono text-[10px] tracking-[0.25em] text-faint">视图模式 · VIEW</p>
        <div className="relative flex border border-orbit-line">
          {VIEW_MODES.map((m) => {
            const active = viewMode === m.id
            return (
              <button
                key={m.id}
                onClick={() => onViewModeChange(m.id)}
                className={cn(
                  'relative flex-1 px-1 py-2 font-sans text-[11px] transition-colors duration-300',
                  active ? 'text-ion-cyan' : 'text-dim-star hover:text-star-white',
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`vm-pill-${uid}`}
                    className="absolute inset-0 border border-ion-cyan/40 bg-ion-cyan/10"
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                )}
                <span className="relative">{m.zh}</span>
              </button>
            )
          })}
        </div>
        {viewMode === 'focus' && focusNeedsSelection && (
          <p className="mt-2 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-faint">
            ※ 先选中一个节点，再聚焦其两度关联
          </p>
        )}
      </motion.div>

      {/* 重置按钮 */}
      <motion.div custom={4} variants={itemVariants} initial="hidden" animate="show" className="mt-5">
        <button
          onClick={onResetView}
          className="group flex items-center gap-2 font-sans text-xs text-dim-star underline decoration-orbit-line underline-offset-8 transition-colors hover:text-ion-cyan hover:decoration-ion-cyan"
        >
          <RotateCcw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" />
          重置视角
        </button>
      </motion.div>
    </div>
  )
}
