import { Outlet } from 'react-router'
import Navbar from './Navbar'
import Footer from './Footer'

/**
 * 全站布局：固定顶部 Navbar（72px）+ 内容插槽 + Footer。
 * 内容插槽自带 72px 顶部内边距，使页面内容从导航下方开始；
 * 需要全屏 Hero 的页面（如首页）在页面内部用负边距自行豁免。
 */
export default function Layout() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-void">
      <Navbar />
      <main className="flex-1 pt-[72px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
