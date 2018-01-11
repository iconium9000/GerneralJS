log = console.log
log('init io.js')

function keys() {
  keys.isDn = keys.isDn || {}
  keys.hsDn = {}
  keys.hsUp = {}
}

function events() {
  var e = events
  e.nw = (new Date()).getTime()
  e.dt = e.nw - e.lst
  e.lst = e.nw
  e.tk = e.tk ? e.tk + 1 : 1
}

function display() {
  var d = display
  d.cnvs = d.cnvs || document.getElementById('canvas')
  d.g = d.g || d.cnvs.getContext('2d')
  d.w = d.cnvs.width = window.innerWidth - 20
  d.h = d.cnvs.height = window.innerHeight - 22
}

function mouse() {
  var m = mouse
  if (m.x == undefined) {
    PT.apply(m, [])
  }

  m.hsDn = m.hsDrgd = m.hsUp = false
  m.prv = PT.copy(m)
  m.prv.isDn = m.isDn
}

var setMouse = e => {
  mouse[0] = e.clientX - 7
  mouse[1] = e.clientY - 7
}

keys()
events()
display()
mouse()

$(document).mousemove(e => {
  setMouse(e)
  mouse.hsDrgd = mouse.isDn
  mouse.shftDn = e.shiftKey
})
$(document).mousedown(e => {
  setMouse(e)
  mouse.hsDrgd = false
  mouse.isDn = true
  mouse.hsDn = true
  mouse.shftDn = e.shiftKey
})
$(document).mouseup(e => {
  setMouse(e)
  mouse.isDn = false
  mouse.hsUp = true
  mouse.shftDn = e.shiftKey
})

$(document).keypress(e => {
  var c = fu.etochar(e)
  keys.isDn[c] = true
  keys.hsDn[c] = true
  mouse.shftDn = e.shiftKey
})
$(document).keyup(e => {
  var c = fu.etochar(e)
  keys.isDn[c] = false
  keys.hsUp[c] = true
  mouse.shftDn = e.shiftKey
})
document.onkeydown = e => {
  keys.hsDn[e.key] = true
  mouse.shftDn = e.shiftKey
}
