import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, User } from 'lucide-react'

const tabs = [
  { path: '/', label: '首页', icon: LayoutDashboard },
  { path: '/workout', label: '健身打卡', icon: Dumbbell },
  { path: '/my', label: '我的', icon: User },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-surface-muted z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-16 max-w-[430px] mx-auto">
        {tabs.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors min-h-[44px] ${
                active ? 'text-brand' : 'text-text-disabled'
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[11px] font-semibold">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
