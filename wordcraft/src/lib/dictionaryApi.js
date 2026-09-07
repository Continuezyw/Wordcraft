const PRIMARY_TIMEOUT_MS = 5000
const FALLBACK_TIMEOUT_MS = 3000

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      if (response.status === 404) throw new Error('NOT_FOUND')
      throw new Error('REQUEST_FAILED')
    }
    return response
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('TIMEOUT')
    throw error.message === 'NOT_FOUND' ? error : new Error('NETWORK_ERROR')
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function phoneticFor(entry, region) {
  const phonetics = entry.phonetics || []
  const suffix = region === 'uk' ? '-uk' : '-us'
  return phonetics.find((item) => item.text && item.audio?.includes(suffix))?.text
    || phonetics.find((item) => item.text)?.text
    || '—'
}

function audioFor(entry, region) {
  const phonetics = entry.phonetics || []
  const suffix = region === 'uk' ? '-uk' : '-us'
  return phonetics.find((item) => item.audio && item.audio.includes(suffix))?.audio
    || phonetics.find((item) => item.audio)?.audio
    || ''
}

async function fetchFreeDictionaryEntry(word) {
  const response = await fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, PRIMARY_TIMEOUT_MS)
  const [entry] = await response.json()
  const meanings = entry.meanings || []
  const senses = meanings.flatMap((meaning) => (meaning.definitions || []).map((item) => ({
    type: meaning.partOfSpeech || 'word',
    definition: item.definition,
    example: item.example || '',
    synonyms: [...(item.synonyms || []), ...(meaning.synonyms || [])],
    antonyms: [...(item.antonyms || []), ...(meaning.antonyms || [])],
  })))
  const primary = senses[0]

  if (!primary?.definition) throw new Error('NOT_FOUND')

  return {
    word: entry.word,
    type: primary.type,
    level: '在线词典',
    syllables: entry.word,
    uk: phoneticFor(entry, 'uk'),
    us: phoneticFor(entry, 'us'),
    ukAudio: audioFor(entry, 'uk'),
    usAudio: audioFor(entry, 'us'),
    definition: primary.definition,
    senses: senses.slice(0, 8),
    translations: [],
    forms: [...new Set(meanings.map((meaning) => meaning.partOfSpeech).filter(Boolean))].map((partOfSpeech) => ['part of speech', partOfSpeech]),
    examples: senses.map((sense) => sense.example).filter(Boolean).slice(0, 3),
    related: [...new Set(senses.flatMap((sense) => [...sense.synonyms, ...sense.antonyms]))].slice(0, 6),
    etymology: entry.origin || '',
    source: 'Free Dictionary API',
  }
}

function splitDefinition(rawDefinition = '') {
  const [partOfSpeech = 'word', ...definitionParts] = rawDefinition.split('\t')
  return { type: partOfSpeech.trim() || 'word', definition: definitionParts.join('\t').trim() || rawDefinition.trim() }
}

async function fetchDatamuseEntry(word) {
  const response = await fetchWithTimeout(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=dps&max=1`, FALLBACK_TIMEOUT_MS)
  const matches = await response.json()
  const entry = matches.find((item) => item.word.toLowerCase() === word.toLowerCase())
  const firstDefinition = entry?.defs?.[0]
  if (!firstDefinition) throw new Error('NOT_FOUND')

  const { type, definition } = splitDefinition(firstDefinition)
  const syllables = entry.numSyllables ? `${entry.word} · ${entry.numSyllables} syllables` : entry.word
  return {
    word: entry.word,
    type,
    level: '在线词典（简版）',
    syllables,
    uk: '—', us: '—', ukAudio: '', usAudio: '',
    definition,
    senses: [{ type, definition, example: '', synonyms: [], antonyms: [] }],
    translations: [], forms: [], examples: [], related: [], etymology: '',
    source: 'Datamuse Dictionary API · 备用',
  }
}

export async function fetchDictionaryEntry(word) {
  try {
    return await fetchFreeDictionaryEntry(word)
  } catch (primaryError) {
    if (primaryError.message === 'NOT_FOUND') throw primaryError
    try {
      return await fetchDatamuseEntry(word)
    } catch (fallbackError) {
      if (primaryError.message === 'TIMEOUT' && fallbackError.message === 'TIMEOUT') throw new Error('TIMEOUT')
      if (fallbackError.message === 'NOT_FOUND') throw fallbackError
      throw new Error('NETWORK_ERROR')
    }
  }
}
