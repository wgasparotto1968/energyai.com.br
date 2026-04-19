'use server'

import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

export async function deletarFatura(
  faturaId: string,
): Promise<{ ok: true } | { error: string }> {
  const clerkUser = await currentUser()
  if (!clerkUser) return { error: 'Não autenticado.' }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
  if (!dbUser) return { error: 'Usuário não encontrado.' }

  // Verifica posse da fatura via conta
  const fatura = await prisma.fatura.findFirst({
    where: { id: faturaId, conta: { userId: dbUser.id } },
  })
  if (!fatura) return { error: 'Fatura não encontrada.' }

  // Remove arquivo do Supabase Storage
  if (fatura.arquivoUrl) {
    try {
      // Extrai o path relativo a partir da URL pública
      const url = new URL(fatura.arquivoUrl)
      const parts = url.pathname.split('/storage/v1/object/public/faturas/')
      if (parts[1]) {
        await supabaseAdmin.storage.from('faturas').remove([parts[1]])
      }
    } catch {
      // Não bloqueia a exclusão se o arquivo já não existir
    }
  }

  await prisma.fatura.delete({ where: { id: faturaId } })

  return { ok: true }
}
