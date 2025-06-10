import { redirect } from 'next/navigation'

export default function Page() {
    redirect('/login')
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    </div>
  )
}