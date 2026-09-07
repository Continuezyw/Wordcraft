export const starterEntries = [
  {
    word: 'satirize',
    type: 'verb',
    level: 'C1',
    syllables: 'sat·i·rize',
    uk: '/ˈsæt.ɪ.raɪz/',
    us: '/ˈsæt̬.ə.raɪz/',
    definition: 'to use humour, irony, or exaggeration to criticize or make fun of someone or something',
    translations: ['讽刺', '嘲讽'],
    forms: [['third person', 'satirizes'], ['present participle', 'satirizing'], ['past tense', 'satirized'], ['past participle', 'satirized']],
    examples: ['The cartoonist often satirizes political leaders in her work.', 'The novel satirizes the excesses of modern consumer culture.'],
    related: ['satire', 'satirical', 'satirist'],
    etymology: 'From satire, a literary work that uses humour or ridicule to expose human weakness.',
    source: '内置词典',
  },
  {
    word: 'eloquent',
    type: 'adjective',
    level: 'C1',
    syllables: 'el·o·quent',
    uk: '/ˈel.ə.kwənt/',
    us: '/ˈel.ə.kwənt/',
    definition: 'able to use language clearly and effectively; expressing ideas or feelings in a powerful way',
    translations: ['雄辩的', '有说服力的'],
    forms: [['adverb', 'eloquently'], ['noun', 'eloquence'], ['comparative', 'more eloquent'], ['superlative', 'most eloquent']],
    examples: ['Her eloquent speech moved the audience deeply.', 'The empty chair was an eloquent symbol of his absence.'],
    related: ['eloquence', 'expressive', 'articulate'],
    etymology: 'From Latin eloqui, meaning “to speak out”.',
    source: '内置词典',
  },
  {
    word: 'resilient',
    type: 'adjective',
    level: 'B2',
    syllables: 're·sil·ient',
    uk: '/rɪˈzɪl.i.ənt/',
    us: '/rɪˈzɪl.jənt/',
    definition: 'able to become strong, happy, or successful again after a difficult situation or event',
    translations: ['有韧性的', '能迅速恢复的'],
    forms: [['adverb', 'resiliently'], ['noun', 'resilience'], ['opposite', 'fragile'], ['common phrase', 'highly resilient']],
    examples: ['Children can be remarkably resilient after setbacks.', 'The city proved resilient in the face of the crisis.'],
    related: ['resilience', 'adaptable', 'robust'],
    etymology: 'From Latin resilire, “to spring back”.',
    source: '内置词典',
  },
]

export function findLocalEntry(word, importedEntries = []) {
  const normalizedWord = word.trim().toLowerCase()
  return [...starterEntries, ...importedEntries].find((entry) => entry.word.toLowerCase() === normalizedWord)
}

export function createImportedEntry(word, tag = '') {
  return {
    word,
    type: 'word list entry',
    level: tag || '导入词库',
    syllables: word,
    uk: '—',
    us: '—',
    definition: '',
    translations: [],
    forms: [],
    examples: [],
    related: [],
    etymology: '',
    source: tag ? `导入词库 · ${tag}` : '导入词库',
    imported: true,
  }
}
