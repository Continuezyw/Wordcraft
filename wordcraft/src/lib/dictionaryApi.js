function phoneticFor(entry, region) {
  const phonetics = entry.phonetics || []
  const preferred = phonetics.find((item) => item.text && item.audio?.includes(region === 'uk' ? '-uk' : '-us'))
  return preferred?.text || phonetics.find((item) => item.text)?.text || '—'
}

function audioFor(entry, region) {
  const phonetics = entry.phonetics || []
  const preferred = phonetics.find((item) => item.audio && item.audio.includes(region === 'uk' ? '-uk' : '-us'))
  return preferred?.audio || phonetics.find((item) => item.audio)?.audio || ''
}

export async function fetchDictionaryEntry(word) {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
  if (!response.ok) {
    if (response.status === 404) throw new Error('NOT_FOUND')
    throw new Error('REQUEST_FAILED')
  }

  const [entry] = await response.json()
  const meanings = entry.meanings || []
  const definitions = meanings.flatMap((meaning) => meaning.definitions?.map((item) => ({
    type: meaning.partOfSpeech,
    definition: item.definition,
    example: item.example,
    synonyms: item.synonyms || meaning.synonyms || [],
    antonyms: item.antonyms || meaning.antonyms || [],
  })) || [])
  const primary = definitions[0]

  if (!primary) throw new Error('NOT_FOUND')

  const related = [...new Set([...primary.synonyms, ...primary.antonyms])].slice(0, 5)
  const examples = definitions.map((item) => item.example).filter(Boolean).slice(0, 2)

  return {
    word: entry.word,
    type: primary.type || 'word',
    level: '在线词典',
    syllables: entry.word,
    uk: phoneticFor(entry, 'uk'),
    us: phoneticFor(entry, 'us'),
    ukAudio: audioFor(entry, 'uk'),
    usAudio: audioFor(entry, 'us'),
    definition: primary.definition,
    translations: [],
    forms: [],
    examples,
    related,
    etymology: entry.origin || '',
    source: 'Free Dictionary API',
  }
}
