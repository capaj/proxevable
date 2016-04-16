import test from 'ava'
import {observable, observe} from '../index'

test('pick up setting a property', t => {
  t.plan(3)
  const a = observable({})
  observe(a, (change) => {
    if (change.type === 'preupdate') {
      t.deepEqual(change, {type: 'preupdate', name: 'b', oldValue: undefined, value: 1})
    } else if (change.type === 'update') {
      t.deepEqual(change, {type: 'update', name: 'b', oldValue: undefined, value: 1})
      t.pass()
    }
  })
  a.b = 1
})

test('pick up deleting a property', t => {
  t.plan(3)
  const a = observable({b: 1})
  observe(a, (change) => {
    if (change.type === 'preupdate') {
      t.deepEqual(change, {type: 'preupdate', name: 'b', oldValue: 1, value: undefined})
    } else if (change.type === 'update') {
      t.deepEqual(change, {type: 'update', name: 'b', oldValue: 1, value: undefined})
      t.pass()
    }
  })
  delete a.b
})

test('throwing in the observer stops the setter from setting the property', (t) => {
  t.plan(2)
  const a = observable({})
  observe(a, (change) => {
    throw new Error('something  wrong')
  })
  t.throws(() => {
    a.b = 1
  })
  t.truthy(a.b === undefined)
})

test('work with arrays too', t => {
  t.plan(3)
  const a = observable([])
  observe(a, (change) => {
    if (change.type === 'preupdate') {
      t.deepEqual(change, {type: 'preupdate', name: '0', oldValue: undefined, value: 1})
    } else if (change.type === 'update') {
      t.deepEqual(change, {type: 'update', name: '0', oldValue: undefined, value: 1})
      t.pass()
    }
  })
  a[0] = 1
})

test('throw when trying to observe non-observable', (t) => {
  t.throws(() => {
    observe({}, () => {})
  })
})

test('unobserve', (t) => {
  const a = observable({})
  const unobserve = observe(a, (change) => {
    t.fail()
  })
  unobserve()
  a.b = 1
})
