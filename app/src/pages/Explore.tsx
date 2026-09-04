import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ListTree, SlidersHorizontal, X } from 'lucide-react'
import type { KnowledgePlanetHandle } from '@/components/KnowledgePlanet'
import NodeDrawer from '@/components/NodeDrawer'
import ControlDeck from '@/components/explore/ControlDeck'
import type { ViewMode } from '@/components/explore/ControlDeck'
import NodeIndex, { NodeIndexList } from '@/components/explore/NodeIndex'
import type { NodeGroup } from '@/components/explore/NodeIndex'
import StatusBar from '@/components/explore/StatusBar'
import DrawerExtras from '@/components/explore/DrawerExtras'
import ExploreFallback from '@/components/explore/ExploreFallback'
import { NODES, CATEGORIES, NODE_MAP, EDGES } from '@/data/nodes'
import type { CategoryId, KnowledgeNode } from '@/data/nodes'

const KnowledgePlanet = lazy(() => import('@/components/KnowledgePlanet'))

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]
const EXPLORE_CAM: [number, number, number] = [0, 0.12, 3.0]
const LS_KEY = 'kp-explored-v1'

// 关联邻接表（关联聚焦模式用）
const ADJ: Map<string, string[]> = (() => {
  const m = new Map<string, string[]>()
  for (const [a, b] of EDGES) {
    m.set(a, [...(m.get(a) ?? []), b])
    m.set(b, [...(m.get(b) ?? []), a])
  }
  return m
})()

/** 两度以内关联集合（含自身） */
function withinTwoDegrees(id: string): Set<string> {
  const keep = new Set<string>([id])
  for (const n1 of ADJ.get(id) ?? []) {
    keep.add(n1)
    for (const n2 of ADJ.get(n1) ?? []) keep.add(n2)
  }
  return keep
}

function loadExplored(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(arr.filter((id) => NODE_MAP[id]))
  } catch {
    return new Set()
  }
}

function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const MODE_LABEL: Record<ViewMode, string> = { free: 'FREE', cluster: 'CLUSTER', focus: 'FOCUS' }

