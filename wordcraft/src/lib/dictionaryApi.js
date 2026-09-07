const REQUEST_TIMEOUT_MS = 5000

function splitDefinition(rawDefinition = '') {
  const [partOfSpeech = 'word', ...definitionParts] = rawDefinition.split('\t')
  return {
    type: partOfSpeech.trim() || 'word',
    definition: definitionParts.join('\t').trim() || rawDefinition.trim(),
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, { signal: controller.signal })
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('TIMEOUT')
    throw new Error('NETWORK_ERROR')
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export async function fetchDictionaryEntry(word) {
  const response = await fetchWithTimeout(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=d&max=1`)
  if (!response.ok) throw new Error('NETWORK_ERROR')

  const matches = await response.json()
  const entry = matches.find((item) => item.word.toLowerCase() === word.toLowerCase())
  const firstDefinition = entry?.defs?.[0]

  if (!firstDefinition) throw new Error('NOT_FOUND')

  const { type, definition } = splitDefinition(firstDefinition)
  return {
    word: entry.word,
    type,
    level: '在线词典',
    syllables: entry.word,
    uk: '—',
    us: '—',
    ukAudio: '',
    usAudio: '',
    definition,
    translations: [],
    forms: [],
    examples: [],
    related: [],
    etymology: '',
    source: 'Datamuse Dictionary API',
  }
}
