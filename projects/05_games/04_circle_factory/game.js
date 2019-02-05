log = console.log

PROJECT_NAME = 'Circle Factory'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false

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
  std_grav,     // standard gravitational parameter
  normal,       // unit vector in any direction
  periapsis,    // vector defining the periapsis
                // note: redefined to be orthogonal to normal (by subtraction)
  ecc,          // orbital eccentricity
  angle,        // angle about the normal from the periapsis
}) {
  std_grav = Math.abs(std_grav)
  ecc = Math.abs(ecc)
  periapsis = PT.vec(periapsis,normal,-PT.dot(normal,periapsis))

  var cos = Math.cos(angle), sin = Math.sin(angle)
  cross = PT.cross(periapsis,normal)
  var position = PT.circle(angle, (1 + ecc) / (1 + ecc * cos))
  var plen3_1_ecc = Math.pow(PT.length(periapsis),3) * (1 + ecc)
  var velocity = PT.mats([-sin, ecc + cos], Math.sqrt(std_grav / plen3_1_ecc))

  var plane = [periapsis,cross]
  return {
    position: PT.vecx(plane,position),   // position relative to host body
    velocity: PT.vecx(plane,velocity)    // velocity relative to hsot body
  }
}

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  CNTR = PT.divs(USR_IO_DSPLY.wh,2)
  DT = USR_IO_EVNTS.dt * 1e-3
  if (isNaN(DT) || DT > 1) DT = 5e-3
  move_camera()


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
  origin: [],
  normal: [1,0,0], // y
  position: [0,0,1], // z
  speed: 1,
  _scale: 2e1,
  get scale() { return this._scale * this._scale },
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
}

var draw_circle = (p,r,c) => {
  p = PT.sub(p,CAMERA.origin)
  var dot = PT.dot(p,CAMERA.position)
  var u = [PT.dot(CAMERA.cross,p),PT.dot(CAMERA.normal,p)]
  var v = PT.vec(CNTR,u,CAMERA.scale)
  PT.drawCircle(G,v,r*CAMERA.scale,c)
}
