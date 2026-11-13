import test from 'node:test'
import assert from 'node:assert/strict'
import { compositeGray, contrastGray, circularInset, searchArticles, readingURL, validateService, initialRecords, archiveRecords, initialRequestState, requestTransition } from '../site/studies/model.mjs'

test('composited contrast and circular paint calculations retain their meaning', () => {
  assert.equal(contrastGray(0, 255), 21)
  assert.equal(contrastGray(128, 128), 1)
  assert.equal(compositeGray(0, 250, 0), 250)
  assert.equal(compositeGray(0, 250, 1), 0)
  assert.deepEqual(circularInset(24, 8, .5), { radius: 16, layoutGap: 8, paintedGap: 7.5, paintedRadius: 16.5 })
  assert.equal(circularInset(8, 12).radius, 0)
})
test('criteria and direct article URLs round-trip safely', () => {
  assert.equal(searchArticles('  SPACE ', 'Craft')[0].id, 'spacing')
  assert.equal(searchArticles('space', 'Flows').length, 0)
  const url = new URL(readingURL('文字 & space', 'Craft', 'spacing'), 'https://example.test')
  assert.equal(url.searchParams.get('q'), '文字 & space')
  assert.equal(url.searchParams.get('article'), 'spacing')
  assert.equal(validateService('  ', 'maya@').name, 'Enter your name.')
  assert.equal(validateService('Maya', 'maya@example.test').email, '')
})
test('partial archive, scoped retry and stable identities avoid duplicate work', () => {
  const original = initialRecords()
  const first = archiveRecords(original, ['a', 'b', 'c'], 'b')
  assert.deepEqual(first.completed, ['a', 'c'])
  assert.deepEqual(first.failed, ['b'])
  assert(original.every(record => record.status === 'Active'))
  const retry = archiveRecords(first.records, first.failed)
  assert.deepEqual(retry.completed, ['b'])
  assert.deepEqual(archiveRecords(retry.records, ['a', 'b', 'c']).completed, [])
  assert.equal(retry.records.find(record => record.id === 'd').status, 'Active')
})
test('late responses and cancellation cannot replace a newer confirmed result', () => {
  let state = requestTransition(initialRequestState(), { type: 'start', name: 'A' })
  state = requestTransition(state, { type: 'start', name: 'B' })
  state = requestTransition(state, { type: 'resolve', id: 2 })
  state = requestTransition(state, { type: 'resolve', id: 1 })
  assert.equal(state.result, 'B')
  assert.match(state.status, /Ignored stale/)
  state = requestTransition(state, { type: 'start', name: 'C' })
  state = requestTransition(state, { type: 'cancel' })
  state = requestTransition(state, { type: 'resolve', id: 3 })
  assert.equal(state.result, 'B')
})
