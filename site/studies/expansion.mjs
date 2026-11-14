/** Local deterministic models. No network, persistence or real authorization. */
export const collectionRecords = () => Array.from({ length: 24 }, (_, i) => ({ id: i + 1, name: `Research note ${String(i + 1).padStart(2, '0')}` }))
export function appendUnique(current, incoming) {
  const ids = new Set(current.map(item => item.id))
  return [...current, ...incoming.filter(item => { if (ids.has(item.id)) return false; ids.add(item.id); return true })]
}
export function branchPayload(draft) {
  return draft.delivery === 'post' ? { name: draft.name, delivery: draft.delivery, address: draft.address, date: draft.date, quantity: draft.quantity } : { name: draft.name, delivery: draft.delivery, date: draft.date, quantity: draft.quantity }
}
export function validCivilDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T12:00:00Z')
  return !Number.isNaN(+date) && date.toISOString().slice(0, 10) === value
}
export function validateBranch(draft) {
  /** @type {Record<string,string>} */
  const errors = {}
  if (!draft.name.trim()) errors.name = 'Enter a name.'
  if (!validCivilDate(draft.date)) errors.date = 'Enter a real date as YYYY-MM-DD.'
  if (!/^\d+$/.test(draft.quantity) || Number(draft.quantity) < 1 || Number(draft.quantity) > 20) errors.quantity = 'Enter a whole quantity from 1 to 20; your input is kept.'
  if (draft.delivery === 'post' && !draft.address.trim()) errors.address = 'Enter the postal address, or choose collection.'
  return errors
}
export function initialSharing() { return { draft: 'Private', confirmed: 'Private', fail: true, message: '' } }
export function applySharing(state) {
  return state.fail ? { ...state, fail: false, message: 'Simulated failure. Confirmed access is unchanged.' } : { ...state, confirmed: state.draft, message: `Applied: ${state.draft}. Local simulation only.` }
}
/** @returns {{original:string,suggestion:string,version:number,next:number,active:number,pending:Array<{id:number,version:number}>,phase:string,undo:string,message:string}} */
export function initialAI() {
  return { original: 'A useful place to begin.', suggestion: '', version: 0, next: 0, active: 0, pending: [], phase: 'idle', undo: '', message: '' }
}
export function aiTransition(state, action) {
  const s = { ...state, pending: [...state.pending] }
  if (action.type === 'edit') { s.original = action.text; s.version++; s.undo = ''; s.message = 'Original changed; earlier suggestions cannot be applied.' }
  if (action.type === 'start') { s.active = ++s.next; s.pending.push({ id: s.active, version: s.version }); s.suggestion = ''; s.phase = 'generating'; s.message = 'Generating a simulated suggestion.' }
  if (action.type === 'advance' && s.active) { s.suggestion = 'Begin with the reader'; s.phase = 'partial'; s.message = 'Partial suggestion available.' }
  if (action.type === 'stop') { s.active = 0; s.phase = 'stopped'; s.message = 'Stopped. Partial suggestion retained; original unchanged.' }
  if (action.type === 'resolve') {
    const request = s.pending.find(item => item.id === action.id)
    s.pending = s.pending.filter(item => item.id !== action.id)
    if (!request || request.id !== s.active || request.version !== s.version) { s.message = 'Ignored stale result; current work retained.'; if (request?.id === s.active) { s.active = 0; s.phase = 'stale' } }
    else { s.active = 0; s.suggestion = 'Begin with the reader’s question and a clear next action.'; s.phase = 'ready'; s.message = 'Suggestion ready for review; not applied.' }
  }
  if (action.type === 'accept' && s.phase === 'ready') { s.undo = s.original; s.original = s.suggestion; s.version++; s.suggestion = ''; s.phase = 'accepted'; s.message = 'Applied locally. Nothing saved or published.' }
  if (action.type === 'discard') { s.active = 0; s.suggestion = ''; s.phase = 'idle'; s.message = 'Suggestion discarded; original retained.' }
  if (action.type === 'undo' && s.undo) { s.original = s.undo; s.undo = ''; s.version++; s.phase = 'idle'; s.message = 'Original restored.' }
  // Editing after a completed suggestion invalidates that suggestion as well.
  if (action.type === 'edit' && s.phase === 'ready') s.phase = 'stale'
  return s
}
