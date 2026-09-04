import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useInView, useReducedMotion, animate } from 'framer-motion'
import OrbitStory from '@/components/about/OrbitStory'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p
      className={`flex items-center gap-3 font-grotesk text-[13px] font-medium uppercase tracking-[0.35em] text-ion-cyan ${center ? 'justify-center' : ''}`}
    >
      <span className="eyebrow-line" />
      {children}
    </p>
  )
}

// ── Section 4 · StatCard（运营视角，count-up） ────────────────

function StatCard({ value, suffix, label, delay }: { value: number; suffix?: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30% 0px' })
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, reduced])
  return (
    <motion.div
      ref={ref}
      initial={{ y: 40, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : undefined}
      transition={{ delay, duration: 0.7, ease: EASE }}
      className="group border border-orbit-line bg-nebula/60 px-8 py-9 transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(77,227,255,0.15)]"
    >
      <div className="font-grotesk text-5xl font-bold text-star-white">
        {display}
        {suffix && <span className="text-ion-cyan">{suffix}</span>}
      </div>
      <div className="mt-3 font-mono text-xs tracking-[0.25em] text-dim-star">{label}</div>
    </motion.div>
  )
}

// ── 数据 ─────────────────────────────────────────────────────

const METHODS = [
  {
    step: '01',
    title: '采集 · Gather',
    svg: '/about-method-1.svg',
    desc: '从书籍、论文与好奇心出发，捕捉值得成星的知识点——每条都要能通过"三句话讲清楚"测试。',
  },
  {
    step: '02',
    title: '连结 · Weave',
    svg: '/about-method-2.svg',
    desc: '为每颗星寻找引力纽带：因果、对照、同构、启发……至少 2 条连线的节点才允许入轨。',
  },
  {
    step: '03',
    title: '成球 · Orbit',
    svg: '/about-method-3.svg',
    desc: '网络收拢成球，进入持续自转。此后它只属于读者——每一次点击都在改变它的运行方式。',
  },
]

const CHARTER = [
  { num: 'Ⅰ', title: '好奇心优先', desc: '导航永远为"随便逛逛"保留入口。' },
  { num: 'Ⅱ', title: '连接大于收录', desc: '没有连线的知识点，不许上线。' },
  { num: 'Ⅲ', title: '每个节点都可点击', desc: '交互不是装饰，是承诺。' },
  { num: 'Ⅳ', title: '保持旋转', desc: '星球每月新增节点，永远未完成。' },
]

const STATS = [
  { value: 48, label: '精写节点 · CORE NODES' },
  { value: 80, label: '卫星节点 · SATELLITES' },
  { value: 100, suffix: '%', label: '节点可点击 · CLICKABLE' },
  { value: 0, label: '围墙 · NO WALLS' },
]

const CREW = [
  { role: '观星者', en: 'Curator', desc: '负责节点的采集与校对', color: '#FFB547', initial: '观' },
  { role: '制图师', en: 'Cartographer', desc: '负责连线与星区结构', color: '#8B7CFF', initial: '制' },
  { role: '推进器', en: 'Engineer', desc: '负责让星球转起来', color: '#4DE3FF', initial: '推' },
]

