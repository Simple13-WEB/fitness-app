import { Component } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { StatusBar, Style } from '@capacitor/status-bar'
import { UserProvider } from './context/UserContext'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import WorkoutPage from './pages/Workout'
import MyPage from './pages/My'

// Set status bar to light style so icons are dark (visible on white background)
StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
StatusBar.setBackgroundColor({ color: '#FFFFFF' }).catch(() => {})

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-page p-6">
          <div className="bg-surface-card rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-6 max-w-sm w-full">
            <h2 className="text-[18px] font-bold text-destructive mb-3">应用出错了</h2>
            <p className="text-[14px] text-text-secondary mb-4">
              请尝试刷新页面。如果问题持续，请检查浏览器控制台。
            </p>
            <pre className="bg-surface-subtle rounded-xl p-3 text-[11px] text-destructive overflow-auto max-h-40">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full py-3 bg-brand text-white rounded-xl text-[14px] font-bold"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <UserProvider>
          <div className="min-h-screen bg-surface-page max-w-[430px] mx-auto relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/my" element={<MyPage />} />
            </Routes>
            <BottomNav />
          </div>
        </UserProvider>
      </HashRouter>
    </ErrorBoundary>
  )
}
