import { createImportedEntry } from '../data/entries'

function parseCsvLine(line) {
  const cells = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      cells.push(cell.trim())
      cell = ''
    } else {
      cell += character
    }
  }

  cells.push(cell.trim())
  return cells
}

function normalizeWord(value) {
  return value.trim().toLowerCase().replace(/^[^a-z]+|[^a-z'-]+$/gi, '')
}

export const csvImporter = {
  id: 'csv',
  label: 'CSV 词表',
  accept: '.csv,text/csv',
  canImport: (file) => file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv',
  async parse(file) {
    const content = (await file.text()).replace(/^﻿/, '')
    const lines = content.split(/\r?\n/).filter((line) => line.trim())
    const entries = []
    const seenWords = new Set()
    let skipped = 0

    lines.forEach((line, index) => {
      const [rawWord = '', tag = ''] = parseCsvLine(line)
      const word = normalizeWord(rawWord)
      const isHeader = index === 0 && ['word', 'words', '单词'].includes(word)

      if (isHeader) return
      if (!word || !/^[a-z][a-z'-]*$/i.test(word) || seenWords.has(word)) {
        skipped += 1
        return
      }

      seenWords.add(word)
      entries.push(createImportedEntry(word, tag))
    })

    return { entries, skipped }
  },
}

export const importers = [csvImporter]

export function findImporter(file) {
  return importers.find((importer) => importer.canImport(file))
}
