import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { CATEGORY_MAP, NODES, NODE_MAP } from '@/data/nodes'
import { cn } from '@/lib/utils'

interface BondInputProps {
  bonds: string[]
  onChange: (bonds: string[]) => void
  error?: string
  shakeKey?: number
}

/** 引力纽带标签输入：自动补全现有节点、键盘导航、分类色 chip 可移除 */
export default function BondInput({ bonds, onChange, error, shakeKey = 0 }: BondInputProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = NODES.filter((n) => !bonds.includes(n.id))
    const filtered = q
      ? pool.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.enTitle.toLowerCase().includes(q) ||
            CATEGORY_MAP[n.category].zh.includes(q),
        )
      : [...pool].sort((a, b) => b.gravity - a.gravity)
    return filtered.slice(0, 8)
  }, [query, bonds])

  const add = (id: string) => {
    if (bonds.includes(id)) return
    onChange([...bonds, id])
    setQuery('')
    setHighlight(0)
    inputRef.current?.focus()
  }

  const remove = (id: string) => onChange(bonds.filter((b) => b !== id))

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = suggestions[highlight] ?? suggestions[0]
      if (open && target) add(target.id)
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Backspace' && !query && bonds.length > 0) {
      remove(bonds[bonds.length - 1])
    }
  }

  return (
    <div>
      <motion.div
        key={shakeKey}
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <span className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-void px-1.5 font-mono text-[10px] tracking-[0.25em] text-ion-cyan">
          引力纽带 <span className="text-nova-pink">*</span>
        </span>
        <div
          className={cn(
            'flex min-h-[96px] flex-wrap content-start items-start gap-2 rounded-lg border bg-deep-space/40 px-4 pb-3 pt-8 transition-all duration-300',
            error
              ? 'border-nova-pink/60'
              : 'border-orbit-line focus-within:border-ion-cyan focus-within:shadow-[0_0_0_1px_rgba(77,227,255,0.55),0_0_28px_rgba(77,227,255,0.12)]',
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {bonds.map((id) => {
            const node = NODE_MAP[id]
            if (!node) return null
            const c = CATEGORY_MAP[node.category].color
            return (
              <motion.span
                key={id}
                layout="position"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.25 }}
                className="inline-flex h-7 items-center gap-2 rounded-full border px-3 font-sans text-xs text-star-white"
                style={{ borderColor: `${c}88`, backgroundColor: `${c}14` }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
                {node.title}
                <button
                  type="button"
                  aria-label={`移除 ${node.title}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    remove(id)
                  }}
                  className="text-faint transition-colors hover:text-nova-pink"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            )
          })}
          <input
            ref={inputRef}
            type="text"
            value={query}
            role="combobox"
            aria-expanded={open}
            aria-label="搜索并添加引力纽带"
            placeholder={bonds.length === 0 ? '输入现有节点名，建立连接…' : ''}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              setHighlight(0)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={onKeyDown}
            className="h-7 min-w-[140px] flex-1 bg-transparent text-sm text-star-white caret-ion-cyan outline-none placeholder:text-faint/70"
          />
        </div>

        {/* 自动补全下拉 */}
        {open && suggestions.length > 0 && (
          <div
            className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-orbit-line bg-deep-space shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
            onMouseDown={(e) => e.preventDefault()}
          >
            <ul className="max-h-64 overflow-y-auto py-1.5" role="listbox">
              {suggestions.map((n, i) => {
                const c = CATEGORY_MAP[n.category].color
                return (
                  <li key={n.id} role="option" aria-selected={i === highlight}>
                    <button
                      type="button"
                      onClick={() => add(n.id)}
                      onMouseEnter={() => setHighlight(i)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        i === highlight ? 'bg-nebula' : 'bg-transparent',
                      )}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}` }}
                      />
                      <span className="text-sm text-star-white">{n.title}</span>
                      <span className="truncate font-mono text-[11px] text-faint">{n.enTitle}</span>
                      <span className="ml-auto shrink-0 font-mono text-[10px] tracking-[0.2em] text-faint">
                        {CATEGORY_MAP[n.category].zh}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </motion.div>

      <div className="mt-2 flex min-h-[18px] items-center justify-between gap-4">
        <AnimatePresence>
          {error && (
            <motion.p
              key="err"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-sans text-xs leading-relaxed text-nova-pink"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <span
          className={cn(
            'ml-auto shrink-0 font-mono text-[11px] tracking-[0.15em]',
            bonds.length >= 2 ? 'text-aurora-green' : 'text-faint',
          )}
        >
          LINKS: {bonds.length} / 2+
        </span>
      </div>
    </div>
  )
}
