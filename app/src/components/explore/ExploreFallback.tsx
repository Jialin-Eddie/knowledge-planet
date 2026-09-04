import { useMemo } from 'react'
import { NODES, CATEGORY_MAP } from '@/data/nodes'
import type { KnowledgeNode } from '@/data/nodes'
import { cn } from '@/lib/utils'

interface ExploreFallbackProps {
  onSelectNode: (node: KnowledgeNode) => void
  onHover: (id: string | null) => void
  hoveredId: string | null
  dimmedIds: ReadonlySet<string>
}

/** WebGL 不可用 / 低端设备降级：2D 投影星球，节点仍可点击、筛选、联动 */
export default function ExploreFallback({
  onSelectNode,
  onHover,
  hoveredId,
  dimmedIds,
}: ExploreFallbackProps) {
  // 稳定的同心环投影布局
  const points = useMemo(() => {
    return NODES.map((node, i) => {
      const golden = Math.PI * (3 - Math.sqrt(5))
      const r = 12 + 36 * Math.sqrt((i + 0.5) / NODES.length)
      const a = i * golden
      return {
        node,
        x: 50 + r * Math.cos(a),
        y: 50 + r * Math.sin(a) * 0.92,
      }
    })
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src="/planet-texture.jpg"
        alt="知识星球（2D 降级视图）"
        className="absolute left-1/2 top-1/2 h-[80%] aspect-square max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full object-cover opacity-50"
        style={{
          maskImage: 'radial-gradient(circle, black 50%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle, black 50%, transparent 70%)',
        }}
      />
      {points.map(({ node, x, y }) => {
        const cat = CATEGORY_MAP[node.category]
        const dimmed = dimmedIds.has(node.id)
        const hot = hoveredId === node.id
        return (
          <button
            key={node.id}
            onClick={() => onSelectNode(node)}
            onMouseEnter={() => onHover(node.id)}
            onMouseLeave={() => onHover(null)}
            className={cn(
              'absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-2.5 py-1 backdrop-blur transition-all duration-300',
              hot ? 'border-ion-cyan bg-void/90' : 'border-orbit-line bg-void/70 hover:border-ion-cyan',
              dimmed && 'opacity-15',
            )}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}88` }}
            />
            <span className="whitespace-nowrap font-sans text-[11px] text-star-white">
              {node.title}
            </span>
          </button>
        )
      })}
    </div>
  )
}
