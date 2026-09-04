import { motion } from 'framer-motion'

function Flash({ children, className }: { children: string | number; className?: string }) {
  return (
    <motion.span
      key={String(children)}
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 1, 0.3, 1] }}
      transition={{ duration: 0.8, times: [0, 0.35, 0.6, 1] }}
      className={className}
    >
      {children}
    </motion.span>
  )
}

interface StatusBarProps {
  modeLabel: string
  filterLabel: string
  explored: number
  total: number
}

/** 底部状态栏：遥测 + 操作提示 */
export default function StatusBar({ modeLabel, filterLabel, explored, total }: StatusBarProps) {
  return (
    <div className="flex h-9 items-center justify-between gap-4 border-t border-orbit-line bg-void/70 px-4 font-mono text-[11px] tracking-[0.12em] text-dim-star backdrop-blur lg:px-8">
      <span className="shrink-0">
        MODE: <Flash className="text-star-white">{modeLabel}</Flash>
        <span className="mx-2 text-faint">·</span>
        FILTER: <Flash className="text-star-white">{filterLabel}</Flash>
      </span>
      <span className="hidden sm:block">
        已探索 <Flash className="text-ion-cyan">{explored}</Flash>
        <span className="text-faint"> / {total} 节点</span>
      </span>
      <span className="hidden text-faint md:block">拖拽旋转 · 滚轮缩放 · 点击节点查看详情</span>
    </div>
  )
}
