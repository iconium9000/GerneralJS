log = console.log

PROJECT_NAME = 'Orbits v2'
log('init game.js', PROJECT_NAME)
π = Math.PI

REPS = 100
D = 1
T = 1
GC = 0.3
G = GC * (D * D * D / T / T)


/*
  a = GM/rr = vv/r
  G = vvr
  G/R
  G = DDD/TT

*/

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

  ZERO = {
    p: [],
    v: [],
    r: 0.1,
    c: PT.color([1,1,0,1])
  }

  POINTS = []
  R = 0.4
  // POINTS.push({
  //   p: [R,0],
  //   v: [0,Math.sqrt(G/R)],
  //   r: 7e-2,
  //   c: PT.color([0,0,1,1])
  // })
  for (let i = 0; i <= 1; i += 0.125) {
    var tr = R + 0.4 * i
    POINTS.push({
      p: [R,0],
      v: [0,Math.sqrt(G/R) + i * 0.1],
      a: [],
      r: 6e-3,
      c: PT.color([i / 2 + 1, 0,0, 1]),
      h: []
    })
  }
  log(POINTS)
}

var ticks = 0
var inf = []
GAME_TICK = () => {
  if (ticks++ < 10) return

  var g = USR_IO_DSPLY.g
  var dt = USR_IO_EVNTS.dt * T / 1e3 / REPS
  var w = USR_IO_DSPLY.w
  var h = USR_IO_DSPLY.h
  var wh = pt.cat(PT.divs(USR_IO_DSPLY.d, 2), 0)
  var scal = wh[wh[0] > wh[1] ? 1 : 0] / D
  var proj = (p,r) => pt.sum(pt.muls(pt.cat(PT.copy(p,2),r),scal), wh, 3)
  var draw_point = p => {
    var j = proj(p.p, p.r)
    g.fillStyle = p.c
    pt.fillCircle(g, j, j[2])
  }

  let idx = ticks % w
  FU.forlen(REPS, () => POINTS.forEach(p => {
    var l = PT.length(p.p)
    var a = PT.muls(p.p, -dt * G / (l*l*l))
    var v = PT.muls(PT.sume(p.v, a), dt)
    PT.sume(p.p, v)
  }))
  POINTS.forEach(p => p.h[idx] = PT.length(p.p))

  draw_point(ZERO)
  POINTS.forEach(draw_point)

  g.fillStyle = 'white'
  inf[idx] = PT.mata(POINTS, 0, (p,s) => s + PT.length(p.p))
  //Math.cos(2 * π * ticks / 50) + Math.cos(2 * π * ticks / 200)
  

  POINTS.forEach(p => {
    g.fillStyle = p.c
    var s = 4e2
    FU.forlen(w, i => {
      g.beginPath()
      g.rect(w - i, 200 * p.h[(i + ticks) % w], 1, 1)
      g.fill()
    })
  })

  g.fillStyle =
  FU.forlen(w, i => {
    // var s = 1e-10

    g.beginPath()
    g.rect(w - i, 40 * inf[(i + ticks) % w], 1, 1)
    g.fill()
  })
}
