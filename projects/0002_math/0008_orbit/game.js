log = console.log

PROJECT_NAME = 'Orbits'
GAME_HIDE_CURSER = false
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

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var dt = USR_IO_EVNTS.dt / 1e3

  if (USR_IO_KYS.hsDn['\\']) PLANETS = []
  if (USR_IO_KYS.hsDn['Enter']) set_ship()
  if (USR_IO_KYS.hsDn['Shift']) new_planet()

  for (var i in PLANETS) {
    var planet = PLANETS[i]
    PT.drawCircle(g,planet,planet.radius,planet.color)
  }

  if (SHIP) ship_calc()
  else trail_calc(USR_IO_MWS,SHIP_RADIUS,[],PROJ_TIME,dt)
}

// -----------------------------------------------------------------------------
// Ship
// -----------------------------------------------------------------------------

RCS_SPEED = 2
THRUST = 5
MAX_SPEED = 1e2
SHIP_RADIUS = 5
DIAL_RADIUS = 40
MAX_REPS = 1e4
SHIP = null

PROJ_TIME = 1e4
PROJ_DT = 0.1

PLANET_MASS = 2e3
PLANET_RADIUS = 10

function set_ship() {
  SHIP = {
    0: USR_IO_MWS[0],
    1: USR_IO_MWS[1],
    length: 2,

    radius: SHIP_RADIUS,
    color: 'white',
    rotation: 0,
    rotation_velocity: 0,
    acceleration: [],
    velocity: [],
    dry_mass: 10,
    wet_mass: 20,
    isp: 100,
  }
}

function trail_calc(point,r,v,time,dt) {
  var g = USR_IO_DSPLY.g

  g.fillStyle = 'white'
  var reps = time / dt
  if (reps > MAX_REPS) {
    reps = MAX_REPS
  }



  var p = PT.copy(point)
  var v = PT.copy(v)
  var a = []
  g.strokeStyle = 'white'
  for (var i = 0; i < reps; ++i) {
    a = []
    for (var j in PLANETS) {
      var planet = PLANETS[j]

      var sub = PT.sub(planet,p)
      var dist = PT.length(sub)
      if (dist < planet.radius+r) return
      PT.vece(a,sub,planet.mass/dist/dist/dist)
    }

    PT.vece(v,a,dt)
    var len = PT.length(v)

    if (isNaN(len)) v = []
    else if (len > MAX_SPEED) PT.mulse(v,MAX_SPEED/len)
    PT.vece(p,v,dt)

    if ( i%10 == 0 ) {
      PT.drawLine(g,p,point)
      point = PT.copy(p)
    }

    // g.fillText(`${p[0]},${p[1]}`,20,80)
  }
}

function ship_calc() {
  var g = USR_IO_DSPLY.g
  var dt = USR_IO_EVNTS.dt / 1e3
  var wh = USR_IO_DSPLY.wh

  g.fillStyle = 'white'
  g.fillText(`velocity: ${PT.length(SHIP.velocity)}`,20,20)
  g.fillText(`acceleration: ${PT.length(SHIP.acceleration)}`,20,40)
  g.fillText(`rotation_velocity: ${SHIP.rotation_velocity}`,20,60)

  if (USR_IO_KYS.isDn['a']) SHIP.rotation_velocity -= RCS_SPEED * dt
  if (USR_IO_KYS.isDn['d']) SHIP.rotation_velocity += RCS_SPEED * dt
  if (USR_IO_KYS.isDn['t'] && SHIP.rotation_velocity) {
    var dv = RCS_SPEED * (SHIP.rotation_velocity<0?dt:-dt)
    if ((SHIP.rotation_velocity+dv>0)!=(SHIP.rotation_velocity>0))
      SHIP.rotation_velocity = 0
    else SHIP.rotation_velocity += dv
  }
  SHIP.rotation += SHIP.rotation_velocity * dt

  SHIP.acceleration = []
  for (var i in PLANETS) {
    var planet = PLANETS[i]

    var sub = PT.sub(planet,SHIP)
    var dist = PT.length(sub)
    if (dist < planet.radius+SHIP.radius) return SHIP = null
    PT.vece(SHIP.acceleration,sub,planet.mass/dist/dist/dist)
  }
  if (USR_IO_KYS.isDn['w'])
    PT.sume(SHIP.acceleration,PT.circle(SHIP.rotation,THRUST * dt))
  if (USR_IO_KYS.isDn['s'])
    PT.sube(SHIP.acceleration,PT.circle(SHIP.rotation,THRUST * dt))

  PT.vece(SHIP.velocity,SHIP.acceleration,dt)
  var len = PT.length(SHIP.velocity)
  if (isNaN(len)) SHIP.velocity = []
  else if (len > MAX_SPEED) PT.mulse(SHIP.velocity,MAX_SPEED/len)

  PT.vece(SHIP,SHIP.velocity,dt)
  PT.drawCircle(g,SHIP,SHIP.radius,SHIP.color)

  var dial_point = [wh[0]/2,wh[1]-DIAL_RADIUS]
  PT.drawCircle(g,dial_point,DIAL_RADIUS,'white')

  var len = PT.length(SHIP.velocity)
  if (len) {
    var point = PT.vec(dial_point,SHIP.velocity,DIAL_RADIUS/len)
    PT.fillCircle(g,point,5,'green')
  }

  var len = PT.length(SHIP.acceleration)
  if (len) {
    var point = PT.vec(dial_point,SHIP.acceleration,DIAL_RADIUS/len)
    PT.fillCircle(g,point,5,'purple')
  }

  var point = PT.sum(dial_point,PT.circle(SHIP.rotation,DIAL_RADIUS))
  PT.fillCircle(g,point,5,'white')

  trail_calc(SHIP,SHIP.radius,SHIP.velocity,PROJ_TIME,dt)
}

// -----------------------------------------------------------------------------
// Planets
// -----------------------------------------------------------------------------

PLANETS = []

function new_planet() {
  var radius = parseFloat(prompt('Radius?',PLANET_RADIUS))
  if ( !(radius > 0) ) return

  var mass = parseFloat(prompt('Mass?',PLANET_MASS))
  if ( !(mass > 0) ) return

  PLANETS.push({
    0: USR_IO_MWS[0],
    1: USR_IO_MWS[1],
    length: 2,

    radius: radius,
    mass: mass,
    color: 'red'
  })
}
