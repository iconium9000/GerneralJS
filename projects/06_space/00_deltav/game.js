log = console.log

PROJECT_NAME = 'DeltaV'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

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

// PHYS
{
  TIME_SCALE = 24*60*60
  GRAV = 6.67408e-11
  MAX_DT = TIME_SCALE * 1e-4
  TRAILS = []
  MAX_TRAILS = 5e3
  SEL_BODY_IDX = 0

  EARTH = {
    position: [],
    mass: 5.97237e24,
    radius: 6371e3,
    color: '#0080ff',
    velocity: [],
    trail: [],
    trail_proj: [],
  }
  MOON = {
    position: [384399e3],
    radius: 1737.1e3,
    mass: 7.342e22,
    color: '#808080',
    velocity: [0,1e3],
    trail: [],
    trail_proj: [],
  }
  EARTH.velocity = PT.muls(MOON.velocity, -MOON.mass / EARTH.mass)
  SHIP = {
    position: [EARTH.radius + 1e8],
    radius: 9,
    mass: 60e3,
    color: '#00ff00',
    trail: [],
    trail_proj: [],
  }
  SHIP.velocity = [0,Math.sqrt(GRAV * EARTH.mass / PT.length(SHIP.position))]
  BODIES = [EARTH, MOON, SHIP]
  BODIES.forEach(b => {
    b.trail.push({
      position: b.position,
      velocity: b.velocity,
    })
  })
}

// PROJ
{
  MIN_RADIUS = 3

  SCALE = 1
  SCALE_HELPER = 1
  LOC = []
  SCALE_HELPER = 1
  SCALE_SPEED = 1e-1
  function get_scale() {
    var h = SCALE_HELPER
    var s = h > 1 ? h : 1 / (h - 2)
    return s * s
  }
  SCALE = get_scale()
  function update_scale() {
    if (USR_IO_MWS.hsWl) {
      var pre_scale = SCALE
      SCALE_HELPER += USR_IO_MWS.wlPt[1] * SCALE_SPEED
      SCALE = get_scale()

      PT.vece(LOC, PT.sub(USR_IO_MWS, CNTR), 1/pre_scale - 1/SCALE)
    }
    if (USR_IO_MWS.isDn) {
      PT.sume(LOC, PT.divs(PT.sub(USR_IO_MWS.prv, USR_IO_MWS),SCALE))
    }
  }

  function proj_position_helper2(pos, map_cntr, cntr, scale) {
    return (pos - map_cntr) * scale + cntr
  }
  proj_position_helper = PT.vcc('vvvs', proj_position_helper2, 2)
  function proj_position(pos) {
    return proj_position_helper(pos, LOC, CNTR, SCALE)
  }

  function fillCircle(position,radius,color) {
    var r = radius * SCALE
    r = r > MIN_RADIUS ? r : MIN_RADIUS

    PT.fillCircle(G, proj_position(position), r, color)
  }
}

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

function dorep(dt,f) {
  var soft_reps = dt / MAX_DT
  var hard_reps = Math.ceil(soft_reps)
  var soft_dt = dt / hard_reps

  FU.forlen(hard_reps, i => f(soft_dt))
}

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH,2)

  DT = USR_IO_EVNTS.dt * 1e-3
  if (isNaN(DT) || DT > 1) DT = 5e-3

  DT *= TIME_SCALE

  if (USR_IO_KYS.hsDn[']']) {
    SEL_BODY_IDX = (SEL_BODY_IDX+1) % BODIES.length
  }
  if (USR_IO_KYS.hsDn['[']) {
    SEL_BODY_IDX = (SEL_BODY_IDX+BODIES.length-1) % BODIES.length
  }

  fillCircle(EARTH.position, EARTH.radius, EARTH.color)
  // fillCircle(SHIP.position, SHIP.radius, SHIP.color)
  fillCircle(MOON.position, MOON.radius, MOON.color)


  update_scale()
  PT.fillText(G,SCALE,[20,20],'white')
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
