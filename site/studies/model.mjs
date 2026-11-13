/** Deterministic local teaching data and operations; no persistence or network writes. */
export function compositeGray(foreground, background, alpha) {
  return Math.round(foreground * alpha + background * (1 - alpha))
}
export function contrastGray(a, b) {
  const linear = value => { const s = value / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4 }
  const x = linear(a), y = linear(b)
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05)
}
export function circularInset(outer, inset, ring = 0) {
  return { radius: Math.max(0, outer - inset), layoutGap: inset, paintedGap: inset - ring, paintedRadius: Math.max(0, outer - inset) + ring }
}
export const articles = [
  { id: 'reading', title: 'A readable place to begin', category: 'Content', summary: 'Use hierarchy and a coherent reading measure to introduce a useful service.', body: 'Begin with the question the reader brought. Explain the offer, give relevant evidence and name the next action. A large image should support this sequence rather than displace it.', detail: 'Keep an introduction, meaningful headings and a route back to the collection. Optional navigation can move into a disclosure when space narrows.' },
  { id: 'spacing', title: 'Space that explains grouping', category: 'Craft', summary: 'Connect a field to its label and help before adding another boundary.', body: 'Hold the content and typography constant. A smaller within-field gap and a larger between-field gap identify which information belongs together.', detail: 'Long labels and validation messages must stay inside their field group. Let content grow rather than positioning it over the next control.' },
  { id: 'recovery', title: 'Keep a draft through failure', category: 'Flows', summary: 'Distinguish a retained draft, a pending request and a confirmed result.', body: 'A failed request should preserve the work needed to retry. The visible draft and the last confirmed version are different states.', detail: 'An older acknowledgement cannot mark a newer draft saved. Explain an uncertain result before inviting a repeated consequential operation.' },
  { id: 'locale', title: 'Mixed scripts, one useful task', category: 'Content', summary: 'Typography, direction and input must adapt without losing context.', body: 'Use actual language samples and let labels grow. A fallback font can change line height and the apparent weight of adjacent text.', detail: 'Do not submit an unfinished IME composition. Isolate mixed-direction identifiers and format dates and numbers for interpretation.' },
]
export function searchArticles(query = '', category = 'All') {
  const needle = query.trim().toLocaleLowerCase('en')
  return articles.filter(article => (category === 'All' || article.category === category) && `${article.title} ${article.summary}`.toLocaleLowerCase('en').includes(needle))
}
export function readingURL(query, category, article = '') {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (category !== 'All') params.set('category', category)
  if (article) params.set('article', article)
  return '/studies/reading' + (params.size ? `?${params}` : '')
}
export function validateService(name, email) {
  return { name: name.trim() ? '' : 'Enter your name.', email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? '' : 'Enter a complete email address.' }
}
export const initialRecords = () => [
  { id: 'a', name: 'Field notes', owner: 'Maya Chen', status: 'Active' },
  { id: 'b', name: 'Research archive', owner: 'Eli Rivera', status: 'Active' },
  { id: 'c', name: '地域の調査 · Regional study', owner: 'Jo Lee', status: 'Active' },
  { id: 'd', name: 'Publication with a deliberately longer working title', owner: 'Noor Ali', status: 'Active' },
]
export function archiveRecords(records, ids, failure = '') {
  const selected = new Set(ids)
  const completed = records.filter(record => selected.has(record.id) && record.status !== 'Archived' && record.id !== failure).map(record => record.id)
  const failed = records.filter(record => selected.has(record.id) && record.id === failure && record.status !== 'Archived').map(record => record.id)
  return { records: records.map(record => completed.includes(record.id) ? { ...record, status: 'Archived' } : { ...record }), completed, failed }
}
/** @returns {{version:number,pending:Array<{id:number,name:string}>,current:number,result:string,status:string,progress:number}} */
export function initialRequestState() { return { version: 0, pending: [], current: 0, result: '', status: 'Ready', progress: 0 } }
export function requestTransition(state, event) {
  if (event.type === 'start') {
    const id = state.version + 1
    return { ...state, version: id, current: id, progress: 0, pending: [...state.pending, { id, name: event.name }], status: `Request ${id} pending: ${event.name}` }
  }
  if (event.type === 'advance') return state.current ? { ...state, progress: Math.min(4, state.progress + 1), status: 'Measured work advanced; completion still needs acknowledgement.' } : state
  if (event.type === 'cancel') return { ...state, current: 0, status: 'Cancelled. A late callback cannot replace the result.' }
  if (event.type === 'resolve' || event.type === 'fail') {
    const item = state.pending.find(item => item.id === event.id)
    if (!item) return state
    const remaining = state.pending.filter(candidate => candidate.id !== event.id)
    if (event.id !== state.current) return { ...state, pending: remaining, status: `Ignored stale response ${event.id}.` }
    return { ...state, pending: remaining, current: 0, result: event.type === 'resolve' ? item.name : state.result, status: event.type === 'resolve' ? `Confirmed: ${item.name}` : `Failed: ${item.name}. Input is retained for retry.` }
  }
  return state
}
