log = console.log
log('init fu.js')

fu = FU = new Object
FU.reqFrame = () => window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  ((callback) => window.setTimeout(callback, 30))

FU.setCookie = (cname, cvalue, exdays) => {
  var d = new Date()
  d.setTime(d.getTime() + (exdays*24*60*60*1000))
  document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`
}

FU.etochar = e => String.fromCharCode(e.which | 0x20)
FU.first = o => {
  for (var i in o) return o[i]
}
FU.isEmpty = o => {
  for (var i in o) return false
  return true
}
FU.count = o => {
  var c = 0
  for (var i in o) ++c
  return c
}
FU.forlen = (l,f) => {
  for (var i = 0; i < l; ++i) {
    f(i,l)
  }
}
FU.forEach = (l,f) => {
  for (var i in l) f(l[i],i,l)
}
FU.rand_char = () => {

}
FU.cat = (a,b) => {
  var c = {}
  for (var i in a) c[i] = a[i]
  for (var i in b) c[i] = b[i]
  return c
}
FU.cmb = (a,b) => {
  for (var i in b) c[i] = b[i]
  return a
}
