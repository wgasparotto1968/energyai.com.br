import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json() as { nome?: unknown }
  const nome = typeof body.nome === 'string' ? body.nome.trim() : null

  if (!nome || nome.length < 2 || nome.length > 80) {
    return NextResponse.json({ error: 'Nome inválido.' }, { status: 400 })
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? ''
  await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { nome },
    create: { clerkId: clerkUser.id, email, nome },
  })

  return NextResponse.json({ ok: true })
}
