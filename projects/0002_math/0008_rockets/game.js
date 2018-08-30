log = console.log

PROJECT_NAME = 'Rockets'
log('init game.js', PROJECT_NAME)

GAME_HIDE_CURSER = false
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

GRAV_CONSTANT = 6.67408e-11
EARTH_MASS = 5.97237e24
EARTH_GM = GRAV_CONSTANT * EARTH_MASS
EARTH_RAD = 6371e3
MOON_MASS = 7.342e22
MOON_GM = GRAV_CONSTANT * MOON_MASS
MOON_RAD = 1738.1e3
MOON_ORB = 384399e3
MOON_P = [MOON_ORB,0]
MOON_EOV = Math.sqrt(EARTH_GM/MOON_ORB)
MOON_V = [0, -MOON_EOV]
SCALE = 3e-5
REPS = 1e4
PROJ_T = 1e4
PROJ = 1e4

EARTH_ORB = EARTH_RAD + 250e3
EARTH_OV = Math.sqrt(EARTH_GM/EARTH_ORB)


ROCKET = {
  p: [EARTH_ORB, 0],
  v: [0, -EARTH_OV],
  r: 3
}
function gravity(p,v,u) {
  var l = PT.length(p)
  return PT.vec(v,p,u/l/l/l)
}

GAME_TICK = () => {
  g = USR_IO_DSPLY.g
  wh = USR_IO_DSPLY.wh
  dt = 1e2 * USR_IO_EVNTS.dt * 1e-3 / REPS
  var cntr = PT.divs(wh,2)
  drawCircle = (p,r) => PT.drawCircle(g,PT.vec(cntr,p,SCALE),r)


  // PHYSICS
  for (var i = 0; i < REPS; ++i) {
    ROCKET.v = gravity(ROCKET.p,ROCKET.v,-EARTH_GM*dt)
    ROCKET.p = PT.vec(ROCKET.p,ROCKET.v,dt)

    MOON_V = gravity(MOON_P,MOON_V,-EARTH_GM*dt)
    MOON_P = PT.vec(MOON_P,MOON_V,dt)
  }
  // PROJ
  {
    var step_v = PT.copy(ROCKET.v)
    var step_p = PT.copy(ROCKET.p)

    g.fillStyle = 'grey'
    for (var i = 0; i < PROJ; ++i) {
      step_v = gravity(step_p,step_v,-EARTH_GM*dt*PROJ_T)
      step_p = PT.vec(step_p,step_v,dt*PROJ_T)
      PT.fillSquare(g,PT.vec(cntr,step_p,SCALE),1)
    }
  }


  g.fillStyle = g.strokeStyle = 'white'
  drawCircle([],EARTH_RAD * SCALE)
  drawCircle(MOON_P,MOON_RAD * SCALE)
  drawCircle(ROCKET.p,ROCKET.r)
  g.fillText(1e-3*(PT.length(ROCKET.p)-EARTH_RAD),10,10)
  g.fillText(1e-3*PT.length(ROCKET.v),10,20)
}
