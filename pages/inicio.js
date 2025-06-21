import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  MusicalNoteIcon,
  SpeakerWaveIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

// Banner superior con diseño pastel y compacto
function NotificationBanner({ type = 'success', message }) {
  const bg =
    type === 'success'
      ? 'bg-green-100 text-green-900 border-green-300'
      : 'bg-red-100 text-red-900 border-red-300'
  const Icon = type === 'success' ? CheckCircleIcon : ExclamationCircleIcon

  if (!message) return null

  return (
    <div className={`w-full border-b ${bg} px-4 py-2 text-sm`}>
      <div className="max-w-4xl mx-auto flex items-start gap-2">
        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  )
}

export default function Inicio() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)
  const [alerts, setAlerts] = useState([])

  const router = useRouter()

  useEffect(() => {
    async function loadUserAndProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }
      setUser(user)

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profiles) {
        setProfile(profiles)
      }
      setLoading(false)
    }

    async function fetchAlerts() {
      const { data, error } = await supabase
        .from('alertsadmin')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (!error) {
        setAlerts(data)
      }
    }

    loadUserAndProfile()
    fetchAlerts()
  }, [router])

  async function saveProfile(e) {
    e.preventDefault()
    if (!name) {
      showNotification('error', 'Por favor escribe un nombre de usuario.')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('profiles').insert({
      user_id: user.id,
      name,
      email: user.email,
      created_at: new Date(),
      updated_at: new Date(),
    })

    if (error) {
      showNotification('error', 'Error al guardar perfil: ' + error.message)
    } else {
      showNotification('success', 'Perfil creado correctamente!')
      setProfile({ user_id: user.id, name, email: user.email })
    }
    setSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Buenos días'
    if (hour >= 12 && hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  function showNotification(type, message) {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        Cargando...
      </div>
    )
  }

  return (
    <>
      {/* Alertas permanentes activas */}
      {alerts
        .filter(alert => alert.type === 'error')
        .map(alert => (
          <NotificationBanner key={alert.id} type={alert.type} message={alert.message} />
        ))}

      {/* Notificaciones temporales tipo success */}
      {notification && notification.type !== 'error' && (
        <NotificationBanner type={notification.type} message={notification.message} />
      )}

      <div className="min-h-screen bg-gray-900 text-gray-100">
        {/* Navbar eliminado */}

        <main className="p-6 max-w-3xl mx-auto">
          {!profile ? (
            <section className="bg-gray-800 p-6 rounded shadow-md">
              <h2 className="text-2xl mb-4 font-semibold">Crea tu perfil</h2>
              <form onSubmit={saveProfile} className="flex flex-col space-y-4">
                <label className="flex flex-col text-sm">
                  Nombre de usuario:
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded text-sm transition"
                >
                  {saving ? 'Guardando...' : 'Guardar Perfil'}
                </button>
              </form>
            </section>
          ) : (
            <section>
              <h1 className="text-3xl font-bold mb-8">
                {getGreeting()}, {profile.name}
              </h1>

              <div className="flex flex-col space-y-4 max-w-md">
                <button
                  onClick={() => router.push('/gmusica')}
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 transition rounded py-3 px-5 font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <MusicalNoteIcon className="w-6 h-6" />
                  Gestión de Músicas
                </button>

                <button
                  onClick={() => router.push('/gavisos')}
                  className="flex items-center gap-3 bg-green-600 hover:bg-green-700 transition rounded py-3 px-5 font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <SpeakerWaveIcon className="w-6 h-6" />
                  Gestión de Avisos
                </button>

                <button
                  onClick={() => alert('Ir a Gestión de Usuarios')}
                  className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 transition rounded py-3 px-5 font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <UsersIcon className="w-6 h-6" />
                  Gestión de Usuarios
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  )
}
