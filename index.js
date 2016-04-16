const objs = new WeakMap()
const _ = require('lodash')

const api = {
  observable: (source) => {
    const cbs = []
    const o = new Proxy(source, {
      get: function (oTarget, sKey) {
        // _.forEach(cbs, (callback) => {
        //   callback({
        //
        //   })
        // })
        return oTarget[sKey]
      },
      set: function (oTarget, sKey, vValue) {
        const change = {
          type: 'preupdate',
          name: sKey,
          oldValue: oTarget[sKey],
          value: vValue
        }
        _.forEach(cbs, (callback) => {
          callback(change)
        })

        oTarget[sKey] = vValue
        change.type = 'update'
        _.forEach(cbs, (callback) => {
          callback(change)
        })
        return vValue
      },
      deleteProperty: function (oTarget, sKey) {
        const change = {
          type: 'preupdate',
          name: sKey,
          oldValue: oTarget[sKey],
          value: undefined
        }
        _.forEach(cbs, (callback) => {
          callback(change)
        })
        const deleted = delete oTarget[sKey]
        change.type = 'update'
        _.forEach(cbs, (callback) => {
          callback(change)
        })
        return deleted
      },
      enumerate: function (oTarget, sKey) {
        return Object.keys(oTarget)
      }
    })
    objs.set(o, cbs)
    return o
  },
  observe: (o, cb) => {
    const cbs = objs.get(o)
    if (!cbs) {
      throw new Error('Object is not an observable')
    }
    cbs.push(cb)
    return () => {
      cbs.splice(cbs.indexOf(cb), 1)
    }
  }
}

module.exports = api
