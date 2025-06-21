import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    // Validar email y password estrictamente antes de seguir
    if (email !== 'panel@encantia.lat' || password !== 'JJBJNL') {
      setError('Credenciales incorrectas.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/inicio')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 text-gray-100 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-semibold mb-6 text-center">Iniciar sesión</h1>

        {error && (
          <div className="mb-4 bg-red-700 text-red-200 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <label className="block mb-2 font-medium" htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 mb-5"
        />

        <label className="block mb-2 font-medium" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded bg-blue-600 hover:bg-blue-700 transition-colors font-semibold ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <p className="mt-6 text-center text-gray-400">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="text-blue-400 hover:underline">
            Regístrate aquí
          </a>
        </p>
      </form>
    </div>
  )
}
