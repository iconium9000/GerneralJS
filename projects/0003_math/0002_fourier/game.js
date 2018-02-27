log = console.log

PROJECT_NAME = 'Fourier Test'
log('init game.js', PROJECT_NAME)

E = Math.E
π = Math.PI
π2 = 2 * π

sum = (a,b) => [a[0] + b[0], a[1] + b[1]]
sums = (a,s) => [a[0] + s, a[1]]
sub = (a,b) => [a[0] - b[0], a[1] - b[1]]
subs = (a,s) => [a[0] + s, a[1]]
mul = (a,b) => [a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]]
muls = (a,s) => [a[0] * s, a[1] * s]
len = a => Math.sqrt(a[0] * a[0] + a[1] * a[1])
tan = a => Math.acot(a[0]/a[1]) + (a[1] >= 0 ? 0 : π)
exp = a => [Math.exp(a[0]) * Math.cos(a[1]), Math.exp(a[0]) * Math.sin(a[1])]


var DATA = []
f = x => Math.cos(x) + Math.cos(10 * x)

IS = 0
IL = 3
IR = 1e3

JS = 0
JL = 10
JR = 1e3

MAX = 0

for (var i = 0; i < IR; ++i) {
  var ik = IS + i * IL / IR

  var data_sum = []
  for (var j = 0; j < JR; ++j) {
    var jk = JS + j * JL / JR
    PT.sume(data_sum,muls(exp([0,π2 * ik * jk]), f(jk)))
  }

  var m = PT.length(data_sum)
  if (m > MAX) MAX = m
  DATA.push(m)
}

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  default:
    log(key, sndr, rcvr, msg)
  }
}
GAME_SRVR_INIT = () => {
  log('init game srvr')
}
GAME_CLNT_INIT = () => {
  log('init game clnt')
}

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var cntr = PT.divs(USR_IO_DSPLY.wh,2)
  var w = USR_IO_DSPLY.w
  var h = USR_IO_DSPLY.h
  var scale = (w < h ? w : h)/4

  g.strokeStyle = 'white'
  v = [0,h]
  for (var i = 0; i < IR; ++i) {
    var l = DATA[i]
    var ik = i / IR
    var p = [w * ik, h - l * h / MAX]
    PT.drawLine(g, v,p)
    v = p
  }
}
