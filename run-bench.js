'use strict'
const Benchmark = require('benchmark')
const mobx = require('mobx')
const proxevable = require('./index')
const suite = new Benchmark.Suite()
const suite2 = new Benchmark.Suite()
const fs = require('fs')
let benchLog = ''
const log = (text) => {
  console.log(text)
  benchLog += text + '\n\n'
}

function arraySuite () {
  suite2.add('mobx array autorun', () => {
    const a = mobx.observable([])
    const disposer = mobx.autorun(() => {
      const ident = (v) => v
      if (a.length > 0) {
        ident(a[0])
      }
      if (a.length > 1) {
        ident(a[1])
      }
      if (a.length > 2) {
        ident(a[2])
      }
    })
    a.push(1)
    a.push(2)
    a.push(3)
    a.push(4)
    a.push(5)
    a.push(6)
    a.pop()
    a.pop()
    a.pop()
    a.length = 0
    disposer()
  })
  .add('proxevable array autorun', () => {
    const a = proxevable.observable([])
    const disposer = proxevable.autorun(() => {
      const ident = (v) => v
      if (a.length) {
        if (a.length > 0) {
          ident(a[0])
        }
        if (a.length > 1) {
          ident(a[1])
        }
        if (a.length > 2) {
          ident(a[2])
        }
      }
    })
    a.push(1)
    a.push(2)
    a.push(3)
    a.push(4)
    a.push(5)
    a.push(6)
    a.pop()
    a.pop()
    a.pop()
    a.length = 0
    disposer()
  })
  // add listeners
  .on('cycle', function (event) {
    log(String(event.target))
  })
  .on('complete', function () {
    log('Fastest is ' + this.filter('fastest').map('name'))
    fs.writeFile('benchmark-results.md', benchLog, function (err) {
      if (err) return console.error(err)
    })
  })
  // run async
  .run({ 'async': true })
}

// add tests
suite.add('mobX create observable, autorun and dispose', function () {
  let c = 0 // eslint-disable-line 
  const a = mobx.observable({g: 0})
  const disposer = mobx.autorun(() => {
    const ident = (v) => v
    ident(a.g)
    c += 1
  })
  a.g = 1
  a.g = 1
  a.g = 2
  a.g = 3
  disposer()
  a.g = 4
})
  .add('proxevable create observable, autorun and dispose', function () {
    let c = 0 // eslint-disable-line 
    const a = proxevable.observable({})
    const disposer = proxevable.autorun(() => {
      const ident = (v) => v
      ident(a.g)
      c += 1
    })
    a.g = 1
    a.g = 1
    a.g = 2
    a.g = 3
    disposer()
    a.g = 4
  })
  // add listeners
  .on('cycle', function (event) {
    log(String(event.target))
  })
  .on('complete', arraySuite)
  // run async
  .run({ 'async': true })