export default function Explore() {
  const reduced = useReducedMotion() ?? false
  const planetRef = useRef<KnowledgePlanetHandle>(null)

  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeCats, setActiveCats] = useState<Set<CategoryId>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('free')
  const [exploredIds, setExploredIds] = useState<Set<string>>(() => loadExplored())
  const [sessionPath, setSessionPath] = useState<string[]>([])
  const [indexCollapsed, setIndexCollapsed] = useState(true)
  const [deckOpenMobile, setDeckOpenMobile] = useState(false)
  const [indexOpenMobile, setIndexOpenMobile] = useState(false)
  const [webglOk] = useState(() => {
    if (!detectWebGL()) return false
    const lowEnd =
      window.devicePixelRatio > 1.5 && (navigator.hardwareConcurrency ?? 8) < 4
    return !lowEnd
  })

  // 搜索防抖 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  // 探索进度持久化
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...exploredIds]))
    } catch {
      /* 忽略隐私模式写入失败 */
    }
  }, [exploredIds])

  // 过滤：分类 + 搜索
  const matches = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    return NODES.filter((n) => {
      if (activeCats.size > 0 && !activeCats.has(n.category)) return false
      if (!q) return true
      return (
        n.title.toLowerCase().includes(q) ||
        n.enTitle.toLowerCase().includes(q) ||
        n.id.includes(q)
      )
    })
  }, [debouncedQuery, activeCats])

  // 淡出集合：未命中 + 关联聚焦模式下的两度以外节点
  const dimmedIds = useMemo(() => {
    const dim = new Set<string>()
    const matchSet = new Set(matches.map((n) => n.id))
    const focusKeep =
      viewMode === 'focus' && selectedNode ? withinTwoDegrees(selectedNode.id) : null
    for (const n of NODES) {
      if (!matchSet.has(n.id) || (focusKeep && !focusKeep.has(n.id))) dim.add(n.id)
    }
    return dim
  }, [matches, viewMode, selectedNode])

  // 搜索命中 → 相机聚焦首个命中节点
  const matchesRef = useRef(matches)
  useEffect(() => {
    matchesRef.current = matches
  }, [matches])
  useEffect(() => {
    if (!debouncedQuery.trim()) return
    const first = matchesRef.current[0]
    if (first) planetRef.current?.focusNode(first.id)
  }, [debouncedQuery])

  // 列表分组（按分类，过滤后）
  const groups = useMemo<NodeGroup[]>(
    () =>
      CATEGORIES.map((cat) => ({
        cat,
        nodes: matches.filter((n) => n.category === cat.id),
      })).filter((g) => g.nodes.length > 0),
    [matches],
  )

  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.map((c) => [c.id, NODES.filter((n) => n.category === c.id).length]),
      ) as Record<CategoryId, number>,
    [],
  )

  const openNode = useCallback((node: KnowledgeNode) => {
    setSelectedNode(node)
    setExploredIds((prev) => {
      if (prev.has(node.id)) return prev
      const next = new Set(prev)
      next.add(node.id)
      return next
    })
    setSessionPath((prev) => [...prev.filter((id) => id !== node.id), node.id])
  }, [])

  /** 相机飞近 + 打开抽屉（列表/抽屉内跳转共用） */
  const flyToNode = useCallback(
    (id: string) => {
      const n = NODE_MAP[id]
      if (!n) return
      planetRef.current?.focusNode(id)
      openNode(n)
    },
    [openNode],
  )

  const handleSelectFromPlanet = useCallback((node: KnowledgeNode) => openNode(node), [openNode])

  // URL 参数联动：?sector=<分类id> 预设分类筛选；?focus=<节点id> 定位并打开抽屉
  // （供 topics/about 页与抽屉「在星球中定位」跳转）
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const sector = searchParams.get('sector')
    if (sector && CATEGORIES.some((c) => c.id === sector)) {
      setActiveCats(new Set([sector as CategoryId]))
    }
    const focus = searchParams.get('focus')
    if (focus && NODE_MAP[focus]) {
      openNode(NODE_MAP[focus])
      // 星球场景为 lazy 加载，重试数次等待其挂载后执行相机定位
      let tries = 0
      const timer = setInterval(() => {
        tries += 1
        planetRef.current?.focusNode(focus)
        if (tries >= 5) clearInterval(timer)
      }, 600)
      return () => clearInterval(timer)
    }
    // 仅在挂载时读取一次 URL 参数
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeDrawer = useCallback(() => {
    setSelectedNode(null)
    planetRef.current?.resetCamera()
  }, [])

  const handleLocate = useCallback((id: string) => {
    planetRef.current?.focusNode(id)
  }, [])

  const handleResetView = useCallback(() => {
    setViewMode('free')
    planetRef.current?.resetCamera()
  }, [])

  const handleViewModeChange = useCallback((m: ViewMode) => {
    setViewMode(m)
    planetRef.current?.resetCamera()
  }, [])

  const toggleCat = useCallback((id: CategoryId) => {
    setActiveCats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // 抽屉「下一颗推荐」：关联节点中首个未探索者
  const recommendation = useMemo(() => {
    if (!selectedNode) return null
    const candidates = selectedNode.related
      .map((id) => NODE_MAP[id])
      .filter((n): n is KnowledgeNode => !!n && n.id !== selectedNode.id)
    return candidates.find((n) => !exploredIds.has(n.id)) ?? candidates[0] ?? null
  }, [selectedNode, exploredIds])

  const filterLabel =
    activeCats.size === 0
      ? 'ALL'
      : CATEGORIES.filter((c) => activeCats.has(c.id))
          .map((c) => c.zh)
          .join('·')

  const deckProps = {
    query,
    onQueryChange: setQuery,
    matchCount: matches.length,
    totalCount: NODES.length,
    activeCats,
    onToggleCat: toggleCat,
    counts,
    viewMode,
    onViewModeChange: handleViewModeChange,
    focusNeedsSelection: !selectedNode,
    onResetView: handleResetView,
  }

  const listProps = {
    groups,
    hoveredId,
    selectedId: selectedNode?.id ?? null,
    exploredIds,
    onHover: setHoveredId,
    onPick: flyToNode,
  }

  return (
    <div className="relative h-[calc(100dvh-72px)] overflow-hidden">
      {/* 星野背景 */}
      <div
        className="absolute inset-0 bg-void"
        style={{
          backgroundImage: 'url(/starfield-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-void/60" />

      {/* 面板后方氛围光 */}
      <img
        src="/nebula-glow-1.png"
        alt=""
        className="pointer-events-none absolute -left-40 top-1/4 w-[460px] opacity-50"
      />
      <img
        src="/nebula-glow-2.png"
        alt=""
        className="pointer-events-none absolute -right-40 top-10 w-[460px] opacity-40"
      />

      {/* 主画布 */}
      <motion.div
        className="absolute inset-0"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
        onDoubleClick={() => planetRef.current?.resetCamera()}
      >
        {webglOk ? (
          <Suspense fallback={<div className="h-full w-full" />}>
            <KnowledgePlanet
              ref={planetRef}
              onSelectNode={handleSelectFromPlanet}
              selectedId={selectedNode?.id ?? null}
              reducedMotion={reduced}
              centered
              pauseOnDrag
              defaultCamPos={EXPLORE_CAM}
              externalHoverId={hoveredId}
              onHoverNode={setHoveredId}
              dimmedIds={dimmedIds}
              clusterMode={viewMode === 'cluster'}
              muteInactiveEdges={viewMode === 'focus' && !!selectedNode}
            />
          </Suspense>
        ) : (
          <ExploreFallback
            onSelectNode={handleSelectFromPlanet}
            onHover={setHoveredId}
            hoveredId={hoveredId}
            dimmedIds={dimmedIds}
          />
        )}
      </motion.div>

      {/* HUD 覆盖层（桌面端） */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
        <div className="absolute left-8 top-8 font-mono text-xs tracking-[0.12em] text-dim-star">
          RA 05h 35m · DEC −05° 23′
        </div>
        <div className="absolute right-8 top-8 flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-dim-star">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aurora-green" />
          PLANET LINK · LIVE
        </div>
        <div className="absolute bottom-[52px] right-8 font-mono text-[11px] tracking-[0.12em] text-dim-star">
          ▏▏▏▏▏ SCALE 1 : 10⁶
        </div>
        <span className="absolute left-8 top-6 h-5 w-5 border-l border-t border-orbit-line" />
        <span className="absolute right-8 top-6 h-5 w-5 border-r border-t border-orbit-line" />
        <span className="absolute bottom-[48px] left-8 h-5 w-5 border-b border-l border-orbit-line" />
        <span className="absolute bottom-[48px] right-8 h-5 w-5 border-b border-r border-orbit-line" />
      </div>

      {/* 左侧控制台（桌面端） */}
      <motion.div
        className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 lg:block"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
      >
        <ControlDeck {...deckProps} />
      </motion.div>

      {/* 右侧节点索引（桌面端） */}
      <motion.div
        className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 lg:block"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
      >
        <NodeIndex
          collapsed={indexCollapsed}
          onToggle={() => setIndexCollapsed((v) => !v)}
          totalCount={matches.length}
          {...listProps}
        />
      </motion.div>

      {/* 底部状态栏 */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-20"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
      >
        <StatusBar
          modeLabel={MODE_LABEL[viewMode]}
          filterLabel={filterLabel}
          explored={exploredIds.size}
          total={NODES.length}
        />
      </motion.div>

      {/* 移动端：控制 / 索引 手柄按钮 */}
      <button
        onClick={() => setDeckOpenMobile(true)}
        className="absolute bottom-14 left-4 z-30 flex items-center gap-2 border border-orbit-line bg-nebula/90 px-4 py-2.5 font-sans text-xs text-star-white backdrop-blur lg:hidden"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-ion-cyan" />
        控制
      </button>
      <button
        onClick={() => setIndexOpenMobile(true)}
        className="absolute bottom-14 right-4 z-30 flex items-center gap-2 border border-orbit-line bg-nebula/90 px-4 py-2.5 font-sans text-xs text-star-white backdrop-blur lg:hidden"
      >
        <ListTree className="h-3.5 w-3.5 text-ion-cyan" />
        索引 · {matches.length}
      </button>

      {/* 移动端控制台抽屉 */}
      <AnimatePresence>
        {deckOpenMobile && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-void/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setDeckOpenMobile(false)}
            />
            <motion.div
              data-lenis-prevent
              className="fixed inset-x-0 bottom-0 z-50 max-h-[78dvh] overflow-y-auto border-t border-ion-cyan/40 bg-deep-space p-4"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-grotesk text-[11px] font-medium uppercase tracking-[0.3em] text-ion-cyan">
                  Control Deck · 控制台
                </span>
                <button
                  onClick={() => setDeckOpenMobile(false)}
                  aria-label="关闭控制台"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-orbit-line text-dim-star"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="[&>div]:w-full">
                <ControlDeck {...deckProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 移动端节点索引抽屉 */}
      <AnimatePresence>
        {indexOpenMobile && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-void/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIndexOpenMobile(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[72dvh] flex-col border-t border-ion-cyan/40 bg-deep-space"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="flex items-center justify-between border-b border-orbit-line px-4 py-3">
                <span className="font-grotesk text-[11px] font-medium uppercase tracking-[0.3em] text-ion-cyan">
                  Node Index · {matches.length}
                </span>
                <button
                  onClick={() => setIndexOpenMobile(false)}
                  aria-label="关闭节点索引"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-orbit-line text-dim-star"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div data-lenis-prevent className="no-scrollbar flex-1 overflow-y-auto p-2">
                <NodeIndexList
                  {...listProps}
                  onPick={(id) => {
                    setIndexOpenMobile(false)
                    flyToNode(id)
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 节点详情抽屉（探索路径 + 推荐增强） */}
      <NodeDrawer
        node={selectedNode}
        onClose={closeDrawer}
        onNavigate={flyToNode}
        onLocate={handleLocate}
        extraSections={
          selectedNode ? (
            <DrawerExtras
              path={sessionPath}
              currentId={selectedNode.id}
              onJump={flyToNode}
              recommendation={recommendation}
              onFly={flyToNode}
            />
          ) : null
        }
      />
    </div>
  )
}
