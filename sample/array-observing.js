// this sample showcases observing of an array and modifying on a 100th place. MobX throws when you do this.
const proxevable = require('../index')
const arr = proxevable.observable([])

proxevable.observe(arr, (ev) => {
  console.log('change', ev)
})

arr[100] = 'f'
