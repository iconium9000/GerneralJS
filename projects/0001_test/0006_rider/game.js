log = console.log

PROJECT_NAME = 'Agar.io Project'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)
GAME_MSG = (key, sndr, rcvr, msg) => {}
GAME_SRVR_INIT = () => {
  log('init game srvr')
}
GAME_CLNT_INIT = () => {
  log('init game clnt')
}

def_r = 10
G = 1e2


LINES = []
BALLS = []
prev = null
GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var mws = USR_IO_MWS
  var kys = USR_IO_KYS.isDn
  var dt = USR_IO_EVNTS.dt * 1e-3

  var cntr_vec = PT.divs(USR_IO_DSPLY.wh,2)

  var down = [0,G * dt]

  g.strokeStyle = 'white'

  if (mws.hsDn) {
    if (kys['w']) {
      var b = {}
      b.p = PT.copy(mws)
      b.v = []
      b.r = def_r
      BALLS.push(b)
    }
    else if (prev == null) {
      prev = PT.copy(mws)
    }
    else {
      var l = {}
      l.a = PT.copy(mws)
      l.b = prev
      LINES.push(l)
      prev = null
    }
  }
  else if (kys['w']) PT.drawCircle(g,mws,def_r)

  if (USR_IO_KYS.hsDn['q']) prev = null

  BALLS.forEach(b => {
    PT.sume(b.v,down)
    PT.sume(b.p,PT.muls(b.v,dt))
  })

  if (prev) {
    PT.drawCircle(g,prev,30)
    PT.drawLine(g,prev,mws)

    LINES.forEach(l => {
      g.strokeStyle = PT.lineCross(l.a,l.b,prev,mws) ? 'red' : 'white'
      PT.drawLine(g,l.a,l.b)
    })
  }
  else LINES.forEach(l => PT.drawLine(g,l.a,l.b))

  g.strokeStyle = 'white'
  BALLS.forEach(b => PT.drawCircle(g,b.p,b.r))

}
