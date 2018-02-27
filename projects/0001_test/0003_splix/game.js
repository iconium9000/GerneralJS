log = console.log

PROJECT_NAME = 'Splix'
log('init game.js', PROJECT_NAME)


var CEL_SIZE = 25
var PLR_PT = []
var CNTR_PT = []

var msij_to_clij = function() {
  var fun = PT.vcc('vvvs',(m,p,c,z) => Math.round((m-c)/z+p), 2)
  return msij => fun(msij,PLR_PT,CNTR_PT,CEL_SIZE)
}()

var clij_to_msij = function() {
  var fun = PT.vcc('vvvs',(m,p,c,z) => (m-p) * z + c, 2)
  return clij => fun(clij,PLR_PT,CNTR_PT,CEL_SIZE)
}()

var clij_to_srij = clij => `${clij[0]},${clij[1]}`
var srij_to_clij = function() {
  var fun = PT.vcc('v', parseFloat, 2)
  return srij => fun(srij.split(','))
}()

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

DIR = [
  [[0,-1],'ArrowUp'],
  [[0,1],'ArrowDown'],
  [[1,0],'ArrowRight'],
  [[-1,0],'ArrowLeft']
]

GRID = {}
PLAYERS = {}
PLAYER = {
  id: CLNT_ID,
  dir: DIR[Math.floor(Math.random() * 4)][0],
  csij: [],
  clij: [],
  msij: [],
  srij: '0,0',
  trail: {},
  cells: {},
  color: PT.color([0.8,0,0.8,1]),
  trail_color: PT.color([1,0,1,1])
}

TICKS = 0


FUN_PLR_MOVE = PT.vcc('vvs',(cs, dir, dt) => cs + dir * dt, 2)
GAME_TICK = () => {
  if (++TICKS < 10) return

  if (PLAYER.id != CLNT_ID) {
    delete PLAYERS[PLAYER.id]
    PLAYERS[PLAYER.id = CLNT_ID] = PLAYER
  }

  CNTR_PT = PT.divs(USR_IO_DSPLY.wh,2)
  PLR_PT = PLAYER.csij
  var g = USR_IO_DSPLY.g
  var dt = USR_IO_EVNTS.dt / 1e3
  var mws = USR_IO_MWS
  var hsDn = USR_IO_KYS.hsDn

  var mws_clij = msij_to_clij(mws)
  var mws_msij = clij_to_msij(mws_clij)
  var mws_srij = clij_to_srij(mws_clij)

  g.fillStyle = 'white'
  pt.fillCircle(g, mws, 10)
  pt.fillSquare(g, mws_msij, 10)
  g.fillText(mws_srij, 20, 20)

  FU.forEach(PLAYERS, plr => {
    plr.csij = FUN_PLR_MOVE(plr.csij, plr.dir, dt * 2)
    plr.msij = clij_to_msij(plr.csij)
    plr.clij = msij_to_clij(plr.msij)
    plr.srij = clij_to_srij(plr.clij)

    var cel = GRID[plr.srij] || (GRID[plr.srij] = {
      clij: plr.clij,
      srij: plr.srij
    })
    cel.plr = plr
  })


  FU.forEach(GRID, cel => {
    g.fillStyle = cel.plr.trail_colorw
    cel.msij = clij_to_msij(cel.clij)
    pt.fillSquare(g, cel.msij, 11)
  })
  FU.forEach(PLAYERS, plr => {
    g.fillStyle = plr.color
    pt.fillCircle(g, plr.msij, 13)
  })

  DIR.forEach(d => {
    if (hsDn[d[1]] && PLAYER.dir != d[0]) {
      PLAYER.dir = d[0]
      PLAYER.csij = PT.sum(PLAYER.clij,d[0])
    }
  })
}
