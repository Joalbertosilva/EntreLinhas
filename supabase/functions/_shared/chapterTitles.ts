import { isPdfTableOfContentsLine } from './pdfToc'

const SKIP_TITLES =
  /^(?:contents?|table of contents|the full project gutenberg license|project gutenberg|gutenberg license|biblio|index|footnotes?)$/i

/** Título de seção que deve virar uma página no leitor (Gutenberg, PDF exportado, etc.). */
export function isChapterLikeTitle(raw: string): boolean {
  const t = raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^#+\s*/, '')
  if (isPdfTableOfContentsLine(t)) return false
  if (t.length < 2 || t.length > 180) return false
  if (SKIP_TITLES.test(t)) return false
  if (/^project gutenberg australia/i.test(t)) return false
  if (/^by\s+/i.test(t) && t.length < 80) return false

  return (
    /^(?:PREMIER\s+)?(?:CHAPITRE|CHAPTER)\b/i.test(t) ||
    /^CHAP(?:TER|ITRE)?\.?\s+/i.test(t) ||
    /^Capítulo\b|^CAPÍTULO\b/i.test(t) ||
    /^(?:BOOK|PART|PARTE|LIVRO|STAVE|CANTO|SECTION|SEÇÃO|LETTER|BOOK)\b/i.test(t) ||
    /^(?:THE\s+)?(?:PREFACE|PREFACE|PROLOGUE|INTRODUCTION|DEDICATION|DEDICACE|EPILOGUE|CONCLUSION|FOREWORD)\b/i.test(t) ||
    /^(?:SKETCH|STORY|TALE)\s+(?:I{1,3}|[IVXLCDM]+|\d+)\b/i.test(t) ||
    /^(?:CHAPTER|CHAPITRE|Capítulo)\s+(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\b/i.test(t) ||
    /^(?:[IVXLCDM]{1,8}|\d{1,3})\s*[.:\-—–]\s+\S/.test(t)
  )
}