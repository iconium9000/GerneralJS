log = console.log

PROJECT_NAME = 'Circle Factory'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false
DEG = PI2 / 360

TIME_SCALE = 5e4
GRAV = 6.67408e-11
MAX_DT = TIME_SCALE * 1e-4
MIN_RADIUS = 3
MAX_TRAIL_LENGTH = 5e2
ZOOM_SPEED = 1e-2

RADIUS_SCALE = 40

TRAIL_STYLE_IDX = 0
TRAIL_STYLE_NAMES = [
  'soi',
  'soi_offset',
  'super',
  'super_offset'
]

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

  // either normal and periapsis...
  normal,       // unit vector in any direction
  periapsis,    // vector defining the periapsis
                // note: redefined to be orthogonal to normal (by subtraction)
  // or inclination and longitude of ascending node and argument of periapsis
  inclination,  // inclination relative to x,z plane
  long_as_node, // longitude of ascending node
  arg_of_praps, // argument of periapsis

  mean_anomaly, // mean_anomaly about the normal from the periapsis


  // orbital characteristics will be def by the 1st of the following parameters
  ecc,          // orbital eccentricity
  period,       // orbital period
  sma,          // semi-major-axis
  apoapsis,     // apoapsis

}, sample_body) {
  stdg = Math.abs(stdg)
  periapsis = PT.vec(periapsis,normal,-PT.dot(normal,periapsis))
  var periapsis_len = PT.length(periapsis)
  if (isFinite(ecc)) {
    ecc = Math.abs(ecc)
  }
  else if (isFinite(period)) {
    var sma = Math.pow(stdg * FU.sqr(period / PI2), 1/3)
    ecc = 1 - periapsis_len / sma
    log(sma,periapsis_len,ecc)
  }
  else if (isFinite(sma)) {
    ecc = 1 - periapsis_len / sma
  }
  else if (isFinite(apoapsis)) {
    ecc = (apoapsis - periapsis) / (apoapsis + periapsis)
  }

  var cos = Math.cos(mean_anomaly), sin = Math.sin(mean_anomaly)
  cross = PT.cross(periapsis,normal)

  var position = PT.circle(mean_anomaly, (1 + ecc) / (1 + ecc * cos))
  var plen3_1_ecc = Math.pow(periapsis_len,3) * (1 + ecc)
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
function set_super_position(body, position, velocity) {
  var p = body.super_position = PT.sum(body.position, position || [])
  var v = body.super_velocity = PT.sum(body.velocity, velocity || [])
  for (var i in body.sub_bodies) {
    set_super_position(body.sub_bodies[i], p, v)
  }
}

function clear_host(body) {
  if (body.host) {
    var sub_bodies = body.host.sub_bodies
    sub_bodies.splice(sub_bodies.indexOf(body),1)
    body.host = null
  }
}
function set_null_host(body) {
  clear_host(body)
  body.soi = Infinity
  body.sma = 0
  body.period = 0
  body.position = []
  body.velocity = []
  return body
}
function set_sma_soi(body) {
  var r = body.distance = PT.length(body.position)
  var v = body.velocity
  var vv = PT.dot(v,v)
  var u = body.host.stdg
  var a = body.sma = 1 / (2 / r - vv / u)
  body.period = PI2 * Math.sqrt(a * a * a / u) / TIME_SCALE
  body.soi = Math.abs(a) * Math.pow(body.mass / body.host.mass, 0.4)
  return body
}
function set_host(host, body) {
  clear_host(body)
  host.sub_bodies.push(body)
  body.host = host
  set_sma_soi(body)
  return body.host
}
function set_host_host(body) {
  if (body.host) {
    if (body.host.host) {
      PT.sume(body.position, body.host.position)
      PT.sume(body.velocity, body.host.velocity)
      return set_host(body.host.host,body)
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
  ++check_host.count
  for (var i in host.sub_bodies) {
    var sub_body = host.sub_bodies[i]
    var dist = sub_body.distance

    if (dist > host.soi || sub_body.mass > host.mass) {
      set_host_host(sub_body)
    }
  }

  for (var i = 0; i < host.sub_bodies.length; ++i) {
    var body_a = host.sub_bodies[i]
    for (var j = i + 1; j < host.sub_bodies.length; ++j) {
      var body_b = host.sub_bodies[j]
      var dist = PT.dist(body_a.position, body_b.position)

      if (body_a.soi > dist || body_b.soi > dist) {
        if (body_a.mass > body_b.mass) {
          set_sub_host(body_a, body_b)
          --j
        }
        else {
          set_sub_host(body_b, body_a)
          --i
          break
        }
      }
    }
  }

  for (var i in host.sub_bodies) {
    var sub_body = host.sub_bodies[i]
    check_host(sub_body)
  }

  return host
}
function sort_bodies(body) {
  body.sub_bodies.sort((a,b)=>b.sma - a.sma)
  body.sub_bodies.forEach(sort_bodies)
  return body
}
function setup_bodyframe(bodyframe, host) {
  eval(`${bodyframe.body.name.toUpperCase()} = bodyframe.body`)

  var sun = null
  if (host) {
    bodyframe.stdg = host.stdg
    bodyframe.body = get_orbit(bodyframe, bodyframe.body)
    sun = place_body(host, bodyframe.body)
  }
  else {
    sun = place_body(null, bodyframe.body)
  }

  for (var i in bodyframe.orbits) {
    sun = setup_bodyframe(bodyframe.orbits[i], bodyframe.body)
  }

  return sun
}
function move_body(body, dt) {
  if (body.host) {
    var r = body.distance
    PT.vece(body.velocity, body.position, -dt * body.host.stdg / r / r / r)
    PT.vece(body.position, body.velocity, dt)
    body.distance = PT.length(body.position)
  }
  FU.forEach(body.sub_bodies, sub_body => move_body(sub_body, dt))
  return body
}
function leave_trail(body,dt,host_trail) {
  var trail = {
    dt: dt,
    host_trail: host_trail,
    host: body.host,
    body: body,
    color: body.color,
    distance: body.distance,
    position: PT.copy(body.position),
    super_position: body.super_position,
    velocity: body.velocity,
    super_velocity: body.super_velocity,
    sub_bodies: []
  }
  for (var i in body.sub_bodies) {
    trail.sub_bodies.push(leave_trail(body.sub_bodies[i],dt,trail))
  }
  return trail
}
function get_trail(trail, body) {
  if (trail.body == body) return trail

  for (var i in trail.sub_bodies) {
    var sub_trail = get_trail(trail.sub_bodies[i],body)
    if (sub_trail) return sub_trail
  }

  return null
}

BODY_QUEUE = []
SOI_COLOR = '#202020'
MASSES = []

var kerbal_bodyframe = {
  body: {
    name: 'Kerbol',
    mass: 1.7565459e28,
    radius: 2.616e8,
    color: 'yellow',
  },
  orbits: [
    // moho
    {
      normal: [0,0,1],
      periapsis: [4210510628,0,0],
      ecc: 0.2,
      mean_anomaly: 0,
      body: {
        name: 'Moho',
        mass: 2.5263314e21,
        radius: 2.5e5,
        color: '#593001',
      },
      orbits: []
    },
    // eve
    {
      normal: [0,0,1],
      periapsis: [9734357701,0,0],
      ecc: 0.01,
      mean_anomaly: 0,
      body: {
        name: 'Eve',
        mass: 1.2243980e23,
        radius: 7e5,
        color: 'purple'
      },
      orbits: [
        {
          normal: [0,0,1],
          periapsis: [14175000],
          ecc: 0.55,
          mean_anomaly: 0.9,
          body: {
            name: 'Gilly',
            mass: 1.2420363e17,
            radius: 13e3,
            color: '#bc7625'
          },
          orbits: []
        }
      ]
    },
    // kerbin
    {
      normal: [0,0,1],
      periapsis: [13599840256],
      ecc: 0,
      mean_anomaly: PI,
      body: {
        name: 'Kerbin',
        mass: 5.2915158e22,
        radius: 6e5,
        color: 'blue'
      },
      orbits: [
        {
          normal: [0,0,1],
          periapsis: [12e6],
          ecc: 0,
          mean_anomaly: 1.7,
          body: {
            name: 'Mun',
            mass: 9.7599066e20,
            radius: 2e5,
            color: 'grey'
          },
          orbits: []
        },
        {
          normal: [0,0,1],
          periapsis: [47e6],
          ecc: 0,
          mean_anomaly: 0.9,
          body: {
            name: 'Minmus',
            mass: 2.6457580e19,
            radius: 6e4,
            color: '#1de55d'
          },
          orbits: []
        }
      ]
    },
    // duna
    {
      normal: [0,0,1],
      periapsis: [19669121365],
      ecc: 0.051,
      mean_anomaly: PI,
      body: {
        name: 'Duna',
        mass: 4.5154270e21,
        radius: 32e4,
        color: '#9e070f'
      },
      orbits: [
        {
          normal: [0,0,1],
          periapsis: [3104e3],
          ecc: 0.03,
          mean_anomaly: PI,
          body: {
            name: 'Ike',
            mass: 	2.7821615e20,
            radius: 13e4,
            color: '#c6999b'
          },
          orbits: []
        }
      ]},
    // dres
    {
      normal: [0,0,1],
      periapsis: [34917642714],
      ecc: 0.145,
      mean_anomaly: PI,
      body: {
        name: 'Dres',
        mass: 3.2190937e20,
        radius: 138e3,
        color: '#808786'
      },
    },
    // jool
    {
      normal: [0,0,1],
      periapsis: [65334882253],
      ecc: 0.05,
      mean_anomaly: PI,
      body: {
        name: 'Jool',
        mass: 4.2332127e24,
        radius: 6e6,
        color: '#10b707'
      },
      orbits: [
        // laythe
        {
          normal: [0,0,1],
          periapsis: [27184e3],
          ecc: 0,
          mean_anomaly: PI,
          body: {
            name: 'Laythe',
            mass: 2.9397311e22,
            radius: 5e5,
            color: '#07b764'
          },
        },
        // vall
        {
          normal: [0,0,1],
          periapsis: [43152e3],
          ecc: 0,
          mean_anomaly: PI,
          body: {
            name: 'Vall',
            mass: 3.1087655e21,
            radius: 3e5,
            color: '#6cbbfc'
          },
        },
        // tylo
        {
          normal: [0,0,1],
          periapsis: [685e5],
          ecc: 0,
          mean_anomaly: PI,
          body: {
            name: 'Tylo',
            mass: 	4.2332127e22,
            radius: 6e5,
            color: '#a38066'
          },
        },
        // bop
        {
          normal: [0,0,1],
          periapsis: [98302500],
          ecc: 0.235,
          mean_anomaly: PI,
          body: {
            name: 'Bop',
            mass: 3.7261090e19,
            radius: 65e3,
            color: '#725139'
          },
        },
        // pol
        {
          normal: [0,0,1],
          periapsis: [149155794],
          ecc: 0.235,
          mean_anomaly: PI,
          body: {
            name: 'Pol',
            mass: 1.0813507e19,
            radius: 44e3,
            color: '#767a49'
          },
        },
      ]
    },
    // eeloo
    {
      normal: [0,0,1],
      periapsis: [66687926800],
      ecc: 0.26,
      mean_anomaly: PI,
      body: {
        name: 'Eeloo',
        mass: 1.1149224e21,
        radius: 21e4,
        color: '#ffbc99'
      },
    }
  ]
}
var real_scale_bodyframe = {
  body: {
    name: 'Sun',
    mass: 1.9885e30,
    radius: 6957e5,
    color: '#ffff1c'
  },
  orbits: [
    // mercury
    {
      normal: [0,0,1],
      periapsis: [460012e5],
      ecc: 0.205630,
      mean_anomaly: DEG * 174.796,
      // inclination: DEG * 3.38,
      // long_as_node: DEG * 48.331,
      // arg_of_praps: DEG * 29.124
      body: {
        name: 'Mercury',
        mass: 3.3011e23,
        radius: 2439.7e3,
        color: '#cece96'
      },
    },
    // venus
    {
      normal: [0,0,1],
      periapsis: [107477e6],
      // ecc: 0.006772,
      sma: 108208e6,
      mean_anomaly: DEG * 50.115,
      // inclination: DEG * 3.86,
      // long_as_node: DEG * 76.680,
      // arg_of_praps: DEG * 54.884,
      body: {
        name: 'Venus',
        mass: 4.8675e24,
        radius: 6051.8e3,
        color: '#e0823a'
      },
    },
    // earth
    {
      normal: [0,0,1],
      periapsis: [147095e6],
      sma: 149598023e3,
      // ecc: 0.0167086,
      mean_anomaly: DEG * 358.617,
      // inclination: DEG * 7.155,
      // long_as_node: DEG * -11.26064,
      // arg_of_praps: DEG * 114.20783,

      body: {
        name: 'Earth',
        mass: 5.97237e24,
        radius: 6371e3,
        color: '#39a8e0'
      },
      orbits: [
        {
          normal: [0,0,1],
          periapsis: [362600e3],
          sma: 384.399e6,
          // ecc: 0.0549,
          mean_anomaly: 0, // veries

          body: {
            name: 'Moon',
            mass: 7.342e22,
            radius: 1737.1e3,
            color: '#c5d3db'
          },
        }
      ]
    },
    // mars
    {
      normal: [0,0,1],
      periapsis: [2.067e11],
      sma: 2.279392e11,
      // ecc: 0.0934,
      mean_anomaly: DEG * 358.617,
      // inclination: DEG * 5.65,
      // long_as_node: DEG * 49.558,
      // arg_of_praps: DEG * 286.502,

      body: {
        name: 'Mars',
        mass: 6.4171e23,
        radius: 3389.5e3,
        color: '#ff603d'
      },
      orbits: [

        // phobos
        {
          normal: [0,0,1],
          periapsis: [9.23442e6],
          sma: 9.376e6,
          // ecc: 0.0151,
          mean_anomaly: DEG * 358.617,
          // inclination: DEG * 1.093 (mars equator),
          // long_as_node: null,
          // arg_of_praps:  null,

          body: {
            name: 'Phobos',
            mass: 1.0659e16,
            radius: 1.12667e4,
            color: '#ffc8bc'
          },
        },
        // deimos
        {
          normal: [0,0,1],
          periapsis: [2.34555e7],
          sma: 2.34632e7,
          // ecc: 0.00033,
          mean_anomaly: DEG * 358.617,
          // inclination: DEG * 0.93 (mars equator),
          // long_as_node: null,
          // arg_of_praps:  null,

          body: {
            name: 'Deimos',
            mass: 1.4762e15,
            radius: 6.2e3,
            color: '#ffc8bc'
          },
        }
      ]
    },
    // jupiter
    {
      normal: [0,0,1],
      periapsis: [7.4052e11],
      sma: 7.7857e11,
      // ecc: 0.0489,
      mean_anomaly: DEG * 20.020,
      // inclination: DEG * 6.09,
      // long_as_node: DEG * 100.464,
      // arg_of_praps: DEG * 273.867,

      body: {
        name: 'Jupiter',
        mass: 1.8982e27,
        radius: 6.9911e7,
        color: '#f76e38'
      },
      orbits: [
        {
          normal: [0,0,1],
          periapsis: [4.2e8],
          sma: 4.217e8,
          // ecc: 0.0041,
          mean_anomaly: 0,
          // inclination: DEG * 0.05 (jupiter equator),
          // long_as_node: null,
          // arg_of_praps: null,
          body: {
            name: 'Io',
            mass: 8.931938e22,
            radius: 1.8216e6,
            color: '#bca821'
          },
        }
      ]
    },
    // saturn
    {
      normal: [0,0,1],
      periapsis: [1.35255e12],
      sma: 1.43353e12,
      // ecc: 0.0565,
      mean_anomaly: DEG * 317.020,
      // inclination: DEG * 5.51,
      // long_as_node: DEG * 113.665,
      // arg_of_praps: DEG * 339.392,

      body: {
        name: 'Saturn',
        mass: 5.6834e26,
        radius: 6.0268e7,
        color: '#ffc038'
      },
      orbits: [

      ]
    },
    // uranus
    {
      normal: [0,0,1],
      periapsis: [2.742e12],
      sma: 2.87504e12,
      // ecc: 0.0565,
      mean_anomaly: DEG * 142.2386,
      // inclination: DEG * 6.48,
      // long_as_node: DEG * 74.006,
      // arg_of_praps: DEG * 96.998857,

      body: {
        name: 'Uranus',
        mass: 8.6810e25,
        radius: 2.5362e7,
        color: '#8fb4ef'
      },
      orbits: [

      ]
    },
    // neptune
    {
      normal: [0,0,1],
      periapsis: [4.46e12],
      sma: 4.50e12,
      // ecc: 0.009456,
      mean_anomaly: DEG * 256.228,
      // inclination: DEG * 6.43,
      // long_as_node: DEG * 131.784,
      // arg_of_praps: DEG * 276.336,

      body: {
        name: 'Neptune',
        mass: 1.02413e26,
        radius: 2.4622e7,
        color: '#1e417a'
      },
      orbits: [

      ]
    },
  ]
}
SUN = setup_bodyframe(kerbal_bodyframe)
SEL_BODY = SUN

SUN = sort_bodies(check_host(SUN))
TRAILS = []
set_super_position(SUN)

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  CNTR = PT.divs(USR_IO_DSPLY.wh,2)
  DT = USR_IO_EVNTS.dt * 1e-3
  if (isNaN(DT) || DT > 1) DT = 5e-3
  move_camera()
  DT *= TIME_SCALE
  set_super_position(SUN)
  draw_bodies(SUN)
  TRAILS.forEach(draw_trail)

  var soft_reps = DT / MAX_DT
  var hard_reps = Math.ceil(soft_reps)
  var soft_dt = DT / hard_reps

  check_host.count = 0
  for (var i = 0; i < hard_reps; ++i) {
    SUN = check_host(SUN)
    SUN = move_body(SUN, soft_dt)
  }
  TRAILS.push(leave_trail(SUN,DT))
  TRAILS.splice(0,TRAILS.length - MAX_TRAIL_LENGTH)

  G.fillStyle = 'white'
  G.fillText(hard_reps, 20, 20)
  G.fillText(check_host.count, 20, 40)

  draw_axis()
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
  speed: 1,
  zoom_speed: ZOOM_SPEED,
  _scale: 1,
  get scale() {
    var sqr = this._scale > 1 ? this._scale : 1 / (this._scale - 2)
    // sqr *= origin.radius
    return sqr * sqr * RADIUS_SCALE / SUN.radius
  },
  ax: [[1,0,0],[0,1,0],[0,0,1]],
  ax_c: ['red','blue','green'],
}
function center_camera() {
  CAMERA.normal = [1,0,0]
  CAMERA.position = [0,0,1]
  CAMERA.cross = PT.cross(CAMERA.position,CAMERA.normal)
}
center_camera()

DIRS = {
  a: [-1], d: [1],
  w: [0,1], s: [0,-1],
  q: [0,0,1], e: [0,0,-1]
}

function draw_axis() {
  var size = 50
  var half = size/2
  var wh = [USR_IO_DSPLY.w - size, 0]
  var cntr = PT.sum(wh,[half,half])

  PT.fillRect(G,wh,[size,size],'black')
  for (var i in CAMERA.ax) {
    var ax = CAMERA.ax[i]
    var c = CAMERA.ax_c[i]

    var dot = PT.dot(ax,CAMERA.position)
    var u = [PT.dot(CAMERA.cross,ax),PT.dot(CAMERA.normal,ax)]
    var p = PT.vec(cntr,u,half)
    PT.drawLine(G,p,cntr,c)
  }
}

function move_camera() {
  var dir = []

  if (USR_IO_MWS.isDn) {
    PT.vece(dir, PT.sub(USR_IO_MWS.prv, USR_IO_MWS), 1)
  }
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
    SEL_BODY = BODY_QUEUE.pop() || SUN
    CAMERA.origin = SEL_BODY
    BODY_QUEUE = BODY_QUEUE.concat(SEL_BODY.sub_bodies)

    flag = 1e3
  }

  if (USR_IO_KYS.hsDn['=']) {
    TRAIL_STYLE_IDX = (TRAIL_STYLE_IDX + 1) % TRAIL_STYLE_NAMES.length
    log('trail style',TRAIL_STYLE_IDX,TRAIL_STYLE_NAMES[TRAIL_STYLE_IDX])
  }

  if (USR_IO_KYS.hsDn['z']) center_camera()

  CAMERA.focus = super_position(CAMERA.origin)
}

var proj_point = p => {
  p = PT.sub(p,CAMERA.focus)
  // var dot = PT.dot(p,CAMERA.position)
  var u = [PT.dot(CAMERA.cross,p),PT.dot(CAMERA.normal,p)]
  return PT.vec(CNTR,u,CAMERA.scale)
}
var draw_circle = (p,r,c) => {
  PT.drawCircle(G,proj_point(p),r*CAMERA.scale,c)
}
function draw_bodies(body,host_proj) {
  if (body.host && body.distance * CAMERA.scale < MIN_RADIUS) {
    return
  }

  var sub_point = body.super_position
  var sub_proj = proj_point(sub_point)
  var r = body.radius * CAMERA.scale

  for (var i in body.sub_bodies) {
    var sub_body = body.sub_bodies[i]
    draw_bodies(sub_body, sub_proj)
  }
  if (isFinite(body.soi)) {
    PT.drawCircle(G, sub_proj, body.soi * CAMERA.scale, SOI_COLOR)
  }
  if (body.host) {
    PT.drawLine(G, sub_proj, host_proj, SOI_COLOR)
  }
  PT.fillCircle(G, sub_proj, r < MIN_RADIUS ? MIN_RADIUS : r, body.color)
}
function draw_trail(trail) {
  var sel_trail = get_trail(trail, SEL_BODY)
  var offset = []
  var tail_offset = []
  var offset = PT.sub(sel_trail.body.super_position, sel_trail.super_position)
  var tail_offset = PT.muls(sel_trail.super_velocity,sel_trail.dt)
  draw_trail_helper(trail, offset, tail_offset)
}
var flag = 1e3
function draw_trail_helper(trail, offset, tail_offset) {
  var scale_distance = trail.distance * CAMERA.scale
  if (isFinite(scale_distance) && scale_distance < MIN_RADIUS) return

  // var host_point = trail.host ? trail.host.super_position : []
  // var true_tail_offset = trail.host ? trail.host_trail.super_velocity : []
  // var point = PT.sum(trail.position, host_point)
  var true_tail_offset = tail_offset
  var point = trail.super_position
  point = PT.sum(point, offset)
  var tail = PT.vec(point,trail.super_velocity,trail.dt)
  var proj = proj_point(point)
  var tail = proj_point(PT.sub(tail, true_tail_offset))
  PT.drawLine(G,proj,tail,trail.color)

  for (var i in trail.sub_bodies) {
    var sub_trail = trail.sub_bodies[i]
    draw_trail_helper(sub_trail, offset, tail_offset)
  }
}
