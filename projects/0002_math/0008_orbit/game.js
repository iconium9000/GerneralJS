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
EARTH_U = 6e5
MOON_R = 500
VBOOST = 5e1
PLANETS = [
  SHIP,
  {
    name: 'earth',
    p: [],
    v: [],
    r: 150,
    u: 6e5,
    soi: Infinity,
    c: 'white',
    lc: 'black'
  },
  {
    name: 'moon',
    p: [MOON_R],
    v: [0,Math.sqrt(EARTH_U/MOON_R)],
    r: 50,
    u: 1e5,
    soi: 200,
    c: 'lightblue',
    lc: 'darkblue'
  }
]

function get_proj(ship,body) {
  var wh = USR_IO_DSPLY.wh
  var p1 = ship.p[0]||0, p2 = ship.p[1]||0, p3 = ship.r, p4 = (wh[1]||0) / 20
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


GAME_TICK = () => {
  var dt = 0.01//USR_IO_EVNTS.dt*1e-3
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var cntr = PT.divs(wh,2)

  for (var i in PLANETS) {
    var body = PLANETS[i]
    var min_dist = Infinity
    body.local_body = null
    for (var j in PLANETS) {
      if (i==j) continue
      var temp_body = PLANETS[j]
      var dist = PT.dist(body.p,temp_body.p)
      if (dist <= temp_body.soi && dist <= min_dist) {
        min_dist = dist
        body.local_body = temp_body
      }
    }
  }

  if (!SHIP.local_body) return
  var proj = get_proj(SHIP,SHIP.local_body)

  for (var i in PLANETS) {
    var body = PLANETS[i]
    fill_circle(proj,body)
  }

  fill_circle(proj,SHIP)

  for (var i in PLANETS) {
    var body = PLANETS[i]
    if (!body.local_body) continue
    var local_body = body.local_body
    var sub = PT.sub(body.p,local_body.p)
    var dist = PT.length(sub)
    var unit = PT.divs(sub,dist)
    if (dist < local_body.r + body.r) {
      body.p = PT.vec(local_body.p,sub,(local_body.r + body.r)/dist)
      PT.vece(body.v,unit,-2*PT.dot(body.v,unit))
    }
    body.a = []
    if (body.control) body.control(unit)
    PT.vece(body.a,sub,-local_body.u/dist/dist/dist)
    PT.vece(body.v,body.a,dt)
    PT.vece(body.p,body.v,dt)

    // var rv = PT.dist(body.v,local_body.v)
    // var ap = 1 / ( 2 / dist - rv*rv/local_body.u)
    // g.fillStyle = 'white'
    // g.fillText(`Ap: ${ap}`,20,20)
    // g.fillText(`rv: ${rv}`,20,40)
  }

  var dt = 0.01
  for (var i in PLANETS) {
    var body = PLANETS[i]
    body.tp = PT.copy(body.p)
    body.tv = PT.copy(body.v)
    body.ptp = proj(PT.copy(body.tp))
  }
  for (var t = 0; t < 1e4; ++t) {

    for (var i in PLANETS) {
      var body = PLANETS[i]
      var min_dist = Infinity
      var local_body
      for (var j in PLANETS) {
        if (i==j) continue
        var temp_body = PLANETS[j]
        var dist = PT.dist(body.tp,temp_body.tp)
        if (dist <= temp_body.soi && dist <= min_dist) {
          min_dist = dist
          local_body = temp_body
        }
      }

      if (!local_body) continue
      var sub = PT.sub(body.tp,local_body.tp)
      var dist = PT.length(sub)
      var unit = PT.divs(sub,dist)
      if (dist < local_body.r + body.r) {
        body.tp = PT.vec(local_body.tp,sub,(local_body.r + body.r)/dist)
        PT.vece(body.tv,unit,-2*PT.dot(body.tv,unit))
      }
      body.ta = []
      PT.vece(body.ta,sub,-local_body.u/dist/dist/dist)
      PT.vece(body.tv,body.ta,dt)
      PT.vece(body.tp,body.tv,dt)
      g.strokeStyle = body.c
      var ptp = proj(body.tp)
      PT.drawLine(g,ptp,body.ptp)
      body.ptp = ptp
    }
  }
}
