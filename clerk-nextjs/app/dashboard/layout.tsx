'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { UserButton, SignOutButton } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Zap,
  Building2,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/contas', label: 'Contas de Energia', icon: Building2 },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
]

function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0a1628] flex flex-col">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-6 py-5 border-b border-[#0f1e38] hover:opacity-80 transition-opacity">
        <Image src="/logo2.png" alt="EnergyAI" width={58} height={58} />
        <span className="text-lg font-bold text-white">EnergyAI</span>
      </Link>

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
                  : 'text-blue-200 hover:bg-[#0f1e38] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-6 py-4 border-t border-[#0f1e38] flex items-center gap-3">
        <UserButton
          appearance={{ elements: { avatarBox: 'h-8 w-8' } }}
        />
        <span className="text-sm text-slate-400 truncate">Minha conta</span>
      </div>
    </aside>
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
      <div className="pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            EnergyAI &mdash; Análise Inteligente de Faturas de Energia
          </p>
          <SignOutButton>
            <button className="text-sm text-slate-500 hover:text-red-600 transition-colors font-medium">
              Sair
            </button>
          </SignOutButton>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
