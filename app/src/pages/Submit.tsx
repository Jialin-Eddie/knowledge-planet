import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Crosshair, Plus, X } from 'lucide-react'
import { CATEGORIES, CATEGORY_MAP } from '@/data/nodes'
import type { CategoryId } from '@/data/nodes'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import FloatField from '@/components/submit/FloatField'
import BondInput from '@/components/submit/BondInput'
import NodePreview from '@/components/submit/NodePreview'
import type { PreviewSnapshot } from '@/components/submit/NodePreview'
import LaunchOverlay from '@/components/submit/LaunchOverlay'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]
const STORAGE_KEY = 'kp_pending_nodes'

const RULE_BADGES = ['简洁', '有连接', '可溯源']

const INPUT_LIKE =
  'rounded-lg border border-orbit-line bg-deep-space/40 px-4 text-sm text-star-white caret-ion-cyan outline-none transition-all duration-300 placeholder:text-faint/70 focus:border-ion-cyan focus:shadow-[0_0_0_1px_rgba(77,227,255,0.55),0_0_28px_rgba(77,227,255,0.12)]'

const formVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } },
}
const fieldVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

interface ReadingRow {
  title: string
  url: string
}

interface FormState {
  title: string
  enTitle: string
  category: CategoryId | ''
  summary: string
  bonds: string[]
  readings: ReadingRow[]
  signature: string
}

const INITIAL_FORM: FormState = {
  title: '',
  enTitle: '',
  category: '',
  summary: '',
  bonds: [],
  readings: [{ title: '', url: '' }],
  signature: '',
}

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {}
  const title = f.title.trim()
  const summary = f.summary.trim()
  if (!title) e.title = '节点名称不能为空'
  else if ([...title].length > 20) e.title = '名称不能超过 20 字'
  if (!f.category) e.category = '请选择一个所属星区'
  if (!summary) e.summary = '摘要不能为空'
  else if ([...summary].length > 140) e.summary = '摘要不能超过 140 字'
  if (f.bonds.length < 2) e.bonds = '至少连接 2 个已有节点'
  const active = f.readings.filter((r) => r.title.trim() || r.url.trim())
  if (active.some((r) => !r.title.trim() || !r.url.trim())) {
    e.readings = '每条来源需要同时填写标题与链接'
  } else if (active.some((r) => !/^https?:\/\/\S+$/.test(r.url.trim()))) {
    e.readings = '链接需以 http:// 或 https:// 开头'
  }
  return e
}

