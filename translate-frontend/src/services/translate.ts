import { type FromLanguage, type Language } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function translate({
  fromLanguage,
  toLanguage,
  text
}: {
  fromLanguage: FromLanguage
  toLanguage: Language
  text: string
}): Promise<string> {
  if (fromLanguage === toLanguage) return text

  try {
    const response = await fetch(`${API_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromLanguage,
        toLanguage,
        text
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error en la traducción')
    }

    const data = await response.json()
    return data.translation

  } catch (error) {
    console.error('Error al traducir:', error)

    if (error instanceof Error) {
      throw new Error(error.message)
    }

    throw new Error('No se pudo conectar con el servidor')
  }
}