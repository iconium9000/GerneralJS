// import FU

log = console.log
log('init pt.js')

PT = {
  sum: (a,b) => {
    var p = []
    for (var i = 0; i < a.length || i < b.length; ++i) {
      p[i] = (p[i] || 0) + (a[i] || 0) + (b[i] || 0)
    }
    return p
  },
  copy: p => {
    return []
  },
  apply: (a, b) => {
    a.splice(0,a.length)
  }
}
