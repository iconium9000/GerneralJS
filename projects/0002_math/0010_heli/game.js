log = console.log

PROJECT_NAME = 'Helicopter Game'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  case 'new_bar':
    if (CLNT_ID != SRVR_CLNT_ID) {
      // var floor_score = Math.floor(plr[3] * COLORS.length / SRVR_MAX_SCORE)
      // if (floor_score > COLORS.length) floor_score = COLORS.length
      // var color = COLORS[floor_score]
      // msg.push(color)

      BARS.push(msg)
    }
    break
  case 'player_update':
    if (sndr != CLNT_ID) {
      PLAYERS[sndr] = msg
    }
    break
  case 'get_score':
    // log('get_score',SRVR_MAX_SCORE)
    HOST_MSG('clnt_score',[sndr],[SRVR_WINNER,SRVR_MAX_SCORE])
    break
  case 'srvr_score':
    SRVR_WINNER = msg[0]
    SRVR_MAX_SCORE = msg[1]
    HOST_MSG('clnt_score',null,msg)
    // log('srvr_score',msg)
    break
  case 'clnt_score':
    SRVR_WINNER = msg[0]
    SRVR_MAX_SCORE = msg[1]
    // log('clnt_score',msg)
    break
  default:
    log(key, sndr, rcvr, msg)
  }
}

GAME_SRVR_INIT = () => {
  log('init game srvr')
  setInterval(() => {
    HOST_MSG('new_bar',null,[
      [11/10,Math.random()],
      [BAR_W_MIN+BAR_W*Math.random(),BAR_H_MIN+BAR_H*Math.random()]
    ])
  },1e3/BAR_FREQ)
}

GAME_CLNT_INIT = () => {
  log('init game clnt')
  START_TIME = USR_IO_EVNTS.nw
  setInterval(() => {
    if (!PAUSED) HOST_MSG('player_update',null,[HELI_Y,2,CLNT_NAME.slice(0,8),SCORE])
    for (var i in PLAYERS) if (PLAYERS[i][1]-- < 0) delete PLAYERS[i]
  },UPDATE_FREQ)
  HOST_MSG('get_score',[0])
}

COLORS = ['green','yellow','orange','red','blue','purple']

HELI_X = 1/60
HELI_Y = 1/2
HELI_W = 1/12
HELI_H = 1/20
HELI_V = 0

HELI_GRAVITY = 0.8 // h per sec per sec
HELI_LIFT = 2.5 * HELI_GRAVITY // h per sec per sec

PAUSED = true
TRAILS = false

BAR_FREQ = 4/1 // bar spawn per sec
BAR_SPEED  = 2/3 // w per sec
BAR_TIMER = 0
BARS = []
BAR_W_MIN = 1/30
BAR_H_MIN = 1/30
BAR_W = 1/8
BAR_H = 1/10

NAME_SCALE = 40
TIME_LINE_SCALE = 100

SCORE = 0
SPACE = true
SRVR_MAX_SCORE = 0
MAX_SCORE = 0
SRVR_WINNER = 'SRVR'
PREV_SRVR_SCORE = 0

START_TIME = 0
THRUST_TIME = 0

PLAYERS = []
UPDATE_FREQ = 40
TRAIL_WIDTH = 1

MUL = (a,b) => a*b

