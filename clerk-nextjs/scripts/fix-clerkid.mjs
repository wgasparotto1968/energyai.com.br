// Migra o clerkId antigo para o novo (mesmo e-mail, novo login Google)
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const OLD_CLERK_ID = 'user_3CGiSZ3bXRnGUpZfCufxcYxFxwf'
const NEW_CLERK_ID = 'user_3Cb64HMwMUQ49sxqOYPZ4Y1NdUC'

async function main() {
  const user = await prisma.user.findUnique({ where: { clerkId: OLD_CLERK_ID } })
  if (!user) { console.log('Usuário antigo não encontrado'); return }

  console.log(`Atualizando clerkId de ${user.email}`)
  console.log(`  ${OLD_CLERK_ID} → ${NEW_CLERK_ID}`)

  // Verifica se o novo clerkId já existe (evita conflito de unique)
  const existing = await prisma.user.findUnique({ where: { clerkId: NEW_CLERK_ID } })
  if (existing) {
    console.log(`Novo clerkId já existe (id: ${existing.id}). Deletando registro duplicado vazio...`)
    await prisma.user.delete({ where: { clerkId: NEW_CLERK_ID } })
  }

  await prisma.user.update({
    where: { clerkId: OLD_CLERK_ID },
    data: { clerkId: NEW_CLERK_ID },
  })

  console.log('✓ clerkId atualizado com sucesso!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