export default function Submit() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [attempts, setAttempts] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [launched, setLaunched] = useState(false)
  const [queueNo, setQueueNo] = useState(47)
  const [storageOk, setStorageOk] = useState(true)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  // 实时校验（驱动提交按钮与预览状态行，不展示错误文案）
  const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form])

  // 预览数据 200ms 防抖
  const [preview, setPreview] = useState<PreviewSnapshot>({
    title: '',
    enTitle: '',
    category: '',
    summary: '',
    bonds: [],
  })
  useEffect(() => {
    const t = setTimeout(() => {
      setPreview({
        title: form.title,
        enTitle: form.enTitle,
        category: form.category,
        summary: form.summary,
        bonds: form.bonds,
      })
    }, 200)
    return () => clearTimeout(t)
  }, [form.title, form.enTitle, form.category, form.summary, form.bonds])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    setAttempts((a) => a + 1)
    if (Object.keys(errs).length > 0) return

    const payload = {
      title: form.title.trim(),
      enTitle: form.enTitle.trim(),
      category: form.category,
      summary: form.summary.trim(),
      bonds: form.bonds,
      readings: form.readings
        .filter((r) => r.title.trim() && r.url.trim())
        .map((r) => ({ title: r.title.trim(), url: r.url.trim() })),
      signature: form.signature.trim(),
      submittedAt: new Date().toISOString(),
    }
    let ok = true
    let pending = 0
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const arr: unknown[] = raw ? JSON.parse(raw) : []
      const queue = Array.isArray(arr) ? arr : []
      queue.push(payload)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
      pending = queue.length - 1
    } catch {
      ok = false
    }
    setStorageOk(ok)
    setQueueNo(47 + pending)
    setLaunched(true)
  }

  const resetAll = () => {
    setForm(INITIAL_FORM)
    setErrors({})
    setLaunched(false)
    window.scrollTo(0, 0)
  }

  const previewColor = form.category ? CATEGORY_MAP[form.category].color : '#4DE3FF'

  return (
    <div className="relative">
      {/* ── Section 1 · 页头 ─────────────────────────────── */}
      <section className="relative overflow-hidden pt-[88px]">
        <img
          src="/nebula-glow-1.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-48 -top-48 h-[560px] w-[560px] opacity-40 blur-[60px]"
        />
        <div className="relative mx-auto max-w-[1280px] px-6 lg:px-12">
          <motion.p
            className="flex items-center gap-3 font-grotesk text-[13px] font-medium uppercase tracking-[0.35em] text-ion-cyan"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="eyebrow-line" />
            Seed a Node
          </motion.p>

          <h1 className="mt-6 font-serif text-[36px] font-black leading-[1.15] tracking-[0.02em] text-star-white lg:text-[64px]">
            {['把你的知识，', '送入轨道'].map((w, i) => (
              <motion.span
                key={w}
                className={cn('inline-block', i === 1 && 'text-gradient-title')}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.18, duration: 0.8, ease: EASE }}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-[600px] font-sans text-base leading-[1.85] text-dim-star"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8, ease: EASE }}
          >
            每个节点上线前需通过三条规则：三句话能讲清、至少两条引力纽带、来源可追溯。
          </motion.p>

          <div className="mt-8 flex flex-wrap gap-3">
            {RULE_BADGES.map((b, i) => (
              <motion.span
                key={b}
                className="inline-flex items-center gap-2 rounded-full border border-orbit-line px-4 py-1.5 font-mono text-xs tracking-[0.2em] text-dim-star"
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  boxShadow: [
                    '0 0 0 rgba(77,227,255,0)',
                    '0 0 18px rgba(77,227,255,0.5)',
                    '0 0 0 rgba(77,227,255,0)',
                  ],
                  borderColor: [
                    'rgba(148,163,255,0.14)',
                    'rgba(77,227,255,0.7)',
                    'rgba(148,163,255,0.14)',
                  ],
                }}
                transition={{
                  delay: 0.6 + i * 0.15,
                  duration: 1.1,
                  ease: EASE,
                }}
              >
                <span className="text-ion-cyan">✓</span>
                {b}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2 · 表单 + 实时预览 ───────────────────── */}
      <section className="relative mx-auto max-w-[1280px] px-6 py-16 lg:px-12 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* 左栏 · 表单 */}
          <motion.form
            variants={formVariants}
            initial="hidden"
            animate="show"
            onSubmit={onSubmit}
            noValidate
            className="order-2 space-y-6 lg:order-1 lg:col-span-7"
          >
            <motion.div variants={fieldVariants}>
              <FloatField
                id="node-title"
                label="节点名称"
                required
                value={form.title}
                onChange={(v) => set('title', v)}
                placeholder="例如：混沌理论"
                counterMax={20}
                error={attempts > 0 ? errors.title : undefined}
                shakeKey={attempts}
              />
            </motion.div>

            <motion.div variants={fieldVariants}>
              <FloatField
                id="node-en-title"
                label="英文原名"
                value={form.enTitle}
                onChange={(v) => set('enTitle', v)}
                placeholder="e.g. Chaos Theory"
                shakeKey={attempts}
              />
            </motion.div>

            {/* 所属星区 */}
            <motion.div variants={fieldVariants}>
              <motion.div
                key={`cat-${attempts}`}
                animate={attempts > 0 && errors.category ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <span className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-void px-1.5 font-mono text-[10px] tracking-[0.25em] text-ion-cyan">
                  所属星区 <span className="text-nova-pink">*</span>
                </span>
                <Select
                  value={form.category}
                  onValueChange={(v) => set('category', v as CategoryId)}
                >
                  <SelectTrigger
                    aria-label="所属星区"
                    aria-invalid={Boolean(attempts > 0 && errors.category)}
                    className={cn(
                      'h-14 w-full rounded-lg bg-deep-space/40 px-4 text-[15px] text-star-white shadow-none transition-all duration-300 data-[placeholder]:text-faint focus-visible:border-ion-cyan focus-visible:ring-ion-cyan/30',
                      attempts > 0 && errors.category ? 'border-nova-pink/60' : 'border-orbit-line',
                    )}
                  >
                    <SelectValue placeholder="选择一个知识领域" />
                  </SelectTrigger>
                  <SelectContent className="border-orbit-line bg-deep-space text-star-white">
                    {CATEGORIES.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="cursor-pointer focus:bg-nebula focus:text-star-white"
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: c.color, boxShadow: `0 0 6px ${c.color}` }}
                          />
                          <span>{c.zh}</span>
                          <span className="font-mono text-[11px] tracking-[0.15em] text-faint">
                            {c.en}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              {attempts > 0 && errors.category && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 font-sans text-xs text-nova-pink"
                >
                  {errors.category}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={fieldVariants}>
              <FloatField
                id="node-summary"
                label="一句话摘要"
                required
                multiline
                value={form.summary}
                onChange={(v) => set('summary', v)}
                placeholder="用三句话以内讲清楚它是什么、为什么重要…"
                counterMax={140}
                error={attempts > 0 ? errors.summary : undefined}
                shakeKey={attempts}
              />
            </motion.div>

            <motion.div variants={fieldVariants}>
              <BondInput
                bonds={form.bonds}
                onChange={(v) => set('bonds', v)}
                error={attempts > 0 ? errors.bonds : undefined}
                shakeKey={attempts}
              />
            </motion.div>

            {/* 延伸阅读 */}
            <motion.div variants={fieldVariants}>
              <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-dim-star">
                延伸阅读（选填，至多 3 条）
              </p>
              <div className="space-y-3">
                {form.readings.map((r, i) => (
                  <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={r.title}
                      aria-label={`来源 ${i + 1} 标题`}
                      placeholder="来源标题"
                      onChange={(e) =>
                        set(
                          'readings',
                          form.readings.map((row, j) =>
                            j === i ? { ...row, title: e.target.value } : row,
                          ),
                        )
                      }
                      className={cn(INPUT_LIKE, 'h-12 flex-1')}
                    />
                    <input
                      type="url"
                      value={r.url}
                      aria-label={`来源 ${i + 1} 链接`}
                      placeholder="https://…"
                      onChange={(e) =>
                        set(
                          'readings',
                          form.readings.map((row, j) =>
                            j === i ? { ...row, url: e.target.value } : row,
                          ),
                        )
                      }
                      className={cn(INPUT_LIKE, 'h-12 font-mono text-[13px] sm:flex-[1.3]')}
                    />
                    <button
                      type="button"
                      aria-label={`移除来源 ${i + 1}`}
                      onClick={() =>
                        set(
                          'readings',
                          form.readings.length > 1
                            ? form.readings.filter((_, j) => j !== i)
                            : [{ title: '', url: '' }],
                        )
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full border border-orbit-line text-faint transition-colors hover:border-nova-pink/60 hover:text-nova-pink sm:self-auto"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {form.readings.length < 3 && (
                <button
                  type="button"
                  onClick={() => set('readings', [...form.readings, { title: '', url: '' }])}
                  className="group mt-3 inline-flex items-center gap-2 font-sans text-sm text-ion-cyan"
                >
                  <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  <span className="underline-offset-4 group-hover:underline">添加来源</span>
                </button>
              )}
              {attempts > 0 && errors.readings && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 font-sans text-xs text-nova-pink"
                >
                  {errors.readings}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={fieldVariants}>
              <FloatField
                id="node-signature"
                label="署名"
                value={form.signature}
                onChange={(v) => set('signature', v)}
                placeholder="你的称呼（将刻在节点铭牌上）"
                shakeKey={attempts}
              />
            </motion.div>

            {/* 提交 */}
            <motion.div variants={fieldVariants} className="pt-2">
              <button
                type="submit"
                disabled={!isValid}
                className={cn(
                  'group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg border font-sans text-[15px] font-medium tracking-[0.25em] transition-all duration-300',
                  isValid
                    ? 'border-ion-cyan/80 text-ion-cyan hover:shadow-[0_0_36px_rgba(77,227,255,0.28)]'
                    : 'cursor-not-allowed border-orbit-line text-faint',
                )}
              >
                {isValid && (
                  <span className="absolute inset-0 -translate-x-[101%] bg-ion-cyan transition-transform duration-300 ease-out group-hover:translate-x-0" />
                )}
                <span
                  className={cn(
                    'relative z-10 flex items-center gap-3 transition-colors duration-300',
                    isValid && 'group-hover:text-void',
                  )}
                >
                  发射入轨
                  <Crosshair className="h-4 w-4" />
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              <p className="mt-3 text-center font-mono text-[11px] tracking-[0.15em]">
                {form.bonds.length < 2 ? (
                  <span className="text-nova-pink">至少连接 2 个已有节点</span>
                ) : !isValid ? (
                  <span className="text-faint">完成必填项后即可发射</span>
                ) : (
                  <span className="text-aurora-green">轨道参数校验通过 ✓</span>
                )}
              </p>
            </motion.div>
          </motion.form>

          {/* 右栏 · 实时预览（移动端置顶） */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            <div className="lg:sticky lg:top-[120px]">
              <NodePreview data={preview} valid={isValid} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3 · 入轨动画覆盖层 ────────────────────── */}
      <LaunchOverlay
        open={launched}
        color={previewColor}
        queueNo={queueNo}
        storageOk={storageOk}
        onAgain={resetAll}
      />
    </div>
  )
}
