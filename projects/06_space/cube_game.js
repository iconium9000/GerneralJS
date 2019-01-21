// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------
log = console.log
PI2 = 2*Math.PI

PROJECT_NAME = 'Space Game'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------

/** BODY
  @host               host body
  @bodies             array of sub bodies sorted by mass
  @position           location relitive to host (vector)
  @distance           distance to host (scaler)
  @velocity           velocity relitive to host (vector)
  @speed              speed relitive to host (scaler)
*/

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


function cam_proj(camera,point) {
  point = PT.sub(point,camera.position)
  point = PT.mats(camera.axis,point,PT.dot)

  if (point[2] > camera.depth) {
    point = PT.muls(point,camera.scale * point[2],2)
    point = PT.sum(point,camera.center)
    return point
  }
  else return null
}

var camera = {
  position: [2,0,0],
  depth: 0,
  scale: 20
}
function lookat(position) {
  var z_xyz = PT.unit(PT.muls(position,-1))
  var z_xz_len = PT.length(z_xyz,2)
  var y_out = z_xyz[2] > 0 ? -1 : 1
  var y_xz_len = Math.sqrt(1 - z_xz_len*z_xz_len)
  var y_xz = PT.muls(z_xyz, y_out * y_xz_len / z_xz_len, 2)
  var y_xyz = y_xz.concat(z_xz_len)
  var x_xyz = PT.cross(y_xyz,z_xyz)
  return [x_xyz, y_xyz, z_xyz]
}

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH,2)
  DT = USR_IO_EVNTS.dt * 1e-3
  LEN = PT.length(WH)


  if (USR_IO_MWS.isDn) {
    var mws_dif = PT.sub(USR_IO_MWS,USR_IO_MWS.prv,2)
    camera.position[1] -= mws_dif[0] * 0.01
    camera.position[2] += mws_dif[1] * 0.01
  }

  camera.axis = lookat(camera.position)
  camera.center = CNTR
  BOX.forEach(p => {
    var proj = cam_proj(camera,p)
    if (proj) {
      PT.fillCircle(G,proj,2,'white')
    }
  })

  G.fillText(camera.axis[0],20,20)
  G.fillText(camera.axis[1],20,40)
  G.fillText(camera.axis[2],20,60)
}

// -----------------------------------------------------------------------------
// SETUP
// -----------------------------------------------------------------------------

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
