log = console.log

PROJECT_NAME = 'Orbit Game'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false

PI2 = Math.PI*2

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


SCALER = 1e6
SHIP = {
  p: [200],
  v: [],
  a: [],
  r: 5,
  c: 'white',
  lc: 'black',
  soi: 0,
  control: unit => {
    var vboost = PT.muls(unit,VBOOST)
    if (USR_IO_KYS.isDn['w']) PT.sume(SHIP.a,vboost)
    if (USR_IO_KYS.isDn['s']) PT.sube(SHIP.a,vboost)
    var hboost = PT.invert(vboost)
    if (USR_IO_KYS.isDn['a']) PT.sume(SHIP.a,hboost)
    if (USR_IO_KYS.isDn['d']) PT.sube(SHIP.a,hboost)
  }
}
EARTH_U = 6e7
MOON_R = 500
VBOOST = 5e3
PLANETS = [
  SHIP,
  {
    name: 'earth',
    p: [], v: [], a: [],
    r: 150,
    u: EARTH_U,
    soi: Infinity,
    c: 'white',
    lc: 'black'
  },
  {
    name: 'moon',
    p: [MOON_R],
    v: [0,Math.sqrt(EARTH_U/MOON_R)],
    a: [],
    r: 50,
    u: EARTH_U,
    soi: 200,
    c: 'lightblue',
    lc: 'darkblue'
  }
]

function get_proj(ship,body) {
  var wh = USR_IO_DSPLY.wh
  var p1 = ship.p[0]||0, p2 = ship.p[1]||0, p3 = ship.r, p4 = (wh[1]||0) / 4
  var k1 = body.p[0]||0, k2 = body.p[1]||0, k3 = body.r
  var f21 = p1 - k1, f22 = p2 - k2
  var f11 = f22, f12 = -f21
  var f3 = Math.sqrt(f21*f21+f22*f22)
  var f4 = p4 / (f3 - k3)
  var m3 = f4 * f3 / (f11*f22 - f12*f21)
  var c1 = wh[0] / 2, c2 = wh[1] / 2
  proj_p = x => {
    var x1 = (x[0]||0) - p1, x2 = (x[1]||0) - p2
    var m1 = m3 * (f22*x1 - f21*x2) + c1
    var m2 = -m3 * (f11*x2 - f12*x1) + c2
    return [m1,m2]
  }
  proj_p.r = f4
  return proj_p
}
function fill_circle(proj,body) {
  var r = Math.abs(body.r*proj.r)
  if (r < 1) r = 1
  var point = proj(body.p)
  var g = USR_IO_DSPLY.g
  PT.fillCircle(g,point,r,body.c)
  for (var i = 0; i < 6; ++i) {
    var npoint = proj(PT.sum(body.p,PT.circle(PI2*i/6,body.r)))
    g.fillStyle = body.lc
    PT.drawLine(g,point,npoint)
  }
  if (body.soi) PT.drawCircle(g,point,proj.r*body.soi,body.c)
}
function get_host(i,p) {
  var sel_body = PLANETS[i]
  var sel_body_p = sel_body[p]

  var min_dist = Infinity
  var ret_body = null
  for (var j in PLANETS) {
    if (j==i) continue
    var body = PLANETS[j]

    var dist = PT.dist(body[p],sel_body_p)
    if (dist < body.soi && dist < min_dist) {
      min_dist = dist
      ret_body = body
    }
  }

  return ret_body
}
function do_math(i,p,v,a,dt) {
  var sel_body = PLANETS[i]
  var sel_body_p = sel_body[p]
  var sel_body_v = sel_body[v]
  var sel_body_a = sel_body[a] = []
  var host_body = sel_body.host_body
  if (!host_body) return
  var host_body_p = host_body[p]

  var sub = PT.sub(sel_body_p, host_body_p)
  var dist = PT.length(sub)
  var unit = PT.divs(sub,dist)

  if (sel_body.control) sel_body.control(unit)
  PT.vece(sel_body_a,sub,-host_body.u/dist/dist/dist)
  PT.vece(sel_body_v,sel_body_a,dt)
  if (dist < sel_body.r + host_body.r) {
    PT.set(sel_body_p,PT.vec(host_body_p,unit,sel_body.r + host_body.r))
    PT.vece(sel_body_v,unit,-2*PT.dot(sel_body_v,unit))
  }
  PT.vece(sel_body_p,sel_body_v,dt)
}


GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var cntr = PT.divs(wh,2)

  var reps = 1e1
  var dt = 1e-4 //USR_IO_EVNTS.dt*1e-3
  for (var rep = 0; rep < reps; ++rep){
    for (var i in PLANETS) {
      var body = PLANETS[i]
      body.host_body = get_host(i,'p')
      do_math(i,'p','v','a',dt)
    }
  }

  if (!SHIP.host_body) return
  var proj = get_proj(SHIP,SHIP.host_body)

  for (var i in PLANETS) {
    var body = PLANETS[i]
    fill_circle(proj,body)
  }

  var trail = 1e3
  for (var i in PLANETS) {
    var body = PLANETS[i]
    body.tp = PT.copy(body.p)
    body.tv = PT.copy(body.v)
    body.ta = PT.copy(body.a)
    if (!body.host_body) continue
    body.ptp = proj(body.p)
  }
  for (var trep = 0; trep < trail; ++trep) {
    for (var rep = 0; rep < reps; ++rep){
      for (var i in PLANETS) {
        var body = PLANETS[i]
        body.host_body = get_host(i,'tp')
        do_math(i,'tp','tv','ta',dt)
      }
    }
    for (var i in PLANETS) {
      var body = PLANETS[i]
      if (!body.host_body) continue
      g.strokeStyle = body.c
      var ptp = proj(PT.sum(body.host_body.p,PT.sub(body.tp,body.host_body.tp)))
      PT.drawLine(g,ptp,body.ptp)
      body.ptp = ptp
    }
  }

  // g.fillStyle = 'white'
  // g.fillText(`fps: ${1e3/USR_IO_EVNTS.dt}`,20,20)
}
