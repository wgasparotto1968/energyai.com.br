import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  Zap,
  FileText,
  TrendingDown,
  ShieldCheck,
  BarChart3,
  Sun,
  CheckCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* ── Navbar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Image src="/logo2.png" alt="EnergyAI" width={58} height={58} loading="eager" />
            <span className="text-lg font-bold text-slate-900">EnergyAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#funcionalidades" className="hover:text-slate-900 transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-slate-900 transition-colors">Como funciona</a>
            <a href="#planos" className="hover:text-slate-900 transition-colors">Planos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Começar grátis <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a1628] to-[#0f1e38] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(249,115,22,0.2),transparent)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-2 text-sm font-medium text-orange-400">
            <Zap className="h-3.5 w-3.5" />
            Análise inteligente de faturas de energia
          </div>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Reduza sua conta de luz<br />
            <span className="text-orange-400">com inteligência artificial</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Envie sua fatura de energia e receba em segundos uma análise completa com
            oportunidades de economia, alertas de cobranças indevidas e simulação de
            energia solar — para Grupo A e Grupo B.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-400 transition-colors"
            >
              Analisar minha fatura grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-700 px-8 py-3.5 text-base font-medium text-blue-200 hover:border-blue-500 hover:text-white transition-colors"
            >
              Ver como funciona
            </a>
          </div>

        </div>
      </section>

      {/* ── Números ──────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px md:grid-cols-4">
          {[
            { value: 'até 85%', label: 'de economia estimada' },
            { value: '< 30s', label: 'para gerar a análise' },
            { value: 'Grupo A & B', label: 'todos os perfis atendidos' },
            { value: '100%', label: 'seguro e privado (LGPD)' },
          ].map((item) => (
            <div key={item.label} className="bg-white px-6 py-8 text-center">
              <p className="text-3xl font-bold text-green-600">{item.value}</p>
              <p className="mt-1 text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Funcionalidades ──────────────────────────────────────── */}
      <section id="funcionalidades" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900">
            Tudo que você precisa para economizar
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            Uma plataforma completa de análise para consumidores residenciais, comerciais e industriais.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: FileText,
              color: 'bg-blue-50 text-blue-600',
              title: 'Extração automática de dados',
              desc: 'Envie o PDF da fatura e a IA extrai automaticamente consumo, demanda, tarifas, tributos e muito mais.',
            },
            {
              icon: TrendingDown,
              color: 'bg-green-50 text-green-600',
              title: 'Análise de demanda (Grupo A)',
              desc: 'Detecta sobrecontratação e ultrapassagem de demanda. Calcula a economia exata ao ajustar o contrato.',
            },
            {
              icon: ShieldCheck,
              color: 'bg-red-50 text-red-600',
              title: 'Alertas de cobranças indevidas',
              desc: 'Identifica fator de potência fora do limite, EREX (reativos), COSIP acima do padrão e outros encargos.',
            },
            {
              icon: Sun,
              color: 'bg-yellow-50 text-yellow-600',
              title: 'Simulação solar fotovoltaica',
              desc: 'Calcula o potencial de geração solar, dimensiona o sistema em kWp e estima o payback do investimento.',
            },
            {
              icon: BarChart3,
              color: 'bg-purple-50 text-purple-600',
              title: 'Comparativo tarifário Verde vs Azul',
              desc: 'Simula as duas modalidades e indica qual gera menor custo com base no seu perfil de consumo real.',
            },
            {
              icon: Zap,
              color: 'bg-orange-50 text-orange-600',
              title: 'Relatório profissional em PDF',
              desc: 'Gere um relatório completo para apresentar à diretoria, ao cliente ou à concessionária.',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ────────────────────────────────────────── */}
      <section id="como-funciona" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Como funciona</h2>
            <p className="mt-3 text-slate-500">Análise completa em 3 passos simples</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Crie sua Conta',
                desc: 'Cadastre-se gratuitamente em segundos. Sem cartão de crédito, sem burocracia.',
              },
              {
                step: '02',
                title: 'Envie a fatura em PDF',
                desc: 'Faça o upload do PDF da sua conta de luz. O sistema suporta faturas de qualquer distribuidora brasileira.',
              },
              {
                step: '03',
                title: 'Receba a análise',
                desc: 'Em segundos você vê os insights, oportunidades de economia e recomendações práticas com valores calculados.',
              },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white text-lg font-bold">
                  {s.step}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ───────────────────────────────────────────────── */}
      <section id="planos" className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900">Planos simples e transparentes</h2>
          <p className="mt-3 text-slate-500">Comece grátis. Faça upgrade quando precisar.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* FREE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap">
              Versão Beta — 3 meses grátis
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Free</p>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-4xl font-bold text-slate-900">R$ 0</p>
              <p className="text-lg font-medium text-slate-400 line-through">R$ 49</p>
            </div>
            <p className="text-slate-500 text-sm mt-1">por 3 meses · 100% de desconto</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {['1 unidade consumidora', '3 faturas/mês', 'Análise básica', 'Insights de economia'].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="mt-8 block w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Começar grátis
            </Link>
          </div>

          {/* PRO */}
          <div className="rounded-2xl border-2 border-green-500 bg-white p-7 shadow-lg shadow-green-500/10 relative overflow-hidden">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
              Mais popular
            </div>
            {/* Em breve overlay */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-2xl">
              <span className="text-2xl font-bold text-slate-700">Em breve</span>
              <span className="mt-1 text-sm text-slate-500">Lançamento em 06/2026</span>
            </div>
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Pro</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">R$ 49</p>
            <p className="text-slate-500 text-sm mt-1">por mês</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {[
                '10 unidades consumidoras',
                'Faturas ilimitadas',
                'Análise completa A e B',
                'Simulação solar',
                'Comparativo Verde/Azul',
                'Exportação PDF profissional',
                'Suporte por e-mail',
              ].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="mt-8 block w-full rounded-lg bg-green-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Assinar Pro
            </Link>
          </div>

          {/* ENTERPRISE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 relative overflow-hidden">
            {/* Em breve overlay */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-2xl">
              <span className="text-2xl font-bold text-slate-700">Em breve</span>
              <span className="mt-1 text-sm text-slate-500">Lançamento em 06/2026</span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Enterprise</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">Custom</p>
            <p className="text-slate-500 text-sm mt-1">sob consulta</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {[
                'Unidades ilimitadas',
                'API de integração',
                'White-label',
                'Onboarding dedicado',
                'SLA contratual',
                'Suporte prioritário',
              ].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
            <a
              href="mailto:contato@energyai.com.br"
              className="mt-8 block w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Falar com vendas
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────── */}
      <section className="bg-[#0a1628] py-20 text-center text-white">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold">Comece a economizar hoje</h2>
          <p className="mt-4 text-slate-400">
            Cadastre-se gratuitamente e analise sua primeira fatura em menos de 1 minuto.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-400 transition-colors"
          >
            Criar conta grátis
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-400 sm:flex-row">
          <span className="text-slate-400">Created by Wegga Energy</span>
          <div className="flex items-center gap-2">
            <Image src="/logo2.png" alt="EnergyAI" width={43} height={43} />
            <span className="font-semibold text-slate-600">EnergyAI</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Termos</a>
            <a href="mailto:contato@energyai.com.br" className="hover:text-slate-600 transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

