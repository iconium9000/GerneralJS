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
dis_r = 20
G = 1e2

function ballLine(b,l) {
  var da = PT.dist(l.a,b.p)
  var db = PT.dist(l.b,b.p)

  var lineDist = PT.lineDist(b.p,l.a,l.b)
  // PT.drawCircle(g,b.p,lineDist)

  if (lineDist < b.r) {
    var pa = PT.sub(b.p,l.a)

    var p_dot = PT.dot(pa,l.uiv)
    var v_dot = PT.dot(b.v,l.uiv)

    if ((p_dot < 0) != (v_dot < 0)) {
      PT.sube(b.v, PT.muls(l.uiv, 2 * v_dot))
    }
  }
}

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
  var side = [dis_r,0]

  g.strokeStyle = 'white'

  if (USR_IO_KYS.hsDn[' ']) {
    BALLS = []
    LINES = []
  }

  if (mws.hsDn) {
    if (kys['w']) {
      var b = {}
      b.p = 
      b.a = {}
      b.b = {}
      b.a.r = b.b.r = def_r
      b.a.v = []
      b.b.v = []
      b.a.p = PT.sub(mws,side)
      b.b.p = PT.sum(mws,side)
      BALLS.push(b)
    }
    else if (prev == null) {
      prev = PT.copy(mws)
    }
    else {
      var l = {}
      l.a = PT.copy(mws)
      l.b = prev
      l.ba = PT.sub(l.a,l.b)
      l.d = PT.length(l.ba)
      l.uiv = l.d == 0 ? [] : PT.unit(PT.invert(l.ba))
      LINES.push(l)
      prev = null
    }
  }
  else if (kys['w']) PT.drawCircle(g,mws,def_r)

  if (USR_IO_KYS.hsDn['q']) prev = null

  BALLS.forEach(b => {
    PT.sume(b.a.v,down)
    PT.sume(b.b.v,down)

    LINES.forEach(l => ballLine(b.a,l))
    LINES.forEach(l => ballLine(b.b,l))

    var mid = PT.divs(PT.sum(b.a.p,b.b.p),2)
    var sub = PT.sub(b.b.p,b.a.p)
    var sub_u = PT.unit(sub)
    var dot_av = PT.muls(sub_u, PT.dot(sub_u,b.a.v))
    var dot_bv = PT.muls(sub_u, PT.dot(sub_u,b.b.v))

    PT.sume(b.a.v, dot_bv)
    PT.sube(b.b.v, dot_bv)

    PT.sume(b.b.v, dot_av)
    PT.sube(b.a.v, dot_av)

    PT.sume(b.a.p,PT.muls(b.a.v,dt))
    PT.sume(b.b.p,PT.muls(b.b.v,dt))

    mid = PT.divs(PT.sum(b.a.p,b.b.p),2)
    sub = PT.muls(PT.unit(PT.sub(b.b.p,b.a.p)),dis_r)
    PT.set(b.a.p, PT.sum(mid,sub))
    PT.set(b.b.p, PT.sub(mid,sub))
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
  BALLS.forEach(b => {
    PT.drawCircle(g,b.a.p,b.a.r)
    PT.drawCircle(g,b.b.p,b.a.r)
    PT.drawLine(g,b.a.p,b.b.p)
  })

}
