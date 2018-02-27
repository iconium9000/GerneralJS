log = console.log

PROJECT_NAME = 'Physics Sim'
log('init game.js', PROJECT_NAME)

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

BALLS = []
PLANES = [
  { n: [0,1], p: [0,0]},  // 0
  { n: [1,0], p: [0,0]},  // 1
  { n: [0,-1], p: [0,0]}, // 2
  { n: [-1,0], p: [0,0]}, // 3
]

REPS = 10
N_BALLS = 1
MWS_PRV = null

MIN_RAD = 8
MAX_RAD = 2 + MIN_RAD

TICKS = 0

var f_color = PT.vcc('',Math.random,3)
var f_move = PT.vcc('vvs',(p,v,s) => p+v*s,2)

var f_bounce_plane = (b,v,r,p,n,s) => {
  var sub = PT.sub(b,p)
  var dot = PT.dot(sub,n)
  if (dot < r) {
    PT.set(b, f_move(b, n, r-dot))
    var vdot = PT.dot(v,n)
    if (vdot < 0)
      PT.set(v, f_move(v,n,-2 * vdot))
  }
}
var f_bounce_ball = (a,b,av,bv,ar,br,am,bm,s) => {
  var sub = PT.sub(b,a,2)
  var len = PT.length(sub)
  if (len && len < ar + br) {
    var mid = PT.muls(sub, ((ar + br) / len - 1) / 2)
    PT.sume(b,mid)
    PT.sube(a,mid)

    // var au = PT.muls(av,am/bm)
    // var bu = PT.muls(bv,bm/am)
    // PT.set(av,bu)
    // PT.set(bv,au)

    // var adot = PT.dot(av,sub)
    // var bdot = PT.dot(bv,sub)
    // var sdot = -1/len/len

    // adot > 0 && PT.set(av,f_move(av,sub,adot*sdot))
    // bdot < 0 && PT.set(bv,f_move(bv,sub,bdot*sdot))

    // adot > 0 && PT.set(bv,f_move(bv,sub,-adot*sdot*am/bm))
    // bdot < 0 && PT.set(av,f_move(av,sub,-bdot*sdot*bm/am))

    var au1 = PT.muls(sub,PT.dot(PT.muls(av,am),sub)/len/len)
    var bu1 = PT.muls(sub,PT.dot(PT.muls(bv,bm),sub)/len/len)
    var au2 = PT.divs(PT.sub(bu1,au1),am)
    var bu2 = PT.divs(PT.sub(au1,bu1),bm)
    PT.sume(av, au2)
    PT.sume(bv, bu2)
  }
}

GAME_TICK = () => {
  if (++TICKS < 4) return

  var g = USR_IO_DSPLY.g
  var dt = USR_IO_EVNTS.dt / 1e3
  var mws = USR_IO_MWS
  var hsDn = USR_IO_KYS.hsDn
  PLANES[3].p[0] = USR_IO_DSPLY.w
  PLANES[2].p[1] = USR_IO_DSPLY.h

  var MWS = PT.copy(mws)

  if (mws.hsDn) MWS_PRV = MWS
  if (mws.hsUp && MWS_PRV) {
    FU.forlen(N_BALLS, () => {
      var ball = {
        p: PT.copy(MWS_PRV),
        v: PT.sub(MWS, MWS_PRV),
        c: PT.color(PT.cat(f_color(),1)),
        r: MIN_RAD + Math.random() * (MAX_RAD - MIN_RAD)
      }
      ball.m = π * ball.r * ball.r
      BALLS.push(ball)
    })
    MWS_PRV = null
  }

  FU.forlen(REPS, () => {
    var t_dt = 1 * dt / REPS
    BALLS.forEach(ball => ball.p = f_move(ball.p,ball.v, t_dt))
    BALLS.forEach(ball => PLANES.forEach(plane =>
      f_bounce_plane(ball.p,ball.v,ball.r,plane.p,plane.n, t_dt)))
    for (var i = 0; i < BALLS.length-1; ++i) {
      var a = BALLS[i]
      for (var j = i+1; j < BALLS.length; ++j) {
        var b = BALLS[j]
        f_bounce_ball(a.p,b.p,a.v,b.v,a.r,b.r,a.m,b.m,t_dt)
      }
    }
  })


  var cntr = []
  var cntrv = []
  var energy = 0
  var mass = 0
  BALLS.forEach(ball => {
    g.fillStyle = ball.c
    pt.fillCircle(g, ball.p, ball.r)
    PT.sume(cntr,PT.muls(ball.p, ball.m),2)
    PT.sume(cntrv,PT.muls(ball.v, ball.m),2)
    energy += PT.length(ball.v) * ball.m
    mass += ball.m
  })
  g.fillStyle = 'white'
  PT.fillCircle(g,PT.divs(cntr,mass),10)
  g.fillText(PT.length(PT.divs(cntrv,mass)), 20,20)
  g.fillText(energy/mass, 20,40)



  g.fillStyle = 'white'
  pt.fillCircle(g, mws, 10)
}
