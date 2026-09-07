import { useMemo, useRef, useState } from 'react'
import { findLocalEntry, starterEntries } from './data/entries'
import { fetchDictionaryEntry } from './lib/dictionaryApi'
import { findImporter } from './lib/importers'
import './App.css'

function SpeakerIcon() {
  return <span aria-hidden="true">◖))</span>
}

function App() {
  const [query, setQuery] = useState('satirize')
  const [activeEntry, setActiveEntry] = useState(starterEntries[0])
  const [importedEntries, setImportedEntries] = useState([])
  const [savedWords, setSavedWords] = useState([])
  const [notice, setNotice] = useState('')
  const [searchState, setSearchState] = useState('idle')
  const [searchError, setSearchError] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const fileInput = useRef(null)

  const availableEntries = useMemo(() => [...starterEntries, ...importedEntries], [importedEntries])
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return availableEntries.slice(0, 8)
    return availableEntries.filter((entry) => entry.word.includes(normalized)).slice(0, 8)
  }, [query, availableEntries])

  async function searchWord(requestedWord = query) {
    const word = requestedWord.trim().toLowerCase()
    if (!word) return

    setQuery(word)
    setSearchError('')
    const localEntry = findLocalEntry(word, importedEntries)
    if (localEntry && !localEntry.imported) {
      setActiveEntry(localEntry)
      setSearchState('idle')
      return
    }

    setSearchState('loading')
    try {
      const apiEntry = await fetchDictionaryEntry(word)
      const importedMatch = importedEntries.find((entry) => entry.word === word)
      setActiveEntry(importedMatch ? { ...apiEntry, source: importedMatch.source } : apiEntry)
      setSearchState('idle')
    } catch (error) {
      if (localEntry) {
        setActiveEntry(localEntry)
        setSearchError('这个单词已在导入词表中，但在线词典暂未提供详情。')
      } else {
        setSearchError(error.message === 'NOT_FOUND' ? '未找到该单词，请检查拼写后重试。' : '暂时无法连接在线词典，请稍后再试。')
      }
      setSearchState('error')
    }
  }

  function chooseWord(word) {
    searchWord(word)
  }

  function speak(locale, audioUrl = '') {
    if (audioUrl) {
      new Audio(audioUrl).play().catch(() => setNotice('音频暂时无法播放，已改用浏览器发音。'))
    }
    if (!audioUrl || !('Audio' in window)) {
      if (!('speechSynthesis' in window)) {
        setNotice('你的浏览器暂不支持语音朗读。')
        return
      }
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(activeEntry.word)
      utterance.lang = locale
      utterance.rate = 0.82
      window.speechSynthesis.speak(utterance)
    }
    setNotice(locale === 'en-GB' ? '正在播放英式发音' : '正在播放美式发音')
  }

  function toggleSave() {
    setSavedWords((current) => current.includes(activeEntry.word)
      ? current.filter((word) => word !== activeEntry.word)
      : [...current, activeEntry.word])
  }

  async function importFile(event) {
    const [file] = event.target.files
    if (!file) return

    const importer = findImporter(file)
    if (!importer) {
      setImportMessage('目前仅支持 UTF-8 编码的 .csv 文件。')
      return
    }

    try {
      const { entries, skipped } = await importer.parse(file)
      const existingWords = new Set(importedEntries.map((entry) => entry.word))
      const newEntries = entries.filter((entry) => !existingWords.has(entry.word))
      setImportedEntries((current) => [...current, ...newEntries])
      setImportMessage(`已导入 ${newEntries.length} 个单词${skipped ? `，跳过 ${skipped} 行无效或重复内容` : ''}。刷新页面后会清空。`)
    } catch {
      setImportMessage('无法读取该文件，请确认它是 UTF-8 编码的 CSV。')
    } finally {
      event.target.value = ''
    }
  }

  const isSaved = savedWords.includes(activeEntry.word)
  const hasDetail = Boolean(activeEntry.definition)

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" onClick={() => chooseWord('satirize')}><span className="brand-mark">W</span><span>Wordcraft</span></a>
        <nav aria-label="主导航">
          <a className="nav-link active" href="#dictionary">词典</a>
          <button className="nav-link import-trigger" type="button" onClick={() => setImportOpen((open) => !open)}>导入词库</button>
          <a className="nav-link" href="#saved">我的词库 <span className="count">{savedWords.length}</span></a>
        </nav>
      </header>

      <main id="top">
        <section className="search-section" aria-label="查找单词">
          <p className="eyebrow">MAKE WORDS YOURS</p>
          <h1>认识每一个单词，<em>记住它。</em></h1>
          <div className="search-wrap">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && searchWord()} placeholder="输入任意英文单词，例如 satirize" aria-label="搜索英文单词" />
            <button type="button" onClick={() => searchWord()} disabled={searchState === 'loading'}>{searchState === 'loading' ? '查询中…' : '查询'}</button>
          </div>
          {query && <div className="suggestions" aria-label="搜索建议">{matches.map((entry) => <button key={entry.word} type="button" onClick={() => chooseWord(entry.word)}><strong>{entry.word}</strong><span>{entry.level}</span></button>)}</div>}
          {searchError && <p className="search-error" role="alert">{searchError}</p>}
        </section>

        {importOpen && <section className="import-panel" aria-label="导入词库">
          <div><p className="eyebrow">VOCABULARY IMPORT</p><h3>导入你的词表</h3><p>上传 CSV：第一列为单词，第二列可选标签，例如 <code>abandon,CET-4</code>。导入内容仅在本次页面浏览中保留。</p></div>
          <div className="import-actions"><input ref={fileInput} type="file" accept=".csv,text/csv" onChange={importFile} hidden /><button type="button" onClick={() => fileInput.current?.click()}>选择 CSV 文件</button>{importMessage && <p role="status">{importMessage}</p>}</div>
        </section>}

        <section className="dictionary-layout" id="dictionary">
          <aside className="word-rail">
            <p className="rail-title">本次词库 · {availableEntries.length}</p>
            {availableEntries.slice(0, 12).map((entry, index) => <button className={entry.word === activeEntry.word ? 'word-tab selected' : 'word-tab'} key={entry.word} type="button" onClick={() => chooseWord(entry.word)}><span>{String(index + 1).padStart(2, '0')}</span>{entry.word}</button>)}
            <div className="rail-note"><span>✦</span><p>你可搜索任意单词，或导入 CET-4、CET-6 等 CSV 词表。</p></div>
          </aside>

          <article className="entry-card">
            <div className="entry-topline"><span className="level-badge">{activeEntry.level}</span><span>{activeEntry.type}</span><span className="dot">•</span><span>{activeEntry.source}</span><button className={isSaved ? 'save-button saved' : 'save-button'} type="button" onClick={toggleSave}>{isSaved ? '♥ 已加入词库' : '♡ 加入词库'}</button></div>
            <div className="word-heading"><h2>{activeEntry.word}</h2><p className="pronunciation">{activeEntry.uk !== '—' ? activeEntry.uk : activeEntry.us}</p></div>
            <div className="audio-row"><button type="button" className="audio-button" onClick={() => speak('en-GB', activeEntry.ukAudio)}><SpeakerIcon /><span>英式发音</span><b>{activeEntry.uk}</b></button><button type="button" className="audio-button" onClick={() => speak('en-US', activeEntry.usAudio)}><SpeakerIcon /><span>美式发音</span><b>{activeEntry.us}</b></button></div>
            {notice && <p className="notice" role="status">{notice}</p>}

            {hasDetail ? <>
              <div className="definition-block"><div className="definition-number">01</div><div><p className="part-of-speech">{activeEntry.type.toUpperCase()}</p><p className="definition">{activeEntry.definition}</p>{activeEntry.translations.length > 0 && <div className="translation-tags">{activeEntry.translations.map((item) => <span key={item}>{item}</span>)}</div>}</div></div>
              <section className="details-grid">
                {activeEntry.forms.length > 0 && <div className="forms-panel"><div className="section-heading"><span>词形变化</span><span className="line" /></div><dl>{activeEntry.forms.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>}
                <div className="related-panel"><div className="section-heading"><span>相关词汇</span><span className="line" /></div>{activeEntry.related.length > 0 ? <div className="related-list">{activeEntry.related.map((item) => <button type="button" key={item} onClick={() => { setQuery(item); searchWord(item) }}>{item} <span>↗</span></button>)}</div> : <p className="empty-copy">在线词典未提供相关词。</p>}{activeEntry.etymology && <p className="etymology"><b>词源小记</b>{activeEntry.etymology}</p>}</div>
              </section>
              {activeEntry.examples.length > 0 && <section className="examples-section"><div className="section-heading"><span>语境中的用法</span><span className="line" /></div>{activeEntry.examples.map((example, index) => <figure key={example}><span className="example-index">{String(index + 1).padStart(2, '0')}</span><blockquote>“{example}”</blockquote></figure>)}</section>}
            </> : <div className="empty-entry"><span>⌁</span><h3>词表已收录</h3><p>“{activeEntry.word}” 来自 {activeEntry.source}。在线词典暂未返回详细释义，你可以检查拼写后再次搜索。</p></div>}
          </article>
        </section>
      </main>
      <footer><span>Wordcraft · 从好奇开始的词汇学习</span><span>在线词典 + 临时导入词库</span></footer>
    </div>
  )
}

export default App
