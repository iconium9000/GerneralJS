log = console.log

PROJECT_NAME = 'Battle Tanks'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false



GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  case 'loc_update':
    if (sndr != CLNT_ID) TANKS[sndr] = msg
    break
  case 'REBOOT':
    REBOOT = true
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
    name: CLNT_NAME,
    deaths: 0,
    kills: 0,
    a: 0,
    v: [],
    c: COLORS[Math.floor(Math.random()*COLORS.length)]
  }
  TANKS[-1] = TANK


  setInterval(() => {
    if (USR_IO_KYS.isDn[' '] || USR_IO_MWS.isDn) {
      HOST_MSG('missle',null,{
        sndr: CLNT_ID,
        p: PT.sum(TANK.p,PT.circle(TANK.a,MISSLE_AHEAD)),
        v: PT.sum(TANK.v,PT.circle(TANK.a,TANK_MISSLE_SPEED)),
        t: MISSLE_TIME_OUT,
        c: TANK.c
      })
      TANK.afk = AFK_TIMER
    }
    for (var i in MISSLES) {
      if (--MISSLES[i].t < 0) {
        delete MISSLES[i]
      }
    }
    --TANK.afk
  },125)
  setInterval(() => {
    TANK.t = TANK_TIME_OUT
    if (TANK.afk > 0) HOST_MSG('loc_update',null,TANK)
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
TIME_OUT_RADIUS = 10
AFK_TIMER = 20
TANK_TIME_OUT = 10
TURN_SPEED = 4 // rads per sec
MOVE_SPEED = 5 // pixels per sec
TANKS = []
MISSLES = []
REBOOT = false

PROJ_P = p => PROJ_P.f(TANK.p,p,GRID,SCALE_P,SCALE_WH,CNTR,2)
PROJ_P.f = PT.vcc('vvvvvv',(s,p,g,c,wh,r)=>{
  // p = (p + 2r)
  // p = p - s + g/2
  // p = (p + g) % g
  return p*wh/g+c
})
PROJ_MOD = p => PROJ_MOD.f(p,GRID,2)
PROJ_MOD.f = PT.vcc('vv',(p,g) =>(p+g)%g)

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var dt = USR_IO_EVNTS.dt * 1e-3
  var cntr = CNTR = PT.divs(wh,2)
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

  var scores = []
  for (var i in TANKS) {
    var tank = TANKS[i]
    var tank_p = PROJ_P(tank.p)
    scores.push(tank)
    PT[tank.afk > 0 ? 'fillCircle' : 'drawCircle'](g,tank_p,TANK_RADIUS,tank.c)
    var line = PT.sum(tank_p,PT.circle(tank.a,TANK_BARREL))
    PT.drawLine(g,tank_p,line,tank.c)
  }
  scores.sort((a,b)=>b.kills-a.kills)
  var offset = 0
  g.textAlign = 'right'
  g.font = `bold 30px arial,serif`
  for (var i in scores) {
    var tank = scores[i]
    g.fillStyle = tank.c
    g.fillText(`${tank.name}: ${tank.kills}`,wh[0]-20,offset+=40)
  }

  KILL = false
  for (var i in MISSLES) {
    var missle = MISSLES[i]
    PT.fillCircle(g,PROJ_P(missle.p),MISSLE_RADIUS,missle.c)
    PT.vece(missle.p,missle.v,dt)
    missle.p = PROJ_MOD(missle.p)

    var time_out = !(missle.sndr == CLNT_ID) //|| (MISSLE_TIME_OUT - missle.t > TIME_OUT_RADIUS)
    if (PT.dist(missle.p,TANK.p) < TANK_HIT_RADIUS && time_out) {
      KILL = missle.sndr
    }
  }
  if (TANK.afk > 0 && KILL) {
    TANK.score = 0
    ++TANK.deaths
    HOST_MSG('track_kill',[KILL])
    TANK.p = [Math.random() * GRID[0], Math.random() * GRID[1]]
    TANK.v = []
  }

  if (USR_IO_KYS.isDn[' '] || USR_IO_MWS.isDn) {
    var tank_v = PT.circle(TANK.a,MOVE_SPEED)
    // PT.vece(TANK.p,tank_v,dt)

    // var tank_a = PT.circle(TANK.a,MOVE_SPEED)
    // PT.vece(TANK.v,tank_a,-dt)
    PT.vece(TANK.p,TANK.v,dt)
    PT.vece(TANK.p,tank_v,dt)
    TANK.p = PROJ_MOD(TANK.p)

  }
  else {
    TANK.a += TURN_SPEED * dt
  }

  if (USR_IO_KYS.hsUp[' '] || USR_IO_MWS.hsUp) TURN_SPEED = -TURN_SPEED

  g.fillStyle = TANK.c
  g.textAlign = 'left'
  g.fillText(`deaths: ${TANK.deaths}`,20,20)
  g.fillText(`kills:  ${TANK.kills}`,20,50)

  if (REBOOT) {
    g.font = `bold 100px arial,serif`
    g.fillText('RELOAD PLS!',20,100)
  }
}
