import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, PanelRightClose, PanelRightOpen } from 'lucide-react'
import type { CategoryMeta, KnowledgeNode } from '@/data/nodes'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

export interface NodeGroup {
  cat: CategoryMeta
  nodes: KnowledgeNode[]
}

interface ListProps {
  groups: NodeGroup[]
  hoveredId: string | null
  selectedId: string | null
  exploredIds: ReadonlySet<string>
  onHover: (id: string | null) => void
  onPick: (id: string) => void
}

/** 分组节点列表（桌面面板与移动端抽屉共用） */
export function NodeIndexList({
  groups,
  hoveredId,
  selectedId,
  exploredIds,
  onHover,
  onPick,
}: ListProps) {
  const [openCats, setOpenCats] = useState<Set<string>>(
    () => new Set(groups[0] ? [groups[0].cat.id] : []),
  )
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const toggleCat = (id: string) =>
    setOpenCats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // 星球悬停 → 列表联动：展开所在分组并滚动到对应条目
  useEffect(() => {
    if (!hoveredId) return
    const g = groups.find((gr) => gr.nodes.some((n) => n.id === hoveredId))
    if (!g) return
    if (!openCats.has(g.cat.id)) {
      setOpenCats((prev) => new Set(prev).add(g.cat.id))
    }
    // 等待分组展开动画后滚动
    const t = setTimeout(() => {
      itemRefs.current.get(hoveredId)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 120)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredId])

  return (
    <div className="space-y-1">
      {groups.map((g) => {
        const open = openCats.has(g.cat.id)
        return (
          <div key={g.cat.id}>
            {/* 组头 */}
            <button
              onClick={() => toggleCat(g.cat.id)}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-ion-cyan/[0.04]"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: g.cat.color, boxShadow: `0 0 6px ${g.cat.color}66` }}
              />
              <span className="font-sans text-[13px] font-medium text-star-white">{g.cat.zh}</span>
              <span className="font-mono text-[10px] tracking-[0.12em] text-faint">{g.cat.en}</span>
              <span
                className="ml-auto rounded-full border px-1.5 py-px font-mono text-[10px]"
                style={{ borderColor: `${g.cat.color}55`, color: g.cat.color }}
              >
                {g.nodes.length}
              </span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-faint transition-transform duration-300',
                  open && 'rotate-180',
                )}
              />
            </button>
            {/* 组内容 */}
            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  {g.nodes.map((n, i) => {
                    const explored = exploredIds.has(n.id)
                    const hot = hoveredId === n.id || selectedId === n.id
                    return (
                      <motion.li
                        key={n.id}
                        initial={{ x: 12, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3, ease: EASE }}
                      >
                        <button
                          ref={(el) => {
                            if (el) itemRefs.current.set(n.id, el)
                            else itemRefs.current.delete(n.id)
                          }}
                          onMouseEnter={() => onHover(n.id)}
                          onMouseLeave={() => onHover(null)}
                          onClick={() => onPick(n.id)}
                          className={cn(
                            'group relative flex w-full items-center gap-2.5 py-2 pl-4 pr-3 text-left transition-colors duration-200',
                            hot ? 'bg-ion-cyan/[0.08]' : 'hover:bg-ion-cyan/[0.06]',
                          )}
                        >
                          {/* 左侧竖条 */}
                          <span
                            className={cn(
                              'absolute left-0 top-0 h-full w-[2px] bg-ion-cyan transition-opacity duration-200',
                              hot ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                            )}
                          />
                          {explored && <Check className="h-3 w-3 shrink-0 text-ion-cyan" />}
                          <span className="min-w-0">
                            <span
                              className={cn(
                                'block truncate font-sans text-sm transition-colors',
                                hot ? 'text-star-white' : 'text-dim-star group-hover:text-star-white',
                              )}
                            >
                              {n.title}
                            </span>
                            <span className="block truncate font-mono text-[10px] tracking-[0.1em] text-faint">
                              {n.enTitle}
                            </span>
                          </span>
                          <span
                            className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300"
                            style={{
                              background: explored ? '#4DE3FF' : g.cat.color,
                              boxShadow: explored ? '0 0 6px #4DE3FF' : 'none',
                            }}
                          />
                        </button>
                      </motion.li>
                    )
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )
      })}
      {groups.length === 0 && (
        <p className="px-3 py-8 text-center font-mono text-[11px] tracking-[0.15em] text-faint">
          NO MATCHES · 无命中节点
        </p>
      )}
    </div>
  )
}

interface NodeIndexProps extends ListProps {
  collapsed: boolean
  onToggle: () => void
  totalCount: number
}

/** 右侧节点索引面板：默认折叠为竖排标签，点击展开 */
export default function NodeIndex({ collapsed, onToggle, totalCount, ...listProps }: NodeIndexProps) {
  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 40 : 300 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative flex h-[70vh] max-h-[640px] flex-col overflow-hidden border border-orbit-line bg-nebula/80 backdrop-blur-[24px]"
    >
      {collapsed ? (
        <button
          onClick={onToggle}
          className="flex h-full w-full flex-col items-center justify-center gap-4 transition-colors hover:bg-ion-cyan/[0.05]"
          aria-label="展开节点索引"
        >
          <PanelRightOpen className="h-4 w-4 text-dim-star" />
          <span
            className="font-sans text-xs tracking-[0.3em] text-dim-star"
            style={{ writingMode: 'vertical-rl' }}
          >
            节点索引 · {totalCount}
          </span>
          <span className="h-8 w-px bg-gradient-to-b from-ion-cyan/60 to-transparent" />
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-orbit-line px-4 py-3">
            <div>
              <p className="font-grotesk text-[10px] font-medium uppercase tracking-[0.3em] text-ion-cyan">
                Node Index
              </p>
              <p className="mt-0.5 font-sans text-xs text-dim-star">节点索引 · {totalCount}</p>
            </div>
            <button
              onClick={onToggle}
              aria-label="收起节点索引"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-orbit-line text-dim-star transition-colors hover:border-ion-cyan hover:text-star-white"
            >
              <PanelRightClose className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div
              data-lenis-prevent
              className="no-scrollbar h-full overflow-y-auto py-2"
            >
              <NodeIndexList {...listProps} />
            </div>
            {/* 右侧 2px 渐变滚动指示 */}
            <span className="pointer-events-none absolute right-0 top-0 h-full w-[2px] bg-gradient-to-b from-ion-cyan/40 via-plasma-violet/30 to-transparent" />
          </div>
        </>
      )}
    </motion.div>
  )
}
