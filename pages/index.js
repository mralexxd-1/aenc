import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) window.location.href = '/login'
      else setUser(user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Hola, {user.email}</h1>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
