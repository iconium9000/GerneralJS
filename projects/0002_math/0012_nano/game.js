log = console.log

//----------------------------------------------------------------
// PROJECT SETUP
//----------------------------------------------------------------
PROJECT_NAME = 'Nanosaur Project'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false

//----------------------------------------------------------------
// SRVR INIT
//----------------------------------------------------------------
GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  default:
    log(key, sndr, rcvr, msg)
  }
}

//----------------------------------------------------------------
// SRVR INIT
//----------------------------------------------------------------
GAME_SRVR_INIT = () => {
  log('init game srvr')
}

//----------------------------------------------------------------
// CLNT INIT
//----------------------------------------------------------------
GAME_CLNT_INIT = () => {
  log('init game clnt')
}

//----------------------------------------------------------------
// GAME SETUP
//----------------------------------------------------------------

PLANE = []
CAMERA = {
  p: [0,0,1],
  v: PT.unit([8,8,-1])
}
for (var i = 0; i < 10; ++i) {
  for (var j = 0; j < 10; ++j) {
    PLANE.push([i,j])
  }
}

//----------------------------------------------------------------
// TICK
//----------------------------------------------------------------
GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh

  var rectSqr = [1,1]
  for (var i in PLANE) {
    var p = PLANE[i]
    PT.fillRect(g,PT.sum([20,20],PT.muls(p,10)),rectSqr,'white')
  }
}
