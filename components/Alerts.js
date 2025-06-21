import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const typeStyles = {
  info: 'bg-blue-500 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-400 text-black',
  success: 'bg-green-600 text-white',
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    async function fetchAlerts() {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setAlerts(data)
      }
    }

    fetchAlerts()

    const subscription = supabase
      .channel('public:alerts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev => prev.map(a => (a.id === payload.new.id ? payload.new : a)))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  async function dismissAlert(id) {
    const { error } = await supabase
      .from('alerts')
      .update({ active: false })
      .eq('id', id)

    if (!error) {
      setAlerts(prev => prev.filter(a => a.id !== id))
    }
  }

  if (alerts.length === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col space-y-2 p-4">
      {alerts.map(({ id, message, type }) => (
        <div
          key={id}
          className={`flex justify-between items-center px-4 py-2 rounded shadow-md max-w-4xl mx-auto cursor-pointer select-none ${typeStyles[type] || typeStyles.info}`}
          onClick={() => dismissAlert(id)}
          title="Haz click para cerrar esta alerta"
        >
          <span>{message}</span>
          <button
            aria-label="Cerrar alerta"
            onClick={e => {
              e.stopPropagation()
              dismissAlert(id)
            }}
            className="ml-4 font-bold"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
