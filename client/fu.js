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
