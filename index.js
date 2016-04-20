const allUpdateCbs = new WeakMap()
const allPreUpdateCbs = new WeakMap()
const subscriptions = new WeakMap()

const _ = require('lodash')
let autorunFn = null
const transactionStack = []
const autorunsAfterTransaction = new Set()

const transactionallyCall = (cb) => {
  if (transactionStack.length > 0) {
    autorunsAfterTransaction.add(cb)
  } else if (cb.minimumDelay > 0) {
    if (cb.timeoutId) {
      clearTimeout(cb.timeoutId)
    }
    cb.timeoutId = setTimeout(() => {
      cb()
      cb.timeoutId = null
    }, cb.minimumDelay)
  } else {
    cb()
  }
}

const autorun = (fn) => {
  fn.$onDispose = []
  autorunFn = fn
  fn()
  autorunFn = null
  return () => {
    fn.$onDispose.forEach((cb) => cb())
  }
}

const api = {
  observable: (source) => {
    const updateCbs = []
    const preUpdateCbs = []
    const thisSubscriptions = {}
    const o = new Proxy(source, {
      get: function (oTarget, sKey) {
        if (autorunFn) {
          if (!thisSubscriptions[sKey]) {
            thisSubscriptions[sKey] = new Set()
          }
          const set = thisSubscriptions[sKey]
          if (!set.has(autorunFn)) {
            thisSubscriptions[sKey].add(autorunFn)
            const localAutorunFn = autorunFn
            autorunFn.$onDispose.push(() => {
              thisSubscriptions[sKey].delete(localAutorunFn)
              if (thisSubscriptions[sKey].size === 0) {
                delete thisSubscriptions[sKey]
              }
            })
          }
        }

        return oTarget[sKey]
      },
      set: function (oTarget, sKey, vValue) {
        if (oTarget[sKey] !== vValue) {
          const change = {
            type: 'update',
            name: sKey,
            oldValue: oTarget[sKey],
            newValue: vValue
          }
          _.forEach(preUpdateCbs, (callback) => {
            callback(change)
          })
          oTarget[sKey] = vValue

          _.forEach(updateCbs, (callback) => {
            callback(change)
          })
          if (thisSubscriptions[sKey]) {
            thisSubscriptions[sKey].forEach((callback) => {
              autorunFn = callback
              transactionallyCall(callback)
            })
          }
          autorunFn = null
          return true
        }
        return true
      },
      deleteProperty: function (oTarget, sKey) {
        const change = {
          type: 'update',
          name: sKey,
          oldValue: oTarget[sKey],
          newValue: undefined
        }
        _.forEach(preUpdateCbs, (callback) => {
          callback(change)
        })
        const deleted = delete oTarget[sKey]
        _.forEach(updateCbs, (callback) => {
          callback(change)
        })
        if (thisSubscriptions[sKey]) {
          thisSubscriptions[sKey].forEach((callback) => {
            autorunFn = callback
            transactionallyCall(callback)
          })
        }
        return deleted
      },
      enumerate: function (oTarget, sKey) {
        return Object.keys(oTarget)
      }
    })
    allUpdateCbs.set(o, updateCbs)
    allPreUpdateCbs.set(o, preUpdateCbs)
    subscriptions.set(o, thisSubscriptions)
    return o
  },
  observe: (o, cb) => {
    const updateCbs = allUpdateCbs.get(o)
    if (!updateCbs) {
      throw new Error('Object is not an observable')
    }
    updateCbs.push(cb)
    return () => {
      updateCbs.splice(updateCbs.indexOf(cb), 1)
    }
  },
  preObserve: (o, cb) => {
    const preUpdateCbs = allPreUpdateCbs.get(o)
    if (!preUpdateCbs) {
      throw new Error('Object is not an observable')
    }
    preUpdateCbs.push(cb)
    return () => {
      preUpdateCbs.splice(preUpdateCbs.indexOf(cb), 1)
    }
  },
  autorun: autorun,
  autorunAsync: (fn, delay) => {
    fn.minimumDelay = delay
    return autorun(fn)
  },
  transaction: (fn) => {
    transactionStack.push(fn)
    fn()
    if (fn === transactionStack[0]) {
      autorunsAfterTransaction.forEach((cb) => {
        cb()
      })
      transactionStack.length = 0
    }
  }
}

module.exports = api
