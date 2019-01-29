// asdf


log = console.log

PROJECT_NAME = 'Orbit Project'
log('init game.js', PROJECT_NAME)

GAME_HIDE_CURSER = true

// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')
}

GAME_CLNT_INIT = () => {
  log('init game clnt')

  GRAVITY = 1
  BODIES = []



  BOX = []
  var shift = []
  for (var i = 0; i < 2; ++i){
    for (var j = 0; j < 2; ++j)
      for (var k = 0; k < 2; ++k)
        BOX.push(PT.vec(shift,[-i,-j,-k],2))
  }
  var reps = 10
  var tick = Math.PI / reps
  for (var i = 0; i < reps; ++i) {
    var theta = reps * tick
  }

  var reps = 50
  for (var i = 0; i < reps; ++i) {
    var theta = i * PI2 / reps

    var a = 2
    var e = 0.5
    var p = [Math.cos(theta), 0, Math.sin(theta)]
    var r = a * (1 - e*e) / (1 - e * Math.cos(theta))
    BOX.push(PT.muls(p,r))

    BOX.push(PT.muls(p,10))
  }

}

// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------

/**
  @REFERENCE
    @normal
    @direction
    @perpendicular

  @BODY                 body object
    @host               null if largest object
    @static
      @mass [A,BC]
      @radius [AB]
      @volume [AB]
      @density [AC]
      @stg [A]            standard gravitational parameter
    @orbit
      @sma [AB]           semi-major axis
      @ecc [C]            eccentricity
      @periapsis [AC]
      @apoapsis  [BC]
      @lan [D]               longitude of the ascending node
      @inclination [E]
      @true_anomaly [F]
      @normal [DE]          orbital plane normal
      @direction [DE]       direction of the periapsis
    @true
      @position         position relative to reference
      @velocity         velocity relative to reference
    @relative
      @position         position relative to host
      @velocity         velocity relative to host
*/

REFERENCE = {
  normal: [0,1,0],
  direction: [1,0,0],
  perpendicular: [0,0,1]
}
GRAVITY = 1
BODIES = []

VOL_CONST = PI2 * 2 / 3
STATIC = ['mass','radius','density','volume','stg']
STATIC.possibilities = [
  b => {
    // body.density =
  },

]
ORBIT = ['sma','ecc','periapsis','apoapsis','lan','true_anomaly','inclination']

log(new_body({
  static: {
    // mass: 5,
    radius: 3,
    stg: 3
  }
}))

function new_body(body) {

  if (body.static) {
    var ian = {}
    STATIC.forEach((t,i)=>ian[t] = !isNaN(body.static[t]))

    if (ian.radius) {
      body.volume = VOL_CONST * Math.pow(body.radius, 3)
      ian.volume = false
    }
    else if (ian.volume) {
      body.radius = Math.pow(body.volume / VOL_CONST, 1/3)
      ian.radius = true
    }

    if (ian.mass) {
      body.stg = body.mass * GRAVITY
      ian.stg = true
    }
    else if (ian.stg) {
      body.mass = body.stg / GRAVITY
      ian.mass = true
    }
    else if (ian.volume && ian.density) {
      body.mass = ian.volume * ian.density
      body.stg = body.mass * GRAVITY
      ian.mass = ian.stg = true
    }
    else throw `mass not solvable`

    if (ian.density) {
      body.volume = body.mass / body.density
      body.radius = Math.pow(body.volume / VOL_CONST, 1/3)
      ian.volume = ian.volume = true
    }
    else if (ian.volume) {
      // ian.density = ian.
    }


  }
  else throw `no static`

  return 0

  if (body.host) {
    var h = body.host.true
    if (body.relative) {
      body.true.position = PT.sum(body.relative.position,h.position)
      body.true.velocity = PT.sum(body.relative.velocity,h.velocity)
    }
    else if (body.true) {
      body.relative.position = PT.sub(body.true.position,h.position)
      body.relative.velocity = PT.sub(body.true.velocity,h.velocity)
    }
    else if (body.orbit) {
      var o = body.orbit
      var ian = {}
      ORBIT.forEach(t=>ian[t] = isNaN(body.orbit[t]))


    }
    else throw `no relative, true, or orbit`
  }
}

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {

  // ---------------------------------------------------------------------------

  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH,2)
  DT = USR_IO_EVNTS.dt * 1e-3
  LEN = PT.length(WH)
  camera.center = CNTR
  G.fillStyle = 'white'
  view_manip()

  // ---------------------------------------------------------------------------


  BOX.forEach(p => {
    var proj = cam_proj(camera,p)
    PT.fillCircle(G,proj,2,'white')
  })
  var proj = cam_proj(camera,camera.focus)
  PT.fillCircle(G,proj,2,'white')
  PT.fillCircle(G,USR_IO_MWS,5,'white')
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

function view_manip() {
  var mws_dif = PT.sub(USR_IO_MWS,USR_IO_MWS.prv,2)
  if (USR_IO_MWS.isDn) {
    var dif = camera.drag / camera.scale
    var rot = PT.vecx(camera.axis,mws_dif)
    PT.vece(camera.offset,rot,dif)
    camera.offset = PT.unit(camera.offset)
    camera.axis = lookat(camera.normal,camera.offset)
    camera.center = CNTR
  }
  if (USR_IO_MWS.isRt) {
    var dif = -camera.scale
    PT.vece(camera.focus,camera.axis[0],mws_dif[0] / dif)
    PT.vece(camera.focus,camera.axis[1],mws_dif[1] / dif)
  }
  if (USR_IO_KYS.hsDn['z']) {
    camera.focus = []
  }
  if (USR_IO_MWS.hsWl) {
    camera.scale -= USR_IO_MWS.wlPt[1] / camera.wheel
    if (camera.scale < camera.min_scale) camera.scale = camera.min_scale
    if (camera.scale > camera.max_scale) camera.scale = camera.max_scale
  }
}

// var drag =
var camera = {
  normal: PT.unit([0,1,0]),
  focus: [],
  offset: [2,1,3],
  depth: 0,
  scale: 60,
  min_scale: 1,
  max_scale: Infinity,
  drag: 1e-1,
  wheel: 1e1,
}
// camera.offset = PT.sphere_to_cart(camera.rotation)
camera.axis = lookat(camera.normal,camera.offset)

function cam_proj(camera,point) {
  point = PT.sub(point,PT.sum(camera.focus,camera.offset))
  point = PT.mats(camera.axis,point,PT.dot)
  point = PT.muls(point,camera.scale,2)
  point = PT.sum(point,camera.center)
  return point
}

/**
  @normal     unit vector pointed 'up'
  @vector     non-zero vector pointed away from the direction of viewport
*/

function lookat(normal,vector) {
  var len = PT.length(vector)
  var z_xyz = PT.divs(vector,-len)
  var z_y_len = PT.dot(z_xyz,normal)
  var y_y_len = Math.sqrt(1 - z_y_len * z_y_len)
  var y_y = PT.muls(normal,y_y_len)

  var z_y = PT.muls(normal,z_y_len)
  var z_xz = PT.sub(z_xyz,z_y)
  var z_xz_len = PT.length(z_xz) * (z_y_len > 0 ? -1 : 1)
  var y_xz_len = Math.sqrt(1 - z_xz_len * z_xz_len)

  var y_xz = PT.muls(z_xz, y_xz_len / z_xz_len)
  var y_xyz = PT.sum(y_xz,y_y)

  var x_xyz = PT.cross(y_xyz,z_xyz)

  var ret = [x_xyz,y_xyz,z_xyz]
  ret.print = [y_y_len]
  return ret
}