function draw_quad(g,a1,a2,b1,b2,c1,c2,c) {
  g.strokeStyle = c
  g.beginPath()
  g.moveTo(a1,a2)
  g.quadraticCurveTo(b1,b2,c1,c2)
  g.stroke()
}

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var dt = USR_IO_EVNTS.dt * 1e-3
  var w = wh[0]
  var h = wh[1]
  SPACE_HAS_DOWN = USR_IO_KYS.hsDn[' '] || USR_IO_MWS.hsDn
  SPACE_DOWN = USR_IO_KYS.isDn[' '] || USR_IO_MWS.isDn

  var score_hight = h/TIME_LINE_SCALE
  g.lineWidth = 6

  for (var i = 0; i < COLORS.length; ++i) {
    var x = i * w / COLORS.length
    var color = COLORS[i]
    PT.fillRect(g,[x,0],[w / COLORS.length,score_hight],color)
  }
  var score_line = SCORE * w / SRVR_MAX_SCORE
  PT.drawLine(g,[score_line,0],[score_line,score_hight*2],'white')

  var heli = [HELI_X*w,HELI_Y*h]
  var heli_box = [HELI_W*w,HELI_H*h]

  var heli = [HELI_X*w,HELI_Y*h]
  for (var i in PLAYERS) {
    var plr = PLAYERS[i]
    heli[1] = h * plr[0]
    var floor_score = Math.floor(plr[3] * COLORS.length / SRVR_MAX_SCORE)
    if (floor_score > COLORS.length) floor_score = COLORS.length
    COLOR = COLORS[floor_score]
    PT.drawRect(g,heli,heli_box,COLOR)

    g.fillStyle = COLOR
    g.font = `bold ${Math.floor(w/NAME_SCALE)}px arial,serif`
    g.fillText(plr[2],10,heli[1]+HELI_H*h*0.6)
  }
  heli[1] = h * HELI_Y
  PT.fillRect(g,heli,heli_box,PAUSED?'grey':'white')
  var acceleration = HELI_GRAVITY - (SPACE_DOWN ? HELI_LIFT : 0)

  // var timer = Math.floor(USR_IO_EVNTS.nw * 1e-3 * BAR_FREQ)
  // if (timer != BAR_TIMER) {
  //   BARS.push([
  //     [11/10,Math.random()],
  //     [BAR_W_MIN+BAR_W*Math.random(),BAR_H_MIN+BAR_H*Math.random()]
  //   ])
  //   BAR_TIMER = timer
  // }

  RESET = false
  var floor_score = Math.floor(SCORE * COLORS.length / SRVR_MAX_SCORE)
  if (floor_score > COLORS.length) floor_score = COLORS.length
  COLOR = COLORS[floor_score]

  for (var i in BARS) {
    var bar = BARS[i]
    if (bar[0][0] < -1/10) {
      if (!PAUSED) ++SCORE
      if (SCORE > MAX_SCORE) {
        MAX_SCORE = SCORE
        if (MAX_SCORE > SRVR_MAX_SCORE) {
          HOST_MSG('srvr_score',[0],[CLNT_NAME,MAX_SCORE])
        }
      }
      delete BARS[i]
    }
    else {
      bar[0][0] -= BAR_SPEED * dt

      var p = PT.mat(bar[0],wh,MUL)
      var v = PT.mat(bar[1],wh,MUL)
      if (!PAUSED && SCORE > SRVR_MAX_SCORE - 4) {
        PT.drawRect(g,p,v,'#808080')
      }
      else {
        PT.fillRect(g,p,v,PAUSED?'white':COLOR)
      }

      if (PT.hitbox(heli,heli_box,p,v)) RESET = true
    }
  }

  if (SPACE_HAS_DOWN) PAUSED = SPACE = false
  if (USR_IO_KYS.hsDn['?']) SPACE = !SPACE
  if (USR_IO_KYS.hsDn['p']) PAUSED = RESET = true
  if (USR_IO_KYS.hsDn['t']) TRAILS = !TRAILS
  if (USR_IO_KYS.hsDn['r']) RESET = true

  if (!PAUSED) {
    HELI_V += dt * acceleration
    HELI_Y += dt * HELI_V
  }

  if (HELI_Y < 0 || 1 < HELI_Y  || RESET) {
    HELI_Y = 1/2
    HELI_V = 0
    PAUSED = true
    SCORE = 0
    THRUST_TIME = 0
    START_TIME = USR_IO_EVNTS.nw
    // PREV_SRVR_SCORE = SRVR_MAX_SCORE
  }


  if (!PAUSED && SPACE_DOWN) THRUST_TIME += dt

  if (TRAILS) {
    g.lineWidth = TRAIL_WIDTH
    var v1 = BAR_SPEED
    var v2 = HELI_V
    var h2 = HELI_Y
    var g2 = HELI_GRAVITY
    // u = sqrt(v2^2 - 2g (h-1)) - v2 / g
    var u = (Math.sqrt(v2*v2 - 2*g2*(h2-1)) - v2) / g2
    // end = [v1 u, 1]
    var l1 = w * v1 * u
    var l2 = h * 1
    // mid = [v1 u / 2, 1 - (u (v2 + gu) / 2)]
    var m1 = w * v1 * u / 2
    var m2 = h * (1 - u * (v2 + g2 * u) / 2)

    var p1 = 0
    var p2 = h * h2

    var w1 = HELI_W * w
    var h1 = HELI_H * h
    var w2 = HELI_X * w

    p1 += w2; m1 += w2; l1 += w2
    draw_quad(g,p1,p2,m1,m2,l1,l2,'red')
    p1 += w1; m1 += w1; l1 += w1
    draw_quad(g,p1,p2,m1,m2,l1,l2,'red')
    p2 += h1; m2 += h1; l2 += h1
    draw_quad(g,p1,p2,m1,m2,l1,l2,'red')
    p1 -= w1; m1 -= w1; l1 -= w1
    draw_quad(g,p1,p2,m1,m2,l1,l2,'red')

    var v1 = BAR_SPEED
    var v2 = HELI_V
    var h2 = HELI_Y
    var g2 = HELI_GRAVITY - HELI_LIFT

    // u = -(v2 + sqrt(v2^2 - 2 g2 h2)) / g2
    var u = -(v2 + Math.sqrt(v2 * v2 - 2 * g2 * h2)) / g2
    // end = [v1 u, 0]
    var l1 = w * v1 * u
    var l2 = 0
    // mid = [u v1 / 2, h2 + u v2 / 2]
    var m1 = w * u * v1 / 2
    var m2 = h * (h2 + u * v2 / 2)

    p2 -= h1; m2 -= h1; l2 -= h1
    draw_quad(g,p1,p2,m1,m2,l1,l2,'blue')
    p1 += w1; m1 += w1; l1 += w1
    draw_quad(g,p1,p2,m1,m2,l1,l2,'blue')
    p2 += h1; m2 += h1; l2 += h1
    draw_quad(g,p1,p2,m1,m2,l1,l2,'blue')
    p1 -= w1; m1 -= w1; l1 -= w1
    draw_quad(g,p1,p2,m1,m2,l1,l2,'blue')
  }

  g.textAlign = 'right'
  g.fillStyle = 'white'
  g.font = 'bold 20px arial,serif'
  g.fillText(`Score ${SCORE}`,w-20,20)
  g.fillText(`Hight Score ${MAX_SCORE}`,w-20,40)
  g.fillText(`Server High Score ${SRVR_MAX_SCORE}`,w-20,60)
  g.fillText(`Champion ${SRVR_WINNER}`,w-20,80)

  var time = (USR_IO_EVNTS.nw - START_TIME) * 1e-3
  // g.fillText(`Thrust Time ${time/THRUST_TIME}`,20,110)

  if (SPACE) {
    g.font = 'bold 40px arial,serif'
    g.fillStyle = 'white'
    var offset = 140

    g.fillText("Press SPACE to boost",w-20,offset)
    g.fillText("Press P to pause",w-20,offset += 40)
    g.fillText("Press T for trails",w-20,offset += 40)
    g.fillText("Press R to restart",w-20,offset += 40)
    g.fillText("Press ? for Instructions",w-20,offset += 40)

    g.fillText("Press Space To Start",w-20,offset += 120)
  }



}
