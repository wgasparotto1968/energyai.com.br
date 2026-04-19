import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Settings, User, CreditCard, Shield, Trash2 } from 'lucide-react'
import NomeForm from './NomeForm'

const planoBadge: Record<string, string> = {
  FREE: 'bg-slate-100 text-slate-700',
  PRO: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-yellow-100 text-yellow-700',
}

const planoLabel: Record<string, string> = {
  FREE: 'Gratuito',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
}

const planoLimites: Record<string, { contas: number; faturas: string }> = {
  FREE: { contas: 1, faturas: '3/mês' },
  PRO: { contas: 10, faturas: 'Ilimitadas' },
  ENTERPRISE: { contas: 999, faturas: 'Ilimitadas' },
}

export default async function ConfiguracoesPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: { _count: { select: { contas: true } } },
  })

  const plano = dbUser?.plano ?? 'FREE'
  const nome = dbUser?.nome ?? clerkUser.firstName ?? ''
  const email = dbUser?.email ?? clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const limites = planoLimites[plano] ?? planoLimites.FREE

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500 mt-1 text-sm">Gerencie seu perfil e assinatura.</p>
      </div>

      {/* Perfil */}
      <section className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <User className="h-5 w-5 text-slate-500" />
          </div>
          <h2 className="font-semibold text-slate-700">Perfil</h2>
        </div>

        <div className="px-6 py-5 space-y-5">
          <NomeForm nomeAtual={nome} />

          <div>
            <p className="text-sm font-medium text-slate-700 mb-1.5">E-mail</p>
            <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
              {email}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Para alterar o e-mail, acesse as configurações da conta Clerk.
            </p>
          </div>
        </div>
      </section>

      {/* Plano */}
      <section className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="font-semibold text-slate-700">Assinatura</h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Plano atual</p>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${planoBadge[plano]}`}>
                {planoLabel[plano]}
              </span>
            </div>
            {plano === 'FREE' && (
              <a
                href="#"
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 transition-colors"
              >
                Fazer upgrade →
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-500 mb-0.5">Unidades permitidas</p>
              <p className="font-semibold text-slate-800">{limites.contas === 999 ? 'Ilimitadas' : limites.contas}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-500 mb-0.5">Faturas</p>
              <p className="font-semibold text-slate-800">{limites.faturas}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-500 mb-0.5">Unidades cadastradas</p>
              <p className="font-semibold text-slate-800">{dbUser?._count.contas ?? 0}</p>
            </div>
          </div>

          {plano === 'FREE' && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-semibold text-green-800 mb-1">Upgrade para Pro</p>
              <p className="text-xs text-green-700">
                10 unidades · Faturas ilimitadas · Solar · Verde/Azul · Exportação PDF
              </p>
              <p className="text-xs text-green-600 font-semibold mt-2">R$ 49/mês</p>
            </div>
          )}
        </div>
      </section>

      {/* Segurança */}
      <section className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-slate-700">Segurança</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-500">
            A autenticação é gerenciada pelo Clerk. Para alterar senha, ativar 2FA ou gerenciar sessões,{' '}
            <a
              href="https://accounts.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              acesse sua conta Clerk
            </a>.
          </p>
        </div>
      </section>

      {/* Zona de perigo */}
      <section className="rounded-xl border border-red-200 bg-white divide-y divide-red-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="font-semibold text-red-600">Zona de perigo</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 mb-3">
            Ao excluir sua conta, todos os dados, unidades e faturas serão permanentemente removidos.
            Esta ação não pode ser desfeita.
          </p>
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium px-4 py-2 opacity-50 cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            Excluir minha conta
          </button>
          <p className="text-xs text-slate-400 mt-2">Em breve (requer confirmação por e-mail).</p>
        </div>
      </section>
    </div>
  )
}
