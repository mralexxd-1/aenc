import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const MUSIC_BASE_URL = 'https://music.encantia.lat/'

export default function GestionMusicas() {
  const [musicas, setMusicas] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    categoria: '',
    musica_filename: '',
    portada_url: '',
    titulo: '',
    autor: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function fetchMusicas() {
    setLoading(true)
    const { data, error } = await supabase
      .from('musicas')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setMusicas(data)
      setError(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMusicas()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function validarNombreArchivo(filename) {
    // Verifica que termine en .mp3 (minúscula o mayúscula) y que no contenga espacios
    return /^([a-zA-Z0-9_\-]+)\.mp3$/i.test(filename)
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    const { categoria, musica_filename, portada_url, titulo, autor } = form

    if (!categoria || !musica_filename || !titulo || !autor) {
      setError('Por favor completa todos los campos obligatorios.')
      setSaving(false)
      return
    }

    if (!validarNombreArchivo(musica_filename)) {
      setError(
        'El nombre del archivo debe terminar en ".mp3" y no contener espacios ni caracteres especiales.'
      )
      setSaving(false)
      return
    }

    const musica_url = MUSIC_BASE_URL + musica_filename

    const { error } = await supabase.from('musicas').insert([
      {
        categoria,
        musica_url,
        portada_url,
        titulo,
        autor,
      },
    ])

    if (error) {
      setError(error.message)
    } else {
      setForm({
        categoria: '',
        musica_filename: '',
        portada_url: '',
        titulo: '',
        autor: '',
      })
      setError(null)
      fetchMusicas()
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('¿Seguro que quieres eliminar esta música?')) return
    const { error } = await supabase.from('musicas').delete().eq('id', id)
    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      fetchMusicas()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Gestión de Músicas</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleAdd} className="mb-8 space-y-4 bg-gray-800 p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Agregar Nueva Música</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            placeholder="Categoría *"
            className="p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-gray-100 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Título *"
            className="p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-gray-100 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            name="autor"
            value={form.autor}
            onChange={handleChange}
            placeholder="Autor *"
            className="p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-gray-100 focus:outline-none focus:border-blue-500"
            required
          />

          {/* Aquí el input con prefijo fijo */}
          <div className="flex items-center rounded bg-gray-700 border border-gray-600 focus-within:border-blue-500">
            <span className="px-3 text-gray-300 select-none">{MUSIC_BASE_URL}</span>
            <input
              name="musica_filename"
              value={form.musica_filename}
              onChange={handleChange}
              placeholder="nombrearchivo.mp3 *"
              className="flex-1 p-2 bg-transparent placeholder-gray-400 text-gray-100 focus:outline-none"
              required
              pattern="^[a-zA-Z0-9_\-]+\.mp3$"
              title="Debe terminar en .mp3 y no contener espacios ni caracteres especiales"
            />
          </div>

          <input
            name="portada_url"
            value={form.portada_url}
            onChange={handleChange}
            placeholder="URL Portada"
            className="p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-gray-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded transition"
        >
          {saving ? 'Guardando...' : 'Agregar Música'}
        </button>
      </form>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Listado de Músicas</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="w-full table-auto text-left border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 px-4 py-2">ID</th>
                <th className="border border-gray-700 px-4 py-2">Categoría</th>
                <th className="border border-gray-700 px-4 py-2">Título</th>
                <th className="border border-gray-700 px-4 py-2">Autor</th>
                <th className="border border-gray-700 px-4 py-2">Portada</th>
                <th className="border border-gray-700 px-4 py-2">URL Música</th>
                <th className="border border-gray-700 px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {musicas.map(({ id, categoria, titulo, autor, portada_url, musica_url }) => (
                <tr key={id} className="even:bg-gray-800 odd:bg-gray-700">
                  <td className="border border-gray-700 px-4 py-2">{id}</td>
                  <td className="border border-gray-700 px-4 py-2">{categoria}</td>
                  <td className="border border-gray-700 px-4 py-2">{titulo}</td>
                  <td className="border border-gray-700 px-4 py-2">{autor}</td>
                  <td className="border border-gray-700 px-4 py-2">
                    {portada_url ? (
                      <img
                        src={portada_url}
                        alt={titulo}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-500 italic">Sin portada</span>
                    )}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    <a
                      href={musica_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Escuchar
                    </a>
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    <button
                      onClick={() => handleDelete(id)}
                      className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1 text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
