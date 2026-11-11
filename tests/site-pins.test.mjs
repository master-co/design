import test from 'node:test'
import assert from 'node:assert/strict'
import { verifySitePins } from '../scripts/check-site-pins.mjs'
const pins = { '@master/internal-site': '0.2.7', '@master/ui': '0.0.2', '@master/css': '2.1.3' }
test('accepts installed exact first-party pins', () => assert.deepEqual(verifySitePins(pins, pins), pins))
test('rejects ranges, sibling paths and unpublished candidate drift', () => {
  for (const value of ['^0.2.7', 'latest', 'workspace:*', 'file:../master', '/tmp/candidate.tgz']) {
    assert.throws(() => verifySitePins({ ...pins, '@master/internal-site': value }, pins), /exact registry version/)
  }
  assert.throws(() => verifySitePins(pins, { ...pins, '@master/ui': '0.0.3' }), /differs from the reviewed pin/)
  assert.throws(() => verifySitePins(pins, {}), /differs from the reviewed pin/)
})
