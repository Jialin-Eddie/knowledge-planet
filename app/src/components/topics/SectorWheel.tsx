import { useState } from 'react'
import { CATEGORIES } from '@/data/nodes'

/**
 * 六瓣星区图：一个圆被 6 条径向线均分，每瓣用分类色低透明填充，
 * 20s/圈缓转；hover 某瓣时该瓣提亮，顶部固定显示对应域名标签。
 */
const SIZE = 340
const C = SIZE / 2
const R = 150

function wedgePath(i: number): string {
  const a0 = (i * 60 - 90) * (Math.PI / 180)
  const a1 = ((i + 1) * 60 - 90) * (Math.PI / 180)
  const x0 = C + R * Math.cos(a0)
  const y0 = C + R * Math.sin(a0)
  const x1 = C + R * Math.cos(a1)
  const y1 = C + R * Math.sin(a1)
  return `M ${C} ${C} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`
}

export default function SectorWheel() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="relative select-none" style={{ width: SIZE, height: SIZE }}>
      {/* 固定标签（不随轮盘旋转） */}
      <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] tracking-[0.3em] text-dim-star transition-opacity duration-300"
        style={{ opacity: hovered === null ? 0 : 1 }}
      >
        {hovered !== null && (
          <span style={{ color: CATEGORIES[hovered].color }}>
            {CATEGORIES[hovered].en} · {CATEGORIES[hovered].zh}
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="block"
        role="img"
        aria-label="六大知识星区图"
      >
        <g className="sector-wheel-spin" style={{ transformOrigin: `${C}px ${C}px` }}>
          {CATEGORIES.map((cat, i) => (
            <path
              key={cat.id}
              d={wedgePath(i)}
              fill={cat.color}
              fillOpacity={hovered === i ? 0.28 : 0.08}
              stroke={cat.color}
              strokeOpacity={hovered === i ? 0.9 : 0.35}
              strokeWidth={1}
              style={{ transition: 'fill-opacity 0.35s, stroke-opacity 0.35s', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          {/* 外环 */}
          <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(148,163,255,0.25)" strokeWidth={1} />
          <circle cx={C} cy={C} r={R * 0.62} fill="none" stroke="rgba(148,163,255,0.14)" strokeWidth={1} strokeDasharray="2 6" />
          {/* 中心核 */}
          <circle cx={C} cy={C} r={5} fill="#4DE3FF" />
          <circle cx={C} cy={C} r={12} fill="none" stroke="#4DE3FF" strokeOpacity={0.4} strokeWidth={1} />
          {/* 每瓣上的节点光点 */}
          {CATEGORIES.map((cat, i) => {
            const a = (i * 60 + 30 - 90) * (Math.PI / 180)
            return (
              <circle
                key={`dot-${cat.id}`}
                cx={C + R * 0.72 * Math.cos(a)}
                cy={C + R * 0.72 * Math.sin(a)}
                r={hovered === i ? 4 : 2.5}
                fill={cat.color}
                style={{ transition: 'r 0.3s' }}
              />
            )
          })}
        </g>
      </svg>

      <style>{`
        .sector-wheel-spin {
          animation: sector-wheel-rotate 20s linear infinite;
        }
        @keyframes sector-wheel-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sector-wheel-spin { animation: none; }
        }
      `}</style>
    </div>
  )
}
