import test from 'ava'
import {observable, autorun, autorunAsync} from '../index'

test('autorun on any change in the observable and dispose properly', (t) => {
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

test('run even when deleting a prop', (t) => {
  let c = 0
  const a = observable({g: 1})
  autorun(() => {
    const ident = (v) => v
    ident(a.g)
    c += 1
  })

  delete a.g
  t.true(c === 2)
})

test.cb('autorunAsync', (t) => {
  let c = 0
  const a = observable({})
  const disposer = autorunAsync(() => {
    const ident = (v) => v
    ident(a.g)
    c += 1
  }, 100)
  a.g = 1
  setTimeout(() => {
    a.g = 1
    a.g = 2
    a.g = 3
    t.true(c === 1)
    setTimeout(() => {
      t.true(c === 2)
      disposer()
      a.g = 4
      a.g = 5
      setTimeout(() => {
        t.true(c === 2) // not increased, because it was disposed
        t.end()
      }, 110)
    }, 150)
  }, 10)
})
