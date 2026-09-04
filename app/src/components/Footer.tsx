import { Link } from 'react-router'

const LINK_GROUPS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: '探索',
    links: [
      { label: '星球探索', to: '/explore' },
      { label: '知识域', to: '/topics' },
      { label: '亮点节点', to: '/#featured' },
    ],
  },
  {
    title: '资源',
    links: [
      { label: '延伸阅读', to: '/explore' },
      { label: '知识图谱', to: '/explore' },
      { label: '开放数据', to: '/about' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: '项目理念', to: '/about' },
      { label: '方法论', to: '/about' },
      { label: '播种节点', to: '/submit' },
    ],
  },
  {
    title: '联系',
    links: [
      { label: '投稿与合作', to: '/submit' },
      { label: '常见问题', to: '/about' },
      { label: 'RSS / 邮件', to: '/about' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative bg-void">
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, #4DE3FF 0%, #8B7CFF 45%, transparent 100%)',
        }}
      />
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="font-serif text-3xl font-black leading-snug text-star-white lg:text-4xl">
              每一个知识点，
              <br />
              都是一颗<span className="text-ion-cyan">星</span>。
            </p>
            <p className="mt-6 max-w-sm font-sans text-sm leading-[1.85] text-dim-star">
              知识星球是一张活着的知识图谱：128 个节点、342 条引力连接，
              等待每一位探索者点亮。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-6">
            {LINK_GROUPS.map((g) => (
              <div key={g.title}>
                <h4 className="mb-4 font-mono text-xs tracking-[0.25em] text-faint">
                  {g.title}
                </h4>
                <ul className="space-y-3">
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="font-sans text-sm text-dim-star transition-colors hover:text-ion-cyan"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-orbit-line pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-xs tracking-[0.12em] text-faint">
            © 2025 KNOWLEDGE PLANET · 京ICP备00000000号-1 · Built with curiosity since 2025
          </p>
          <img
            src="/logo-planet.svg"
            alt=""
            className="h-6 w-6 text-faint"
            style={{ animationDuration: '20s' }}
          />
        </div>
      </div>
    </footer>
  )
}
