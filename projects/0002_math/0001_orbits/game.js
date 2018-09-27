log = console.log

PROJECT_NAME = 'Orbits'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

Y = 60 * 60 * 24 * 365 // s
G = 6.67408e-11 // (m^2 / s^2) ( m / kg )

S = {}
E = {}
J = {}
K = {}
OBJS = [S,E,J,K]

OBJS.forEach(o => {
  o.T = []
  o.U = []
})

function reset() {
  // sun
  S.M = 1.989e30 // kg
  S.C = 'yellow'
  S.P = []
  S.V = []
  S.K = 's'
  S.DR = 10
  // earth
  E.C = 'green'
  E.M = 5.972e24 // kg
  E.D = 1.49604618e11 // m
  E.A = 1.49598023e11 // m
  E.S = Math.sqrt(G * S.M * (2 / E.D - 1 / E.A))
  E.P = [E.D,0]
  E.V = [0,-E.S]
  E.K = 'e'
  E.DR = 4
  PT.sube(S.V,PT.muls(E.V,E.M/S.M))
  // jupiter
  J.C = 'orange'
  J.M = 1.898e27 // kg
  J.D = 7.78600627200e11 // m
  J.A = 7.7857e11 // m
  J.S = Math.sqrt(G * S.M / J.D)
  J.P = [0,J.D]
  J.V = [J.S,0]
  J.K = 'j'
  J.DR = 5
  PT.sube(S.V,PT.muls(J.V,J.M/S.M))
  // spacecraft
  K.C = 'red'
  K.M = 1e2 // kg
  K.D = (E.D + J.D) / 2
  K.S = Math.sqrt(G * S.M / K.D)
  K.P = [K.D,0]
  K.V = [0,-K.S]
  K.K = 'k'
  K.DR = 2
  PT.sube(S.V,PT.muls(E.V,E.M/S.M))

  OBJ_IDX = 0
  SCALE = 5

  MIN_DIST = 30

  ETIME = []
  EVENTS = []
  EVENT = null

  DELTA_V_SCALE = 0.001

  PROJ_TIME = 5 * Y
  PROJ_REPS = 2e3
  getProj()
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

function getProj() {
  var dt = PROJ_TIME / PROJ_REPS

  var p = []
  var v = []
  OBJS.forEach(o => p.push(PT.copy(o.P)))
  OBJS.forEach(o => v.push(PT.copy(o.V)))
  OBJS.forEach(o => o.T.length = o.U.length = 0)

  for (var r = 0; r < PROJ_REPS; ++r) {
    for (var i = 0; i < OBJS.length; ++i)
      for (var j = i+1; j < OBJS.length; ++j) {
        var sub = PT.sub(p[j],p[i])
        var fact = Math.pow(PT.length(sub),-3)
        PT.sube(v[j], PT.muls(sub, dt * G * OBJS[i].M * fact))
        PT.sume(v[i], PT.muls(sub, dt * G * OBJS[j].M * fact))
      }

    var e = ETIME[r]
    OBJS.forEach((o,i)=>{
      if (e && e.obj_idx == i) {
        PT.sume(v[i], e.delta_v)
      }
      PT.sume(p[i], PT.muls(v[i], dt))
      o.T.push(PT.copy(p[i]))
      o.U.push(PT.copy(v[i]))
    })
  }
}

reset()

var cntr_proj = PT.vcc('vvsv', (c,r,s,p) => c + (p - r) * s, 3)
GAME_TICK = () => {

  var g = USR_IO_DSPLY.g
  var dt = USR_IO_EVNTS.dt / 1e3
  var cntr = PT.divs(USR_IO_DSPLY.wh,2)
  var cntr_len = PT.length(cntr) * SCALE * 0.1
  var ds = cntr_len / J.D
  var mws = USR_IO_MWS

  var kys = USR_IO_KYS.hsDn

  if (kys[' ']) {

    OBJS.forEach(o => {
      PT.set(o.P, o.T[PROJ_REPS-1])
      PT.set(o.V, o.U[PROJ_REPS-1])
    })

    ETIME = []
    EVENTS = []
    EVENT = null
    getProj()
  }
  if (kys['Enter']) {
    var t = parseFloat(prompt('years',PROJ_TIME/Y))
    if (1e2 > t && t > 0) PROJ_TIME = t * Y

    ETIME = []
    EVENTS = []
    EVENT = null
    getProj()
  }

  if (kys['\\']) {
    var t = parseFloat(prompt('DELTA_V_SCALE',Math.log10(DELTA_V_SCALE)))
    if (10 > t && t > -10) DELTA_V_SCALE = Math.pow(10,t)
  }
  if (kys['0']) {
    var t = parseFloat(prompt('SCALE',Math.log10(SCALE)))
    if (10 > t && t > -10) SCALE = Math.pow(10,t)
  }

  if (kys['-'] && !kys['Enter']) SCALE -= 1
  if (kys['=']) SCALE += 1

  if (kys['q']) {
    if (EVENT) delete ETIME[EVENT.time_idx]
    EVENTS.pop()
    EVENT = EVENTS[EVENTS.length-1]
    getProj()
  }

  g.fillStyle = 'white'
  g.fillText(Math.log10(SCALE), 20,20)

  OBJS.forEach((o,i) => kys[o.K] && (OBJ_IDX = i))

  var min_dist = Infinity
  var min_time_idx = null
  var min_obj_idx = null
  var no_min_sel = true

  var O = OBJS[OBJ_IDX]
  EVENTS.forEach(e => {
    var p = OBJS[e.obj_idx].T[e.time_idx]
    p = cntr_proj(cntr,O.T[e.time_idx],ds,p)

    var dist = PT.dist(mws, p)
    if (dist < MIN_DIST && dist < min_dist) {
      min_dist = dist
      min_time_idx = e.time_idx
      min_obj_idx = e.obj_idx
      no_min_sel = NaN
    }
  })

  OBJS.forEach((o,obj_idx) => {
    var prev = null
    o.T.forEach((p,i) => {
      p = cntr_proj(cntr,O.T[i],ds,p)
      if (prev) PT.drawLine(g, p, prev, o.C)
      prev = p

      var dist = no_min_sel && PT.dist(mws, p)
      if (dist < min_dist) {
        min_dist = dist
        min_time_idx = i
        min_obj_idx = obj_idx
      }
    })
  })

  if (USR_IO_KYS.isDn['a']) {
    GRAPH = []
    GRAPH_MAX = []
    GRAPH_MIN = []
    OBJS.forEach((o,obj_idx) => GRAPH_MIN[obj_idx] = Infinity)
    OBJS.forEach((o,obj_idx) => GRAPH_MAX[obj_idx] = 0)
    OBJS.forEach((o,obj_idx) => GRAPH[obj_idx] = [])
    OBJS.forEach((o,obj_idx) => FU.forlen(PROJ_REPS, time_idx => {
      var sub = PT.sub(O.T[time_idx],o.T[time_idx])
      var len = PT.length(sub)
      GRAPH[obj_idx][time_idx] = len
      if (len > GRAPH_MAX[obj_idx]) GRAPH_MAX[obj_idx] = len
      if (len < GRAPH_MIN[obj_idx]) GRAPH_MIN[obj_idx] = len
    }))

    OBJS.forEach((o,obj_idx) => {
      var prev = null
      var max = GRAPH_MAX[obj_idx]
      var min = GRAPH_MIN[obj_idx]
      if (!max) return

      FU.forlen(PROJ_REPS, time_idx => {
        var len = GRAPH[obj_idx][time_idx]

        var y = (len-min) / (max-min) * cntr[1]
        var x = time_idx / PROJ_REPS * 2 * cntr[0]

        var point = [x,y]
        min_time_idx == time_idx && PT.fillCircle(g, point, o.DR, o.C)
        prev && PT.drawLine(g, point, prev, o.C)
        prev = point
      })
    })
  }

  if (min_dist < MIN_DIST && mws.hsDn && (!EVENT || EVENT.time_idx < min_time_idx)) {
    EVENTS.push(EVENT = {})
    ETIME[min_time_idx] = EVENT
    EVENT.time_idx = min_time_idx
    EVENT.obj_idx = min_obj_idx
    EVENT.delta_v = []
  }

  if (ETIME[min_time_idx]) {
    var e = ETIME[min_time_idx]
    var p = OBJS[e.obj_idx].T[e.time_idx]
    // var v = PT.sub(OBJS[e.obj_idx].U[e.time_idx],O.U[e.time_idx])
    var v = OBJS[e.obj_idx].U[e.time_idx]
    var vi = [-v[1],v[0]]

    var dv = PT.copy(e.delta_v)

    if (kys['ArrowUp']) PT.sume(e.delta_v, PT.muls(v, DELTA_V_SCALE))
    if (kys['ArrowDown']) PT.sube(e.delta_v, PT.muls(v, DELTA_V_SCALE))
    if (kys['ArrowRight']) PT.sume(e.delta_v, PT.muls(vi, DELTA_V_SCALE))
    if (kys['ArrowLeft']) PT.sube(e.delta_v, PT.muls(vi, DELTA_V_SCALE))

    // PT.equal(dv, e.delta_v) ||
    g.fillStyle = 'white'
    g.fillText(e.delta_v + ' ' + PT.length(e.delta_v), 20, 40)
    getProj()
  }

  if (min_dist < MIN_DIST) {
    g.fillStyle = 'white'

    var sel_o = OBJS[min_obj_idx]
    {
      var o = sel_o
      var op = O.T[min_time_idx]
      var ov = O.U[min_time_idx]
      var p = o.T[min_time_idx]
      var v = o.U[min_time_idx]
      var sub = PT.sub(p,op)
      var len = PT.length(sub)
      var rel = PT.unit([-sub[1],sub[0]])
      var speed = Math.sqrt(G * O.M / len)
      rel = PT.muls(rel, speed)

      var v1 = PT.sub(PT.sum(ov,rel),v)
      var v2 = PT.sub(PT.sub(ov,rel),v)

      var v1_len = PT.length(v1)
      var v2_len = PT.length(v2)

      var v0 = v1_len > v2_len ? v2 : v1

      g.fillStyle = 'white'
      g.fillText(v0 + ' ' + PT.length(v0), 20, 80)
    }

    var sel_p = cntr_proj(cntr,O.T[min_time_idx],ds,sel_o.T[min_time_idx])
    PT.sube(sel_p,cntr)
    var sel_len = PT.length(sel_p)
    OBJS.forEach((o,i) => {
      var p = cntr_proj(cntr,O.T[min_time_idx],ds,o.T[min_time_idx])
      PT.fillCircle(g,p,o.DR,o.C)
      PT.drawLine(g,p,cntr,o.C)
      PT.sube(p,cntr)
      var len = PT.length(p)

      var cross = PT.cross(sel_p, p)
      var cross_len = PT.length(cross)
      var cross_sin = cross_len / len / sel_len
      var cross_angle = Math.asin(cross_sin)

      g.fillText(cross_angle,20,USR_IO_DSPLY.h - 20 * (1 + i))
    })
  }
  else {
    OBJS.forEach(o =>
      PT.fillCircle(g,cntr_proj(cntr,O.P,ds,o.P),o.DR,o.C))
  }

  EVENTS.forEach(e => OBJS.forEach((o,obj_idx) => {
    var p = cntr_proj(cntr,O.T[e.time_idx],ds,o.T[e.time_idx])
    PT.fillCircle(g,p,o.DR,min_time_idx == e.time_idx ? 'white' : o.C)
    e.obj_idx == obj_idx && PT.drawCircle(g,p,MIN_DIST,'white')
  }))

}
