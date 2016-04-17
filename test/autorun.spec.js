import test from 'ava'
import {observable, autorun} from '../index'

test('autorun on any change in the observable and dispose properly', t => {
  let c = 0
  const a = observable({})
  const disposer = autorun(() => {
    const ident = (v) => v
    ident(a.g)
    c += 1
  })
  a.g = 1
  a.g = 1
  a.g = 2
  a.g = 3
  t.true(c === 4)

  disposer()
  a.g = 4
  a.g = 5
  t.true(c === 4)
})
