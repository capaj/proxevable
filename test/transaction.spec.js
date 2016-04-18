import test from 'ava'
import {observable, autorun, transaction} from '../index'

test('transaction batches', t => {
  let c = 0
  const a = observable({g: 0})
  autorun(() => {
    const ident = (v) => v
    ident(a.g)
    c += 1
  })
  transaction(() => {
    a.g = 1
    transaction(() => {
      a.g = 2
      a.g = 3
    })
  })
  t.truthy(c === 2)
})
