import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FloatFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  multiline?: boolean
  error?: string
  /** 每次提交尝试递增，用于重新触发抖动动画 */
  shakeKey?: number
  counterMax?: number
}

const INPUT_BASE =
  'w-full rounded-lg border bg-deep-space/40 px-4 text-[15px] text-star-white caret-ion-cyan outline-none transition-all duration-300 placeholder:text-faint/70'

/** 浮动标签输入框：聚焦/有值时标签上浮，聚焦 cyan 发光，校验失败抖动 + 错误淡入 */
export default function FloatField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  multiline,
  error,
  shakeKey = 0,
  counterMax,
}: FloatFieldProps) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0
  const count = [...value].length
  const over = counterMax !== undefined && count > counterMax

  const borderCls = error
    ? 'border-nova-pink/60'
    : 'border-orbit-line focus:border-ion-cyan focus:shadow-[0_0_0_1px_rgba(77,227,255,0.55),0_0_28px_rgba(77,227,255,0.12)]'

  return (
    <div>
      <motion.div
        key={shakeKey}
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-4 z-10 transition-all duration-300',
            floated
              ? 'top-0 -translate-y-1/2 bg-void px-1.5 font-mono text-[10px] tracking-[0.25em] text-ion-cyan'
              : multiline
                ? 'top-[27px] text-sm text-faint'
                : 'top-1/2 -translate-y-1/2 text-sm text-faint',
          )}
        >
          {label}
          {required && <span className="text-nova-pink"> *</span>}
        </label>
        {multiline ? (
          <textarea
            id={id}
            rows={4}
            value={value}
            placeholder={floated ? placeholder : ''}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(INPUT_BASE, 'min-h-[128px] resize-y pb-3 pt-8 leading-[1.8]', borderCls)}
          />
        ) : (
          <input
            id={id}
            type="text"
            value={value}
            placeholder={floated ? placeholder : ''}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(INPUT_BASE, 'h-14 pb-1 pt-5', borderCls)}
          />
        )}
      </motion.div>
      <div className="mt-2 flex min-h-[18px] items-start justify-between gap-4">
        <AnimatePresence>
          {error && (
            <motion.p
              key="err"
              id={`${id}-error`}
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
        {counterMax !== undefined && (
          <span
            className={cn(
              'ml-auto shrink-0 font-mono text-[11px] tracking-[0.15em]',
              over ? 'text-nova-pink' : 'text-faint',
            )}
          >
            {count} / {counterMax}
          </span>
        )}
      </div>
    </div>
  )
}
