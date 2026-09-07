import { useEffect, useMemo, useState } from 'react'
import './App.css'

const entries = [
  {
    word: 'satirize',
    type: 'verb',
    level: 'C1',
    syllables: 'sat·i·rize',
    uk: '/ˈsæt.ɪ.raɪz/',
    us: '/ˈsæt̬.ə.raɪz/',
    definition: 'to use humour, irony, or exaggeration to criticize or make fun of someone or something',
    translations: ['讽刺', '嘲讽'],
    forms: [
      ['third person', 'satirizes'],
      ['present participle', 'satirizing'],
      ['past tense', 'satirized'],
      ['past participle', 'satirized'],
    ],
    examples: [
      'The cartoonist often satirizes political leaders in her work.',
      'The novel satirizes the excesses of modern consumer culture.',
    ],
    related: ['satire', 'satirical', 'satirist'],
    etymology: 'From satire, a literary work that uses humour or ridicule to expose human weakness.',
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
    forms: [
      ['adverb', 'eloquently'],
      ['noun', 'eloquence'],
      ['comparative', 'more eloquent'],
      ['superlative', 'most eloquent'],
    ],
    examples: [
      'Her eloquent speech moved the audience deeply.',
      'The empty chair was an eloquent symbol of his absence.',
    ],
    related: ['eloquence', 'expressive', 'articulate'],
    etymology: 'From Latin eloqui, meaning “to speak out”.',
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
    forms: [
      ['adverb', 'resiliently'],
      ['noun', 'resilience'],
      ['opposite', 'fragile'],
      ['common phrase', 'highly resilient'],
    ],
    examples: [
      'Children can be remarkably resilient after setbacks.',
      'The city proved resilient in the face of the crisis.',
    ],
    related: ['resilience', 'adaptable', 'robust'],
    etymology: 'From Latin resilire, “to spring back”.',
  },
]

function SpeakerIcon() {
  return <span aria-hidden="true">◖))</span>
}

function App() {
  const [query, setQuery] = useState('satirize')
  const [activeWord, setActiveWord] = useState('satirize')
  const [savedWords, setSavedWords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wordcraft-saved') || '[]')
    } catch {
      return []
    }
  })
  const [notice, setNotice] = useState('')

  const activeEntry = entries.find((entry) => entry.word === activeWord) || entries[0]
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return entries
    return entries.filter((entry) => entry.word.includes(normalized))
  }, [query])

  useEffect(() => {
    try {
      localStorage.setItem('wordcraft-saved', JSON.stringify(savedWords))
    } catch {
      // The site still works if storage is unavailable.
    }
  }, [savedWords])

  function chooseWord(word) {
    setActiveWord(word)
    setQuery(word)
  }

  function speak(text, locale) {
    if (!('speechSynthesis' in window)) {
      setNotice('你的浏览器暂不支持语音朗读。')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = locale
    utterance.rate = 0.82
    window.speechSynthesis.speak(utterance)
    setNotice(locale === 'en-GB' ? '正在播放英式发音' : '正在播放美式发音')
  }

  function toggleSave() {
    setSavedWords((current) =>
      current.includes(activeEntry.word)
        ? current.filter((word) => word !== activeEntry.word)
        : [...current, activeEntry.word],
    )
  }

  const isSaved = savedWords.includes(activeEntry.word)

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" onClick={() => chooseWord('satirize')}>
          <span className="brand-mark">W</span>
          <span>Wordcraft</span>
        </a>
        <nav aria-label="主导航">
          <a className="nav-link active" href="#dictionary">词典</a>
          <a className="nav-link" href="#saved">我的词库 <span className="count">{savedWords.length}</span></a>
        </nav>
      </header>

      <main id="top">
        <section className="search-section" aria-label="查找单词">
          <p className="eyebrow">MAKE WORDS YOURS</p>
          <h1>认识每一个单词，<em>记住它。</em></h1>
          <div className="search-wrap">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && matches[0]) chooseWord(matches[0].word)
              }}
              placeholder="输入英文单词，例如 satirize"
              aria-label="搜索英文单词"
            />
            <button type="button" onClick={() => matches[0] && chooseWord(matches[0].word)}>查询</button>
          </div>
          {query && (
            <div className="suggestions" aria-label="搜索建议">
              {matches.length ? matches.map((entry) => (
                <button key={entry.word} type="button" onClick={() => chooseWord(entry.word)}>
                  <strong>{entry.word}</strong><span>{entry.type}</span>
                </button>
              )) : <p>暂未收录该单词。试试 satirize、eloquent 或 resilient。</p>}
            </div>
          )}
        </section>

        <section className="dictionary-layout" id="dictionary">
          <aside className="word-rail">
            <p className="rail-title">今日浏览</p>
            {entries.map((entry, index) => (
              <button
                className={entry.word === activeEntry.word ? 'word-tab selected' : 'word-tab'}
                key={entry.word}
                type="button"
                onClick={() => chooseWord(entry.word)}
              >
                <span>0{index + 1}</span>{entry.word}
              </button>
            ))}
            <div className="rail-note"><span>✦</span><p>把陌生词加入词库，建立你的学习清单。</p></div>
          </aside>

          <article className="entry-card">
            <div className="entry-topline">
              <span className="level-badge">{activeEntry.level}</span>
              <span>{activeEntry.type}</span>
              <span className="dot">•</span>
              <span>{activeEntry.syllables}</span>
              <button className={isSaved ? 'save-button saved' : 'save-button'} type="button" onClick={toggleSave} aria-pressed={isSaved}>
                {isSaved ? '♥ 已加入词库' : '♡ 加入词库'}
              </button>
            </div>

            <div className="word-heading">
              <h2>{activeEntry.word}</h2>
              <p className="pronunciation">{activeEntry.uk}</p>
            </div>

            <div className="audio-row">
              <button type="button" className="audio-button" onClick={() => speak(activeEntry.word, 'en-GB')}>
                <SpeakerIcon /><span>英式发音</span><b>{activeEntry.uk}</b>
              </button>
              <button type="button" className="audio-button" onClick={() => speak(activeEntry.word, 'en-US')}>
                <SpeakerIcon /><span>美式发音</span><b>{activeEntry.us}</b>
              </button>
            </div>
            {notice && <p className="notice" role="status">{notice}</p>}

            <div className="definition-block">
              <div className="definition-number">01</div>
              <div>
                <p className="part-of-speech">VERB</p>
                <p className="definition">{activeEntry.definition}</p>
                <div className="translation-tags">{activeEntry.translations.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
            </div>

            <section className="details-grid">
              <div className="forms-panel">
                <div className="section-heading"><span>词形变化</span><span className="line" /></div>
                <dl>
                  {activeEntry.forms.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
                </dl>
              </div>
              <div className="related-panel">
                <div className="section-heading"><span>相关词汇</span><span className="line" /></div>
                <div className="related-list">{activeEntry.related.map((item) => <button type="button" key={item} onClick={() => setQuery(item)}>{item} <span>↗</span></button>)}</div>
                <p className="etymology"><b>词源小记</b>{activeEntry.etymology}</p>
              </div>
            </section>

            <section className="examples-section">
              <div className="section-heading"><span>语境中的用法</span><span className="line" /></div>
              {activeEntry.examples.map((example, index) => (
                <figure key={example}>
                  <span className="example-index">0{index + 1}</span>
                  <blockquote>“{example}”</blockquote>
                </figure>
              ))}
            </section>
          </article>
        </section>
      </main>

      <footer><span>Wordcraft · 从好奇开始的词汇学习</span><span>初版词库 · 3 words</span></footer>
    </div>
  )
}

export default App
