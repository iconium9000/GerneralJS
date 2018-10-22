log = console.log

PROJECT_NAME = 'Battle Tanks'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false



GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  case 'loc_update':
    if (sndr != CLNT_ID) TANKS[sndr] = msg
    break
  case 'missle':
    MISSLES.push(msg)
    break
  case 'track_kill':
    ++TANK.kills
    break
  default:
  }
}

GAME_SRVR_INIT = () => {
  log('init game srvr')
}

GAME_CLNT_INIT = () => {
  log('init game clnt')

  TANK = {
    p: [Math.random() * GRID[0], Math.random() * GRID[1]],
    deaths: 0,
    kills: 0,
    a: 0,
    c: COLORS[Math.floor(Math.random()*COLORS.length)]
  }
  TANKS[-1] = TANK


  setInterval(() => {
    if (USR_IO_KYS.isDn[' '] || USR_IO_MWS.isDn) {
      HOST_MSG('missle',null,{
        sndr: CLNT_ID,
        p: PT.sum(TANK.p,PT.circle(TANK.a,MISSLE_AHEAD)),
        v: PT.circle(TANK.a,TANK_MISSLE_SPEED),
        t: MISSLE_TIME_OUT,
        c: TANK.c
      })
    }
    for (var i in MISSLES) {
      if (--MISSLES[i].t < 0) {
        delete MISSLES[i]
      }
    }
  },100)
  setInterval(() => {
    TANK.t = 3
    HOST_MSG('loc_update',null,TANK)
    for (var i in TANKS) {
      if (--TANKS[i].t < 0) {
        delete TANKS[i]
      }
    }
  },10)
}

COLORS = ['green','yellow','orange','red','magenta','lightblue','blue','purple']

GRID = [16,16]
TANK_RADIUS = 10
TANK_BARREL = 20
TANK_HIT_RADIUS = 0.7
MISSLE_RADIUS = 3
TANK_MISSLE_SPEED = 8
MISSLE_AHEAD = 0.7
MISSLE_TIME_OUT = 15
TURN_SPEED = 4 // rads per sec
MOVE_SPEED = 5 // pixels per sec
TANKS = []
MISSLES = []

PROJ_P = p => PROJ_P.f(TANK.p,p,GRID,SCALE_P,SCALE_WH,2)
PROJ_P.f = PT.vcc('vvvvv',(s,p,g,c,wh)=>{
  return p*wh/g+c
})
PROJ_MOD = p => PROJ_MOD.f(p,GRID,2)
PROJ_MOD.f = PT.vcc('vv',(p,g) =>(p+g)%g)

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var dt = USR_IO_EVNTS.dt * 1e-3
  var cntr = PT.divs(wh,2)
  g.lineWidth = 5

  SCALE_WH = []
  if (wh[1]/wh[0] > GRID[1]/GRID[0]) {
    SCALE_WH[0] = wh[0]
    SCALE_WH[1] = GRID[1]/GRID[0] * SCALE_WH[0]
    SCALE_P = [0,(wh[1] - SCALE_WH[1]) / 2]
  }
  else {
    SCALE_WH[1] = wh[1]
    SCALE_WH[0] = GRID[0]/GRID[1] * SCALE_WH[1]
    SCALE_P = [(wh[0] - SCALE_WH[0]) / 2,0]
  }
  PT.drawRect(g,SCALE_P,SCALE_WH,TANK.c)

  for (var i in TANKS) {
    var tank = TANKS[i]
    var tank_p = PROJ_P(tank.p)
    PT.fillCircle(g,tank_p,TANK_RADIUS,tank.c)
    var line = PT.sum(tank_p,PT.circle(tank.a,TANK_BARREL))
    PT.drawLine(g,tank_p,line,tank.c)
  }

  KILL = false
  for (var i in MISSLES) {
    var missle = MISSLES[i]
    PT.fillCircle(g,PROJ_P(missle.p),MISSLE_RADIUS,missle.c)
    PT.vece(missle.p,missle.v,dt)
    missle.p = PROJ_MOD(missle.p)

    if (PT.dist(missle.p,TANK.p) < TANK_HIT_RADIUS) KILL = missle.sndr
  }
  if (KILL) {
    TANK.score = 0
    ++TANK.deaths
    HOST_MSG('track_kill',[KILL])
    TANK.p = [Math.random() * GRID[0], Math.random() * GRID[1]]
  }

  if (USR_IO_KYS.isDn[' '] || USR_IO_MWS.isDn) {
    var tank_v = PT.circle(tank.a,MOVE_SPEED)
    PT.vece(TANK.p,tank_v,dt)
    TANK.p = PROJ_MOD(TANK.p)
  }
  else {
    TANK.a += TURN_SPEED * dt
  }
  if (USR_IO_KYS.hsUp[' '] || USR_IO_MWS.hsUp) TURN_SPEED = -TURN_SPEED

  g.fillStyle = TANK.c
  g.fillText(`deaths: ${TANK.deaths}`,20,20)
  g.fillText(`kills:  ${TANK.kills}`,20,40)
}
