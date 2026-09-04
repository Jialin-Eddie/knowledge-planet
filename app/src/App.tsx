import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import Lenis from 'lenis'
import Layout from './components/Layout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Topics from './pages/Topics'
import About from './pages/About'
import Submit from './pages/Submit'

export default function App() {
  const location = useLocation()

  // 全站 Lenis 平滑滚动
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1 })
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  // 路由切换回到顶部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="topics" element={<Topics />} />
        <Route path="about" element={<About />} />
        <Route path="submit" element={<Submit />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
