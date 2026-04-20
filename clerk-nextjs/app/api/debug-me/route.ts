import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: { contas: { include: { faturas: { select: { id: true, mes: true, ano: true, status: true } } } } },
  })

  return NextResponse.json({
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses.map(e => e.emailAddress),
    dbUser: dbUser ? { id: dbUser.id, email: dbUser.email, contas: dbUser.contas.length, faturas: dbUser.contas.flatMap(c => c.faturas).length } : null,
  })
}