export default function About() {
  const reduced = useReducedMotion() ?? false

  return (
    <div className="relative">
      {/* ════════ Section 1 · 页头 ════════ */}
      <header className="relative mx-auto max-w-[760px] px-6 pt-16 text-center lg:pt-[120px]">
        <motion.img
          src="/nebula-glow-2.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 w-[520px] -translate-x-1/2 opacity-60 about-nebula-float"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <Eyebrow center>ABOUT THE PROJECT</Eyebrow>
        </motion.div>
        <h1 className="relative mt-6 font-serif text-4xl font-black leading-[1.15] tracking-[0.02em] text-star-white lg:text-[64px]" style={{ perspective: 800 }}>
          {'我们给知识，造了一颗星球'.split('').map((ch, i) => (
            <motion.span
              key={i}
              className={`inline-block ${ch === '星' || ch === '球' ? 'text-gradient-title' : ''}`}
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.04, duration: 0.7, ease: EASE }}
              style={{ transformOrigin: '50% 100%' }}
            >
              {ch}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8, ease: EASE }}
          className="relative mx-auto mt-6 max-w-[560px] font-sans text-base leading-[1.85] tracking-[0.02em] text-dim-star"
        >
          一个关于知识组织方式的实验：拒绝层级目录，拥抱引力与轨道。
        </motion.p>
      </header>

      {/* ════════ Section 2 · 理念叙事（pin 180vh） ════════ */}
      <div className="mt-16 lg:mt-24">
        <OrbitStory reduced={reduced} />
      </div>

      {/* 叙事后的两段正文 */}
      <section className="mx-auto grid max-w-[1280px] gap-10 px-6 py-16 lg:grid-cols-12 lg:gap-14 lg:px-12 lg:py-24">
        <motion.p
          initial={{ y: 32, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-30% 0px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="font-sans text-[15px] leading-[1.85] tracking-[0.02em] text-dim-star lg:col-span-7 lg:text-base"
        >
          传统的知识库是货架：分类、编号、束之高阁。但真实的学习从不按目录发生——你从量子力学跳到庄子，从印象派跳到视网膜成像。知识的意义不在节点本身，而在<span className="text-star-white">节点之间的弧线</span>上。
        </motion.p>
        <motion.p
          initial={{ y: 32, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-30% 0px' }}
          transition={{ delay: 0.15, duration: 0.8, ease: EASE }}
          className="font-sans text-[15px] leading-[1.85] tracking-[0.02em] text-dim-star lg:col-span-5 lg:text-base"
        >
          所以我们把每一个知识点做成一颗星，把每一条关联做成引力。星球会持续旋转，因为知识从不静止；<span className="text-ion-cyan">每个节点都可以点击</span>，因为好奇心不该有围墙。
        </motion.p>
      </section>

      {/* ════════ Section 3 · 方法论 ════════ */}
      <section className="border-t border-orbit-line">
        <div className="mx-auto max-w-[1280px] px-6 py-[72px] lg:px-12 lg:py-[120px]">
          <Eyebrow>METHOD</Eyebrow>
          <motion.h2
            initial={{ y: 32, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-6 font-serif text-3xl font-semibold leading-[1.2] text-star-white lg:text-[44px]"
          >
            一颗星球是怎样炼成的
          </motion.h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {METHODS.map((m, i) => (
              <motion.article
                key={m.step}
                initial={{ y: 48, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-20% 0px' }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: EASE }}
                className="group border border-orbit-line bg-nebula/50 p-6 transition-shadow duration-500 hover:shadow-[0_0_36px_rgba(77,227,255,0.14)]"
              >
                <div className="relative overflow-hidden border border-orbit-line/60 bg-deep-space/60">
                  <img
                    src={m.svg}
                    alt={`${m.title} 图解`}
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.3em] text-faint">
                    STEP {m.step}
                  </span>
                </div>
                <h3 className="mt-6 font-sans text-[22px] font-bold leading-[1.35] text-star-white">
                  <span className="mr-3 font-mono text-sm text-ion-cyan">{m.step}</span>
                  {m.title}
                </h3>
                <p className="mt-3 font-sans text-[15px] leading-[1.85] text-dim-star">{m.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Section 4 · 星球宪章 ════════ */}
      <section className="border-t border-orbit-line">
        <div className="mx-auto grid max-w-[1280px] gap-14 px-6 py-[72px] lg:grid-cols-12 lg:px-12 lg:py-[120px]">
          <div className="lg:col-span-5">
            <Eyebrow>CHARTER</Eyebrow>
            <motion.h2
              initial={{ y: 32, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mt-6 font-serif text-3xl font-semibold leading-[1.2] text-star-white lg:text-[44px]"
            >
              星球宪章
            </motion.h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {STATS.map((s, i) => (
                <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} delay={i * 0.1} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 lg:pt-24">
            <ol className="space-y-8">
              {CHARTER.map((c, i) => (
                <motion.li
                  key={c.num}
                  initial={{ x: -32, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true, margin: '-20% 0px' }}
                  transition={{ delay: i * 0.1, duration: 0.7, ease: EASE }}
                  className="group flex gap-6 border-b border-orbit-line pb-8"
                >
                  <span className="font-mono text-xl text-faint transition-colors duration-300 group-hover:text-ion-cyan">
                    {c.num}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-star-white">{c.title}</h3>
                    <p className="mt-2 font-sans text-[15px] leading-[1.85] text-dim-star">{c.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ════════ Section 5 · 地面控制组 ════════ */}
      <section className="border-t border-orbit-line">
        <div className="mx-auto max-w-[1280px] px-6 py-[72px] lg:px-12 lg:py-[120px]">
          <Eyebrow>CREW</Eyebrow>
          <motion.h2
            initial={{ y: 32, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-6 font-serif text-3xl font-semibold leading-[1.2] text-star-white lg:text-[44px]"
          >
            地面控制组
          </motion.h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {CREW.map((c, i) => (
              <motion.div
                key={c.role}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-20% 0px' }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: EASE }}
                className="group border border-orbit-line bg-nebula/50 p-8 text-center transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(77,227,255,0.12)]"
              >
                <div className="relative mx-auto h-20 w-20">
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full font-serif text-2xl font-black text-void"
                    style={{ background: `linear-gradient(135deg, ${c.color} 0%, #131832 130%)` }}
                  >
                    {c.initial}
                  </div>
                  {/* hover 时出现轨道环旋转 */}
                  <svg
                    viewBox="0 0 100 100"
                    className="pointer-events-none absolute -inset-3 h-[104px] w-[104px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 crew-orbit"
                    aria-hidden
                  >
                    <ellipse cx="50" cy="50" rx="48" ry="18" fill="none" stroke={c.color} strokeOpacity={0.7} strokeWidth={1} transform="rotate(-23 50 50)" />
                    <circle cx="90" cy="38" r="2.5" fill={c.color} />
                  </svg>
                </div>
                <h3 className="mt-6 font-sans text-lg font-bold text-star-white">{c.role}</h3>
                <p className="mt-1 font-grotesk text-[13px] tracking-[0.2em] text-faint">{c.en}</p>
                <p className="mt-4 font-sans text-sm leading-[1.85] text-dim-star">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Section 6 · CTA ════════ */}
      <section className="relative overflow-hidden border-t border-orbit-line">
        <img
          src="/nebula-glow-1.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/2 w-[480px] -translate-y-1/2 opacity-50"
        />
        <img
          src="/nebula-glow-2.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-40 top-1/2 w-[480px] -translate-y-1/2 opacity-50"
        />
        <div className="relative mx-auto max-w-[1280px] px-6 py-24 text-center lg:px-12 lg:py-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <Eyebrow>JOIN THE ORBIT</Eyebrow>
          </motion.div>
          <motion.h2
            initial={{ y: 32, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="mt-6 font-serif text-3xl font-semibold leading-[1.2] text-star-white lg:text-[44px]"
          >
            星球因<span className="text-gradient-title">探索者</span>而存在。
          </motion.h2>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
            className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row"
          >
            <Link
              to="/explore"
              className="group inline-flex items-center gap-2 border border-ion-cyan px-8 py-3.5 font-sans text-sm font-medium tracking-[0.12em] text-ion-cyan transition-all duration-400 hover:bg-ion-cyan hover:text-void"
            >
              开始探索
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/submit"
              className="font-sans text-sm text-dim-star underline decoration-orbit-line underline-offset-8 transition-colors hover:text-star-white hover:decoration-ion-cyan"
            >
              播种一个节点
            </Link>
          </motion.div>
        </div>
      </section>

      <style>{`
        .about-nebula-float { animation: about-nebula-drift 6s ease-in-out infinite alternate; }
        @keyframes about-nebula-drift {
          from { transform: translate(-50%, -10px); }
          to { transform: translate(-50%, 10px); }
        }
        .crew-orbit { animation: crew-orbit-spin 8s linear infinite; }
        @keyframes crew-orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .about-nebula-float, .crew-orbit { animation: none; }
        }
      `}</style>
    </div>
  )
}
