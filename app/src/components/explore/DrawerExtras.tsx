import { motion } from 'framer-motion'
import { MoveRight } from 'lucide-react'
import { CATEGORY_MAP, NODE_MAP } from '@/data/nodes'
import type { KnowledgeNode } from '@/data/nodes'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.12 + i * 0.06, duration: 0.45, ease: EASE },
  }),
}

interface DrawerExtrasProps {
  /** 本次会话已访问节点序列 */
  path: string[]
  currentId: string
  onJump: (id: string) => void
  recommendation: KnowledgeNode | null
  onFly: (id: string) => void
}

/** 探索页抽屉增强：探索路径迷你时间线 + 下一颗推荐 */
export default function DrawerExtras({
  path,
  currentId,
  onJump,
  recommendation,
  onFly,
}: DrawerExtrasProps) {
  return (
    <>
      {/* 探索路径 */}
      {path.length > 1 && (
        <motion.div custom={6.5} variants={itemVariants} initial="hidden" animate="show" className="mt-9">
          <h3 className="mb-4 font-mono text-xs tracking-[0.25em] text-faint">
            探索路径 · TRAJECTORY
          </h3>
          <div className="flex flex-wrap items-center gap-y-3">
            {path.map((id, i) => {
              const n = NODE_MAP[id]
              if (!n) return null
              const color = CATEGORY_MAP[n.category].color
              const isCurrent = id === currentId
              return (
                <span key={`${id}-${i}`} className="flex items-center">
                  {i > 0 && <span className="mx-1.5 h-px w-3 bg-orbit-line" />}
                  <button
                    onClick={() => onJump(id)}
                    title={n.title}
                    aria-label={`跳回节点：${n.title}`}
                    className={cn(
                      'h-2.5 w-2.5 rounded-full transition-transform duration-300 hover:scale-150',
                      isCurrent && 'scale-125',
                    )}
                    style={{
                      background: color,
                      boxShadow: isCurrent ? `0 0 10px ${color}` : `0 0 4px ${color}55`,
                      opacity: isCurrent ? 1 : 0.55,
                    }}
                  />
                </span>
              )
            })}
          </div>
          <p className="mt-3 font-mono text-[10px] tracking-[0.15em] text-faint">
            {path.length} STOPS · 点击任意点跳回
          </p>
        </motion.div>
      )}

      {/* 下一颗推荐 */}
      {recommendation && (
        <motion.div custom={6.8} variants={itemVariants} initial="hidden" animate="show" className="mt-9">
          <h3 className="mb-4 font-mono text-xs tracking-[0.25em] text-faint">
            下一颗推荐 · NEXT NODE
          </h3>
          <button
            onClick={() => onFly(recommendation.id)}
            className="group flex w-full items-center gap-3 border border-orbit-line bg-nebula/60 px-4 py-3.5 text-left transition-all duration-300 hover:border-ion-cyan/60 hover:shadow-[0_0_24px_rgba(77,227,255,0.12)]"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background: CATEGORY_MAP[recommendation.category].color,
                boxShadow: `0 0 8px ${CATEGORY_MAP[recommendation.category].color}88`,
              }}
            />
            <span className="min-w-0">
              <span className="block truncate font-sans text-sm text-star-white">
                {recommendation.title}
              </span>
              <span className="block truncate font-mono text-[10px] tracking-[0.12em] text-faint">
                {recommendation.enTitle}
              </span>
            </span>
            <MoveRight className="ml-auto h-4 w-4 shrink-0 text-ion-cyan transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.div>
      )}
    </>
  )
}
