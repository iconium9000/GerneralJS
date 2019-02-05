log = console.log

PROJECT_NAME = 'Circle Factory'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false

GRAV = 1e5
MAX_DT = 0.001

// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')
}

GAME_CLNT_INIT = () => {
  log('init game clnt')
}

// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------

function get_orbit({
  stdg,         // standard gravitational parameter
  normal,       // unit vector in any direction
  periapsis,    // vector defining the periapsis
                // note: redefined to be orthogonal to normal (by subtraction)
  ecc,          // orbital eccentricity
  angle,        // angle about the normal from the periapsis
}, sample_body) {
  stdg = Math.abs(stdg)
  ecc = Math.abs(ecc)
  periapsis = PT.vec(periapsis,normal,-PT.dot(normal,periapsis))
  // log(PT.dot(normal,periapsis))

  var cos = Math.cos(angle), sin = Math.sin(angle)
  cross = PT.cross(periapsis,normal)

  var position = PT.circle(angle, (1 + ecc) / (1 + ecc * cos))
  var plen3_1_ecc = Math.pow(PT.length(periapsis),3) * (1 + ecc)
  var velocity = PT.muls([-sin, ecc + cos], Math.sqrt(stdg / plen3_1_ecc))

  var plane = [periapsis,cross]
  sample_body = sample_body || {}
  sample_body.position = PT.vecx(plane,position)
  sample_body.velocity = PT.vecx(plane,velocity)
  return sample_body
}


function super_host(body) {
  return body.host ? super_host(body.host) : body
}
function super_position(body) {
  var sp = super_position
  return body.host ? PT.sum(body.position, sp(body.host)) : body.position
}
function clear_host(body) {
  if (body.host) {
    body.host.sub_bodies.splice(body.idx)
    body.host = null
  }
}
function set_null_host(body) {
  clear_host(body)
  body.soi = Infinity
  body.sma = 0
  body.position = []
  body.velocity = []
  return body
}
function set_sma_soi(body) {
  var r = PT.length(body.position)
  var v = body.velocity
  var vv = PT.dot(v,v)
  body.sma = 1 / (2 / r - vv / body.host.stdg)
  body.soi = Math.abs(body.sma) * Math.pow(body.mass / body.host.mass, 0.4)
  return body
}
function set_host(host, body) {
  clear_host(body)
  body.idx = host.sub_bodies.push(body) - 1
  body.host = host
  return set_sma_soi(body)
}
function set_host_host(body) {
  if (body.host) {
    if (body.host.host) {
      PT.sume(body.position, body.host.position)
      PT.sume(body.velocity, body.host.velocity)
      set_host(body.host.host,body)
      return body.host.host
    }
    else {
      set_sub_host(body, body.host)
      return set_null_host(body)
    }
  }
  else return body
}
function set_sub_host(sub_host,body) {
  PT.sube(body.position, sub_host.position)
  PT.sube(body.velocity, sub_host.velocity)
  set_host(sub_host,body)
  return sub_host
}
function set_new_body(body) {
  body.sub_bodies = []
  body.stdg = GRAV * body.mass

  var bad_mass = MASSES[body.mass]
  if (bad_mass) {
    throw `bad ${body.name} mass of ${body.mass} (${bad_mass.name})`
  }
  MASSES[body.mass] = body
  var f = body.host ? set_sma_soi : set_null_host
  f(body)
}
function place_body(host, new_body) {
  if (host) set_host(host, new_body)
  set_new_body(new_body)
  return super_host(host || new_body)
}
function check_host(host) {
  // log('check_host')
  // for (var i in host.sub_bodies) {
  //   var sub_body = host.sub_bodies[i]
  //   var dist = PT.length(sub_body.position)
  //   // if (host.name == 'Moon') log(dist)
  //   if (dist > host.soi || sub_body.mass > host.mass) {
  //     var new_host = check_host(set_host_host(sub_body))
  //     if (new_host.host) throw new_host
  //     else return new_host
  //   }
  // }
  //
  // for (var i = 0; i < host.sub_bodies.length; ++i) {
  //   var body_a = host.sub_bodies[i]
  //   for (var j = i + 1; j < host.sub_bodies.length; ++j) {
  //     var body_b = host.sub_bodies[j]
  //     var dist = PT.dist(body_a.position, body_b.position)
  //
  //     if (body_a.soi > dist || body_b.soi > dist) {
  //       if (body_a.mass > body_b.mass) {
  //         set_sub_host(body_a, body_b)
  //         --j
  //       }
  //       else {
  //         set_sub_host(body_b, body_a)
  //         --i
  //         break
  //       }
  //     }
  //   }
  // }
  // for (var i in host.sub_bodies) {
  //   var sub_body = host.sub_bodies[i]
  //   try {
  //     check_host(sub_body)
  //   }
  //   catch (new_host) {
  //     return new_host
  //   }
  // }
  return host
}
function move_body(body, dt) {
  if (body.host) {
    var r = PT.length(body.position)
    PT.vece(body.velocity, body.position, -dt * body.host.stdg / r / r / r)
    PT.vece(body.position, body.velocity, dt)
  }
  FU.forEach(body.sub_bodies, sub_body => move_body(sub_body, dt))
  return body
}

