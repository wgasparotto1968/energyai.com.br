'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Zap,
  Building2,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/contas', label: 'Contas', icon: Building2 },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/dashboard/configuracoes', label: 'Config.', icon: Settings },
]

function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex-col hidden md:flex">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white">EnergyAI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
        <UserButton appearance={{ elements: { avatarBox: 'h-8 w-8' } }} />
        <span className="text-sm text-slate-400 truncate">Minha conta</span>
      </div>
    </aside>
  )
}

function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-slate-900 border-t border-slate-800 flex md:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-green-400' : 'text-slate-400'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <UserButton appearance={{ elements: { avatarBox: 'h-5 w-5' } }} />
        <span className="text-[10px] text-slate-400 mt-0.5">Conta</span>
      </div>
    </nav>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      {/* Desktop: offset for sidebar */}
      <div className="md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500 md:hidden">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-700 md:font-normal md:text-slate-500">
            <span className="md:hidden">EnergyAI</span>
            <span className="hidden md:inline">EnergyAI &mdash; Análise Inteligente de Faturas de Energia</span>
          </p>
        </header>
        {/* Mobile: padding bottom for bottom nav */}
        <main className="p-4 md:p-8 pb-20 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}

