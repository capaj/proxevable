'use strict'
var Benchmark = require('benchmark')
const mobx = require('mobx')
const proxevable = require('./index')
const suite = new Benchmark.Suite()
const fs = require('fs')
let benchLog = ''
const log = (text) => {
  console.log(text)
  benchLog += text + '\n'
}

// add tests
suite.add('mobX create observable, autorun and dispose', function () {
  let c = 0
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
    let c = 0
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
  .on('complete', function () {
    log('Fastest is ' + this.filter('fastest').map('name'))
    fs.writeFile('benchmark-results.md', benchLog, function (err) {
      if (err) return console.error(err)
    })
  })
  // run async
  .run({ 'async': true })
