import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CATEGORY_MAP, NODE_MAP } from '@/data/nodes'
import type { CategoryId } from '@/data/nodes'
import { cn } from '@/lib/utils'

export interface PreviewSnapshot {
  title: string
  enTitle: string
  category: CategoryId | ''
  summary: string
  bonds: string[]
}

const DEFAULT_COLOR = '#4DE3FF'
const ARC_ANGLES = [-150, -96, -42]
const CORNERS = [
  'left-0 top-0 border-l border-t',
  'right-0 top-0 border-r border-t',
  'bottom-0 left-0 border-b border-l',
  'bottom-0 right-0 border-b border-r',
]

/** 从节点中心向外生长的短弧线 */
function arc(deg: number, r = 96) {
  const a = (deg * Math.PI) / 180
  const ex = Math.cos(a) * r
  const ey = Math.sin(a) * r
  const ca = ((deg + 24) * Math.PI) / 180
  const cx = Math.cos(ca) * r * 0.5
  const cy = Math.sin(ca) * r * 0.5
  return { d: `M 0 0 Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, ex, ey }
}

interface NodePreviewProps {
  data: PreviewSnapshot
  valid: boolean
}

/** 实时节点预览面板：分类色发光节点 + 双脉冲光环 + 轨道环 + 纽带弧线 + 铭牌 */
function NodePreview({ data, valid }: NodePreviewProps) {
  const reduced = useReducedMotion()
  const cat = data.category ? CATEGORY_MAP[data.category] : null
  const color = cat?.color ?? DEFAULT_COLOR
  const bonds = data.bonds
    .slice(0, 3)
    .map((id) => NODE_MAP[id])
    .filter(Boolean)

  return (
    <aside
      aria-label="节点实时预览"
      className="relative rounded-xl border border-orbit-line bg-nebula/70 backdrop-blur-sm"
    >
      {/* HUD 四角括线 */}
      {CORNERS.map((c) => (
        <span key={c} className={cn('pointer-events-none absolute z-10 h-4 w-4 border-ion-cyan/70', c)} />
      ))}

      {/* 面板头 */}
      <div className="flex items-center justify-between border-b border-orbit-line px-6 py-4">
        <p className="flex items-center gap-3 font-grotesk text-[11px] font-medium uppercase tracking-[0.35em] text-ion-cyan">
          <span className="eyebrow-line" />
          Live Preview · 实时预览
        </p>
        <span className="font-mono text-[10px] tracking-[0.2em] text-faint">SIM-04</span>
      </div>

      {/* 节点视窗 */}
      <div className="relative h-[320px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: 'url(/starfield-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-nebula/50 via-transparent to-nebula" />

        {/* 倾斜轨道环（12s/圈） */}
        <div
          className="absolute left-1/2 top-1/2 h-64 w-64"
          style={{ transform: 'translate(-50%, -50%) rotate(-16deg) scaleY(0.42)' }}
        >
          <motion.div
            className="relative h-full w-full rounded-full border border-orbit-line"
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <span
              className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}`, transition: 'background-color 0.4s' }}
            />
          </motion.div>
        </div>

        {/* 双脉冲光环（2.5s 循环） */}
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-20 w-20 rounded-full border"
            style={{ x: '-50%', y: '-50%', borderColor: color, transition: 'border-color 0.4s' }}
            animate={reduced ? { opacity: 0.15, scale: 1 } : { scale: [0.5, 1.9], opacity: [0.7, 0] }}
            transition={reduced ? undefined : { duration: 2.5, repeat: Infinity, delay: i * 1.25, ease: 'easeOut' }}
          />
        ))}

        {/* 节点光点 */}
        <span
          className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 18px ${color}, 0 0 56px ${color}66`,
            transition: 'background-color 0.4s, box-shadow 0.4s',
          }}
        />

        {/* 引力纽带弧线（dash 绘制动画） */}
        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
          width="0"
          height="0"
          aria-hidden="true"
        >
          {bonds.map((b, i) => {
            const { d, ex, ey } = arc(ARC_ANGLES[i % ARC_ANGLES.length])
            const bc = CATEGORY_MAP[b.category].color
            return (
              <g key={b.id}>
                <motion.path
                  d={d}
                  fill="none"
                  stroke={bc}
                  strokeWidth={1.2}
                  strokeDasharray="3 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.85 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.08 }}
                />
                <motion.circle
                  cx={ex}
                  cy={ey}
                  r={3}
                  fill={bc}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.3 }}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* 预览铭牌 */}
      <div className="border-t border-orbit-line px-6 py-6 text-center">
        <h3
          className={cn(
            'font-serif text-2xl font-semibold leading-snug tracking-[0.01em]',
            data.title.trim() ? 'text-star-white' : 'text-faint',
          )}
        >
          {data.title.trim() || '未命名节点'}
        </h3>
        <p className="mt-1.5 font-mono text-xs tracking-[0.15em] text-faint">
          {data.enTitle.trim() || 'UNTITLED NODE'}
        </p>
        <div className="mt-4 flex justify-center">
          {cat ? (
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.15em]"
              style={{ borderColor: `${color}88`, color, backgroundColor: `${color}10` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
              {cat.zh} · {cat.en}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-orbit-line px-3.5 py-1.5 font-mono text-[11px] tracking-[0.15em] text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-faint" />
              未选择星区
            </span>
          )}
        </div>
        <p className="mx-auto mt-4 min-h-[3.4rem] max-w-[320px] font-sans text-sm leading-[1.7] text-dim-star">
          {data.summary.trim()
            ? [...data.summary.trim()].slice(0, 60).join('') + ([...data.summary.trim()].length > 60 ? '…' : '')
            : '摘要将显示在这里…'}
        </p>
        {bonds.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {bonds.map((b) => {
              const bc = CATEGORY_MAP[b.category].color
              return (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-dim-star"
                  style={{ borderColor: `${bc}55` }}
                >
                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: bc }} />
                  {b.title}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* 状态行 */}
      <div className="flex items-center justify-between border-t border-orbit-line px-6 py-3.5">
        <span
          className={cn(
            'flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] transition-colors duration-500',
            valid ? 'text-aurora-green' : 'text-faint',
          )}
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: valid ? '#5CFFC0' : '#4A4F74' }}
            animate={reduced ? undefined : { opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {valid ? 'READY FOR ORBIT ✓' : 'AWAITING LAUNCH…'}
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-faint">
          {data.bonds.length} LINKS
        </span>
      </div>
    </aside>
  )
}

export default memo(NodePreview)
