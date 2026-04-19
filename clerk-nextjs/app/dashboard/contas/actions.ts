'use server'

import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function criarConta(formData: FormData) {
  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/sign-in')

  const email = clerkUser.emailAddresses?.[0]?.emailAddress
  if (!email) return { error: 'Conta Clerk sem e-mail.' }

  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {},
    create: {
      clerkId: clerkUser.id,
      email,
      nome: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
    },
  })

  const distribuidora = (formData.get('distribuidora') as string)?.trim()
  const titular = (formData.get('titular') as string)?.trim() || null
  const numeroCliente = (formData.get('numeroCliente') as string)?.trim() || null
  const endereco = (formData.get('endereco') as string)?.trim() || null

  if (!distribuidora) {
    return { error: 'Distribuidora é obrigatória.' }
  }

  const conta = await prisma.conta.create({
    data: {
      userId: dbUser.id,
      distribuidora,
      titular,
      numeroCliente,
      endereco,
    },
  })

  redirect(`/dashboard/contas/${conta.id}`)
}

export async function excluirConta(contaId: string) {
  const clerkUser = await currentUser()
  if (!clerkUser) return { error: 'Não autenticado.' }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
  if (!dbUser) return { error: 'Usuário não encontrado.' }

  const conta = await prisma.conta.findUnique({ where: { id: contaId } })
  if (!conta || conta.userId !== dbUser.id) return { error: 'Conta não encontrada.' }

  await prisma.conta.delete({ where: { id: contaId } })

  revalidatePath('/dashboard/contas')
  return { success: true }
}

export async function atualizarTitular(contaId: string, titular: string) {
  const clerkUser = await currentUser()
  if (!clerkUser) return { error: 'Não autenticado.' }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
  if (!dbUser) return { error: 'Usuário não encontrado.' }

  const conta = await prisma.conta.findUnique({ where: { id: contaId } })
  if (!conta || conta.userId !== dbUser.id) return { error: 'Conta não encontrada.' }

  await prisma.conta.update({ where: { id: contaId }, data: { titular: titular.trim() || null } })
  revalidatePath('/dashboard/contas')
  return { success: true }
}
