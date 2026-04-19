import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import NovaFaturaForm from './NovaFaturaForm'

export default async function NovaFaturaPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/sign-in')

  return (
    <Suspense fallback={<div className="max-w-lg animate-pulse"><div className="h-8 bg-slate-200 rounded w-48 mb-4" /><div className="h-64 bg-slate-100 rounded-xl" /></div>}>
      <NovaFaturaForm />
    </Suspense>
  )
}
