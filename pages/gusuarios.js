import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  UserIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function GUsuarios() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    pin: '',
    description: '',
    role: '',
  })
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      showNotification('error', 'Error al cargar usuarios: ' + error.message)
    } else {
      setProfiles(data)
    }
    setLoading(false)
  }

  function showNotification(type, message) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  function startEdit(profile) {
    setEditingId(profile.user_id)
    setEditData({
      name: profile.name || '',
      email: profile.email || '',
      pin: profile.pin || '',
      description: profile.description || '',
      role: profile.role || '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditData({
      name: '',
      email: '',
      pin: '',
      description: '',
      role: '',
    })
  }

  async function saveEdit(user_id) {
    if (!editData.name.trim()) {
      showNotification('error', 'El nombre no puede estar vacío')
      return
    }
    if (!editData.email.trim()) {
      showNotification('error', 'El email no puede estar vacío')
      return
    }
    if (!editData.role.trim()) {
      showNotification('error', 'El rol no puede estar vacío')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        name: editData.name,
        email: editData.email,
        pin: editData.pin,
        description: editData.description,
        role: editData.role,
        updated_at: new Date(),
      })
      .eq('user_id', user_id)

    if (error) {
      showNotification('error', 'Error al guardar usuario: ' + error.message)
    } else {
      showNotification('success', 'Usuario actualizado')
      await fetchProfiles()
      cancelEdit()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        Cargando usuarios...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UserIcon className="w-8 h-8 text-blue-400" />
        Gestión de Usuarios
      </h1>

      {notification && (
        <div
          className={`mb-4 px-4 py-2 rounded ${
            notification.type === 'success'
              ? 'bg-green-600 text-green-100'
              : 'bg-red-600 text-red-100'
          }`}
        >
          {notification.message}
        </div>
      )}

      {profiles.length === 0 ? (
        <p className="text-gray-400">No hay usuarios disponibles.</p>
      ) : (
        <div className="space-y-6">
          {profiles.map(profile =>
            editingId === profile.user_id ? (
              <div
                key={profile.user_id}
                className="bg-gray-800 p-6 rounded shadow flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-gray-500" />
                  )}
                  <span className="text-gray-400 select-none">
                    ID: {profile.user_id}
                  </span>
                </div>

                <label className="flex flex-col">
                  <span className="font-semibold mb-1">Nombre:</span>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, name: e.target.value }))
                    }
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="font-semibold mb-1">Email:</span>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, email: e.target.value }))
                    }
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="font-semibold mb-1">PIN:</span>
                  <input
                    type="text"
                    value={editData.pin}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, pin: e.target.value }))
                    }
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="font-semibold mb-1">Descripción:</span>
                  <textarea
                    rows={3}
                    value={editData.description}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, description: e.target.value }))
                    }
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="font-semibold mb-1">Rol:</span>
                  <input
                    type="text"
                    value={editData.role}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, role: e.target.value }))
                    }
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => saveEdit(profile.user_id)}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 rounded flex items-center gap-2"
                  >
                    <CheckIcon className="w-5 h-5" />
                    Guardar
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded flex items-center gap-2"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={profile.user_id}
                className="bg-gray-800 p-4 rounded shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-4 max-w-[75%] truncate">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-gray-500" />
                  )}
                  <div className="truncate">
                    <p className="font-semibold truncate">{profile.name}</p>
                    <p className="text-gray-400 text-sm truncate">{profile.email}</p>
                    <p className="text-gray-400 text-xs truncate">
                      Rol: {profile.role || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => startEdit(profile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  aria-label={`Editar usuario ${profile.name}`}
                >
                  <PencilSquareIcon className="w-5 h-5" />
                  Editar
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
