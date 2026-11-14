import test from 'node:test'
import assert from 'node:assert/strict'
import { appendUnique, branchPayload, validateBranch, validCivilDate, initialSharing, applySharing, initialAI, aiTransition } from '../site/studies/expansion.mjs'

test('a hidden branch is excluded while its editable draft is retained', () => {
  const draft = { name: 'Maya', delivery: 'collect', address: 'Retained address', date: '1990-06-15', quantity: '2' }
  assert(!Object.hasOwn(branchPayload(draft), 'address'))
  assert.equal(draft.address, 'Retained address')
  assert.equal(branchPayload({ ...draft, delivery: 'post' }).address, 'Retained address')
  assert.deepEqual(validateBranch(draft), {})
  assert(Object.hasOwn(validateBranch({ ...draft, quantity: '21' }), 'quantity'))
  assert.equal(branchPayload({ ...draft, quantity: '21' }).quantity, '21', 'Validation must not clamp the input')
  assert(!validCivilDate('2027-02-29')); assert(validCivilDate('2028-02-29')); assert(!validCivilDate('06/07/2027'))
})
test('retry appends unique identities without changing earlier records', () => {
  const earlier=[{id:1,name:'A'}], next=[{id:2,name:'B'},{id:2,name:'B'}]
  const result=appendUnique(earlier,next)
  assert.deepEqual(result,[{id:1,name:'A'},{id:2,name:'B'}])
  assert.deepEqual(appendUnique(result,next),result)
  assert.deepEqual(earlier,[{id:1,name:'A'}])
})
test('sharing failure retains confirmed audience and successful apply changes it', () => {
  const draft={...initialSharing(),draft:'Anyone with the link'}
  const failed=applySharing(draft)
  assert.equal(failed.confirmed,'Private');assert.equal(failed.draft,'Anyone with the link')
  const applied=applySharing(failed)
  assert.equal(applied.confirmed,'Anyone with the link')
  assert.equal(applySharing({...applied,draft:'Private'}).confirmed,'Private')
})
test('stopped and out-of-order AI results cannot replace accepted work', () => {
  const send=(s,type,rest={})=>aiTransition(s,{type,...rest})
  let s=send(initialAI(),'start');s=send(s,'advance');s=send(s,'stop')
  assert(s.suggestion);assert.equal(s.original,'A useful place to begin.')
  s=send(s,'start');s=send(s,'resolve',{id:2});s=send(s,'accept')
  const accepted=s.original;s=send(s,'resolve',{id:1});assert.equal(s.original,accepted)
  s=send(s,'undo');assert.equal(s.original,'A useful place to begin.')
})
test('edits invalidate pending and ready suggestions; discard preserves original', () => {
  const send=(s,type,rest={})=>aiTransition(s,{type,...rest})
  let s=send(initialAI(),'start');s=send(s,'edit',{text:'New manual text'});s=send(s,'resolve',{id:1});s=send(s,'accept')
  assert.equal(s.original,'New manual text');assert.notEqual(s.phase,'ready')
  s=send(s,'start');s=send(s,'resolve',{id:2});s=send(s,'edit',{text:'Even newer text'});s=send(s,'accept')
  assert.equal(s.original,'Even newer text')
  s=send(s,'discard');assert.equal(s.original,'Even newer text');assert.equal(s.suggestion,'')
})

test('undoing acceptance cannot discard a later manual edit', () => {
 let s=aiTransition(initialAI(),{type:'start'});s=aiTransition(s,{type:'resolve',id:1});s=aiTransition(s,{type:'accept'});s=aiTransition(s,{type:'edit',text:'Keep this manual edit'});s=aiTransition(s,{type:'undo'});assert.equal(s.original,'Keep this manual edit');assert.equal(s.undo,'')
})
