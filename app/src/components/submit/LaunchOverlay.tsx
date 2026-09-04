import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, RotateCcw } from 'lucide-react'

interface LaunchOverlayProps {
  open: boolean
  color: string
  queueNo: number
  storageOk: boolean
  onAgain: () => void
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

/** 彗星拖尾层：3 层透明度递减的圆点拖影 */
const TRAIL = [
  { size: 12, opacity: 0.5, delay: 0.06 },
  { size: 9, opacity: 0.3, delay: 0.12 },
  { size: 6, opacity: 0.16, delay: 0.18 },
]

/** 提交成功态：节点光点飞入屏幕中心 → 弧线发射上天（彗尾拖影）→ 确认文案逐行浮现 */
export default function LaunchOverlay({ open, color, queueNo, storageOk, onAgain }: LaunchOverlayProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onAgain()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onAgain])

  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  /** 阶段 1：从下方飞入中心（0.8s expo）；阶段 2：沿弧线发射飞出顶部（0.8s ease-in） */
  const cometAnimate = (opacity: number) => ({
    opacity: [0, opacity, opacity, 0],
    scale: [0.2, 1.2, 1, 0.4],
    x: [0, 0, vh * 0.08, vh * 0.2],
    y: [vh * 0.25, 0, -vh * 0.3, -vh * 0.85],
  })
  const cometTransition = (delay: number) => ({
    duration: 2.0,
    times: [0, 0.4, 0.62, 1] as [number, number, number, number],
    ease: ['easeOut', 'easeIn', 'easeIn'] as ['easeOut', 'easeIn', 'easeIn'],
    delay: 0.35 + delay,
  })

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="节点已入轨"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(5,6,15,0.9)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: 'url(/starfield-bg.jpg)' }}
          />

          {/* 彗星 */}
          <div className="absolute left-1/2 top-1/2" aria-hidden="true">
            {TRAIL.map((t, i) => (
              <motion.span
                key={i}
                className="absolute block rounded-full"
                style={{
                  width: t.size,
                  height: t.size,
                  marginLeft: -t.size / 2,
                  marginTop: -t.size / 2,
                  backgroundColor: '#4DE3FF',
                }}
                animate={cometAnimate(t.opacity)}
                transition={cometTransition(t.delay)}
              />
            ))}
            <motion.span
              className="absolute block rounded-full"
              style={{
                width: 16,
                height: 16,
                marginLeft: -8,
                marginTop: -8,
                backgroundColor: color,
                boxShadow: `0 0 24px ${color}, 0 0 80px ${color}`,
              }}
              animate={cometAnimate(1)}
              transition={cometTransition(0)}
            />
          </div>

          {/* 确认文案 */}
          <div className="relative z-10 max-w-[640px] px-6 text-center">
            <motion.p
              className="font-mono text-[11px] tracking-[0.35em] text-ion-cyan"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1, duration: 0.7, ease: EASE }}
            >
              LAUNCH CONFIRMED · 发射确认
            </motion.p>
            <motion.h2
              className="mt-5 font-serif text-[28px] font-black leading-[1.3] tracking-[0.02em] text-star-white lg:text-4xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.25, duration: 0.7, ease: EASE }}
            >
              节点已入轨，等待引力校准。
            </motion.h2>
            <motion.p
              className="mt-5 font-mono text-xs tracking-[0.2em] text-dim-star"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.7, ease: EASE }}
            >
              QUEUE #{String(queueNo).padStart(3, '0')} · 预计 72h 内点亮
            </motion.p>
            {!storageOk && (
              <motion.p
                className="mt-3 font-mono text-[11px] tracking-[0.15em] text-nova-pink"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.6 }}
              >
                本地队列不可用，节点仅作演示
              </motion.p>
            )}
            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.7, ease: EASE }}
            >
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="group relative flex h-12 items-center gap-3 overflow-hidden rounded-lg border border-ion-cyan/80 px-8 font-sans text-sm font-medium tracking-[0.2em] text-ion-cyan transition-all duration-300 hover:shadow-[0_0_32px_rgba(77,227,255,0.25)]"
              >
                <span className="absolute inset-0 -translate-x-[101%] bg-ion-cyan transition-transform duration-300 ease-out group-hover:translate-x-0" />
                <span className="relative z-10 flex items-center gap-3 transition-colors duration-300 group-hover:text-void">
                  返回星球
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              <button
                type="button"
                onClick={onAgain}
                className="group flex h-12 items-center gap-2.5 px-4 font-sans text-sm tracking-[0.15em] text-dim-star transition-colors hover:text-star-white"
              >
                <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
                <span className="underline-offset-4 group-hover:underline">再播种一颗</span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
