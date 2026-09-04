import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

interface PageStubProps {
  eyebrow: string
  title: string
  enTitle: string
  description: string
}

/** 子页面占位 stub —— 由后续页面代理完整实现 */
export default function PageStub({ eyebrow, title, enTitle, description }: PageStubProps) {
  return (
    <section
      className="relative flex min-h-[calc(100dvh-72px)] items-center overflow-hidden"
      style={{
        backgroundImage: 'url(/starfield-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-void/80" />
      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-24 lg:px-12">
        <motion.p
          className="flex items-center gap-3 font-grotesk text-[13px] font-medium uppercase tracking-[0.35em] text-ion-cyan"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="eyebrow-line" />
          {eyebrow}
        </motion.p>
        <motion.h1
          className="mt-6 font-serif text-4xl font-black leading-[1.15] tracking-[0.02em] text-star-white lg:text-[64px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="mt-3 font-grotesk text-sm tracking-[0.2em] text-faint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          {enTitle}
        </motion.p>
        <motion.p
          className="mt-8 max-w-[520px] font-sans text-base leading-[1.85] text-dim-star"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: EASE }}
        >
          {description}
        </motion.p>
      </div>
    </section>
  )
}
