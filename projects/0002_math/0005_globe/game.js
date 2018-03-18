log = console.log

PROJECT_NAME = 'Globe Project'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

var RAD = 20
var CNTR = []
var LOCS = [CNTR]
var NBRS = [[]]
var CEL_Q = [0]

var frnd = []

function addCel(cel,i,a) {
  var cel_loc = LOCS[cel]
  var dif = PT.circle(a)
}

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wdw = PT.divs(USR_IO_DSPLY.wh,2)
  var wdz = PT.length(wdw)
  var pi = 2 * Math.PI / 6

  g.strokeStyle = 'white'
  PT.drawCircle(g, wdw, wdz/2)

  var q = []
  CEL_Q.forEach(cel => FU.forlen(6, i => addCel(cel,i,i * pi)))
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
