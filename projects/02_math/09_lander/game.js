log = console.log

PROJECT_NAME = 'Lander'
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

LAND = []

function set_land(wh) {
  LAND = []
  var w = wh[0]
  var h = wh[1]

  var r1 = 5
  var l1 = [0.16669256707324775, 0.8343992484317684, 0.3294855606932394,
      0.6029389664095395, 0.05306133955234005]//PT.matl(r1,Math.random)
  // log(l1)
  var lint1 = PT.matl(w,i=>{
    var li = i*r1/w
    var li1 = Math.floor(li)
    var li2 = li1 + 1

    var la = li - li1
    var v1 = l1[li1] * (1-la)
    var v2 = l1[li2] * (la)
    // return l1[li1]
    return v1 + v2
  })

  for (var i = 0; i < w; ++i) {
    var i1 = Math.floor(i*r1/w)
  }
  LAND = PT.muls(lint1,h)
}

GAME_CLNT_INIT = () => {
  log('init game clnt')
  set_land(USR_IO_DSPLY.wh)
}



GAME_TICK = () => {
  var wh = USR_IO_DSPLY.wh
  var g = USR_IO_DSPLY.g
  g.strokeStyle = 'white'
  if (LAND.length != wh[0]) set_land(wh)

  var p1 = [0,LAND[0]]
  for (var i = 1; i < LAND.length; ++i) {
    var p2 = [i,LAND[i]]
    PT.drawLine(g,p1,p2)
    p1 = p2
  }
}

// -----------------------------------------------------------------------------
// Ship
// -----------------------------------------------------------------------------
