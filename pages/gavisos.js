import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

export default function GAvisos() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ message: '', type: 'success', active: true })
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchAlerts()
  }, [])

  async function fetchAlerts() {
    setLoading(true)
    const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false })
    if (error) {
      showNotification('error', 'Error al cargar avisos: ' + error.message)
    } else {
      setAlerts(data)
    }
    setLoading(false)
  }

  function showNotification(type, message) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  function startEdit(alert) {
    setEditingId(alert.id)
    setEditData({
      message: alert.message,
      type: alert.type,
      active: alert.active,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditData({ message: '', type: 'success', active: true })
  }

  async function saveEdit(id) {
    if (!editData.message.trim()) {
      showNotification('error', 'El mensaje no puede estar vacío')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('alerts')
      .update({
        message: editData.message,
        type: editData.type,
        active: editData.active,
      })
      .eq('id', id)

    if (error) {
      showNotification('error', 'Error al guardar aviso: ' + error.message)
    } else {
      showNotification('success', 'Aviso actualizado')
      await fetchAlerts()
      cancelEdit()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        Cargando avisos...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ExclamationCircleIcon className="w-8 h-8 text-yellow-400" />
        Gestión de Avisos
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

      {alerts.length === 0 ? (
        <p className="text-gray-400">No hay avisos disponibles.</p>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert =>
            editingId === alert.id ? (
              <div
                key={alert.id}
                className="bg-gray-800 p-4 rounded shadow flex flex-col gap-3"
              >
                <label className="flex flex-col">
                  <span className="font-semibold mb-1">Mensaje:</span>
                  <textarea
                    rows={3}
                    value={editData.message}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, message: e.target.value }))
                    }
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="success"
                    checked={editData.type === 'success'}
                    onChange={() => setEditData(prev => ({ ...prev, type: 'success' }))}
                  />
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  Éxito
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="error"
                    checked={editData.type === 'error'}
                    onChange={() => setEditData(prev => ({ ...prev, type: 'error' }))}
                  />
                  <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
                  Error
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.active}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, active: e.target.checked }))
                    }
                  />
                  Activo
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(alert.id)}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <CheckIcon className="w-5 h-5" />
                    Guardar
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={alert.id}
                className={`bg-gray-800 p-4 rounded shadow flex justify-between items-center ${
                  alert.active ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                }`}
              >
                <div className="flex items-center gap-3 max-w-[80%]">
                  {alert.type === 'success' ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  ) : (
                    <ExclamationCircleIcon className="w-6 h-6 text-red-400" />
                  )}
                  <p className="truncate">{alert.message}</p>
                </div>
                <button
                  onClick={() => startEdit(alert)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                  aria-label="Editar aviso"
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