BODY_QUEUE = []
SOI_COLOR = '#202020'
MASSES = []

SUN = place_body(null,SUN = {
  name: 'Sun',
  mass: 1e5,
  color: 'yellow',
  radius: 20
})

SUN = place_body(SUN,EARTH = get_orbit({
  stdg: SUN.stdg,
  normal: [0,0,1],
  periapsis: [1e3,0,0],
  ecc: 0.1,
  angle: 0
},{
  name: 'Earth',
  color: 'blue',
  mass: 1e3,
  radius: 10
}))

SUN = place_body(EARTH,MOON = get_orbit({
  stdg: EARTH.stdg,
  normal: [0,0,1],
  periapsis: [1e2,0,0],
  ecc: 0.1,
  angle: PI/3
},{
  name: 'Moon',
  color: 'grey',
  mass: 1e2,
  radius: 2
}))

SUN = place_body(EARTH, get_orbit({
  stdg: EARTH.stdg,
  normal: [0,0,1],
  periapsis: [1e2,0,0],
  ecc: 0.8,
  angle: PI/4
},{
  name: 'Other Moon',
  color: 'purple',
  mass: 5e1,
  radius: 1
}))

SEL_BODY = SUN

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  CNTR = PT.divs(USR_IO_DSPLY.wh,2)
  DT = USR_IO_EVNTS.dt * 1e-3
  if (isNaN(DT) || DT > 1) DT = 5e-3
  move_camera()
  draw_bodies(SUN)

  var soft_reps = DT / MAX_DT
  var hard_reps = Math.ceil(soft_reps)
  var soft_dt = DT / hard_reps

  for (var i = 0; i < hard_reps; ++i) {
    SUN = check_host(SUN)
    SUN = move_body(SUN, soft_dt)
  }

  G.fillStyle = SOI_COLOR
  G.fillText(hard_reps, 20, 20)
}

// -----------------------------------------------------------------------------
// IO
// -----------------------------------------------------------------------------

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  default:
    log(key, sndr, rcvr, msg)
  }
}

// -----------------------------------------------------------------------------
// VIEW
// -----------------------------------------------------------------------------

CAMERA = {
  origin: SUN,
  normal: [1,0,0], // y
  position: [0,0,1], // z
  speed: 1,
  zoom_speed: 5e-3,
  _scale: 0.2,
  get scale() {
    var sqr = this._scale > 1 ? this._scale : 1 / (this._scale - 2)
    return sqr * sqr
  },
}
CAMERA.cross = PT.cross(CAMERA.position,CAMERA.normal)

DIRS = {
  a: [-1], d: [1],
  w: [0,1], s: [0,-1],
  q: [0,0,1], e: [0,0,-1]
}

function move_camera() {
  var dir = []
  FU.forEach(DIRS,(p,d) => USR_IO_KYS.isDn[d] && PT.sume(dir,p))
  PT.mulse(dir,DT*CAMERA.speed,3)

  if (PT.length(dir)) {
    var x0 = CAMERA.position
    var y0 = CAMERA.cross
    var z0 = CAMERA.normal
    var x1 = PT.circle_vec(x0,y0,dir[0])
    var y1 = PT.circle_vec(x0,y0,dir[0] + PI/2)
    var z1 = z0
    var z2 = PT.circle_vec(z1,x1,dir[1])
    var x2 = PT.circle_vec(z1,x1,dir[1] + PI/2)
    var y2 = y1

    var y3 = PT.circle_vec(y2,z2,-dir[2])
    var z3 = PT.circle_vec(y2,z2,-dir[2] + PI/2)
    var x3 = x2

    CAMERA.position = PT.unit(x3)
    CAMERA.cross = PT.unit(y3)
    CAMERA.normal = PT.unit(z3)
  }

  if (USR_IO_MWS.hsWl) {
    CAMERA._scale += CAMERA.zoom_speed * USR_IO_MWS.wlPt[1]
  }

  if (USR_IO_KYS.hsDn['.']) {
    var body = BODY_QUEUE.pop() || SUN
    CAMERA.origin = body
    // log(CAMERA.focus)
    BODY_QUEUE = body.sub_bodies.concat(BODY_QUEUE)
  }

  CAMERA.focus = super_position(CAMERA.origin)
}

var proj_point = p => {
  p = PT.sub(p,CAMERA.focus)
  var dot = PT.dot(p,CAMERA.position)
  var u = [PT.dot(CAMERA.cross,p),PT.dot(CAMERA.normal,p)]
  return PT.vec(CNTR,u,CAMERA.scale)
}
var draw_circle = (p,r,c) => {
  PT.drawCircle(G,proj_point(p),r*CAMERA.scale,c)
}
function draw_bodies(body,point) {
  var sub_point = PT.sum(body.position, point || [])
  var proj = proj_point(sub_point)
  PT.drawCircle(G, proj, body.radius * CAMERA.scale, body.color)
  if (body.host) {
    PT.drawLine(G, proj, proj_point(point),'white')
  }
  if (isFinite(body.soi)) {
    PT.drawCircle(G, proj, body.soi * CAMERA.scale, SOI_COLOR)
  }
  for (var i in body.sub_bodies) {
    var sub_body = body.sub_bodies[i]
    draw_bodies(sub_body, sub_point)
  }
}
