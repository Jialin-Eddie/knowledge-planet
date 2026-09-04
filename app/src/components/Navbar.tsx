import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/', label: '首页' },
  { to: '/explore', label: '星球探索' },
  { to: '/topics', label: '知识域' },
  { to: '/about', label: '关于' },
  { to: '/submit', label: '播种节点' },
]

function useTickingStats() {
  const [stats, setStats] = useState({ nodes: 128, edges: 342 })
  useEffect(() => {
    const t = setInterval(() => {
      setStats((s) => ({
        nodes: 128 + (Math.random() < 0.12 ? 1 : 0) - (Math.random() < 0.04 ? 1 : 0),
        edges: s.edges + (Math.random() < 0.2 ? (Math.random() < 0.5 ? 1 : -1) : 0),
      }))
    }, 1000)
    return () => clearInterval(t)
  }, [])
  return stats
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const stats = useTickingStats()
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-orbit-line bg-[rgba(5,6,15,0.6)] backdrop-blur-[20px]">
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <img
              src="/logo-planet.svg"
              alt="知识星球"
              className="h-6 w-6 text-ion-cyan transition-colors"
            />
            <span className="leading-tight">
              <span className="block font-sans text-[15px] font-bold tracking-wide text-star-white">
                知识星球
              </span>
              <span className="block font-mono text-[9px] tracking-[0.22em] text-faint">
                KNOWLEDGE PLANET
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'group relative py-2 font-sans text-sm font-medium tracking-[0.08em] transition-colors duration-300',
                    isActive ? 'text-star-white' : 'text-dim-star hover:text-star-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    <span
                      className={cn(
                        'absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ion-cyan transition-transform duration-300',
                        isActive ? 'scale-100' : 'scale-0 group-hover:scale-50',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: live stats + CTA */}
          <div className="hidden items-center gap-6 lg:flex">
            <span className="font-mono text-xs tracking-[0.12em] text-dim-star">
              NODES: <span className="text-ion-cyan">{stats.nodes}</span> · EDGES:{' '}
              <span className="text-ion-cyan">{stats.edges}</span>
            </span>
            <Link
              to="/explore"
              className="rounded-none border border-ion-cyan px-4 py-2 font-sans text-[13px] font-medium tracking-[0.08em] text-ion-cyan transition-all duration-300 hover:bg-ion-cyan hover:text-void"
            >
              进入星球 →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="菜单"
          >
            <span
              className={cn(
                'h-px w-6 bg-star-white transition-transform duration-300',
                open && 'translate-y-[3.5px] rotate-45',
              )}
            />
            <span
              className={cn(
                'h-px w-6 bg-star-white transition-transform duration-300',
                open && '-translate-y-[3.5px] -rotate-45',
              )}
            />
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-start justify-center gap-2 bg-void/95 px-10 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {NAV_LINKS.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ y: 32, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'font-serif text-4xl font-black leading-[1.4] transition-colors',
                      isActive ? 'text-ion-cyan' : 'text-star-white hover:text-ion-cyan',
                    )
                  }
                >
                  {l.label}
                </NavLink>
              </motion.div>
            ))}
            <motion.p
              className="mt-8 font-mono text-xs tracking-[0.2em] text-faint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              NODES: {stats.nodes} · EDGES: {stats.edges}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
