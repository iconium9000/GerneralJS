log = console.log

PROJECT_NAME = 'Helicopter Game'
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

HELI_X = 0
HELI_Y = 1/2
HELI_W = 1/10
HELI_H = 1/20
HELI_V = 0

HELI_GRAVITY = 70/1e2 // h per sec per sec
HELI_LIFT = 2.5 * HELI_GRAVITY // h per sec per sec

PAUSED = false
TRAILS = false

BAR_FREQ = 4/1 // bar spawn per sec
BAR_SPEED  = 2/3 // w per sec
BAR_TIMER = 0
BARS = []
BAR_W_MIN = 1/30
BAR_H_MIN = 1/30
BAR_W = 1/8
BAR_H = 1/10

SCORE = 0
SPACE = true
// var cook = document.cookie
MAX_SCORE = 0//cook.length ? parseInt(cook.split('=')[1]) : 0

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

  var heli = [HELI_X*w,HELI_Y*h]
  var heli_box = [HELI_W*w,HELI_H*h]

  PT.fillRect(g,heli,heli_box,'white')
  var acceleration = HELI_GRAVITY - (USR_IO_KYS.isDn[' '] ? HELI_LIFT : 0)

  var timer = Math.floor(USR_IO_EVNTS.nw * 1e-3 * BAR_FREQ)
  if (!PAUSED && timer != BAR_TIMER) {
    BARS.push([
      [11/10,Math.random()],
      [BAR_W_MIN+BAR_W*Math.random(),BAR_H_MIN+BAR_H*Math.random()]
    ])
    BAR_TIMER = timer
  }

  RESET = false

  for (var i in BARS) {
    var bar = BARS[i]
    if (bar[0][0] < -1/10) {
      ++SCORE
      if (SCORE > MAX_SCORE) FU.setCookie('SCORE', MAX_SCORE = SCORE, 2)
      delete BARS[i]
    }
    else {
      if (!PAUSED) bar[0][0] -= BAR_SPEED * dt
      var p = PT.mat(bar[0],wh,MUL)
      var v = PT.mat(bar[1],wh,MUL)
      PT.fillRect(g,p,v,'white')

      if (PT.hitbox(heli,heli_box,p,v)) RESET = true
    }
  }

  if (USR_IO_KYS.hsDn[' ']) SPACE = false
  if (USR_IO_KYS.hsDn['?']) SPACE = !SPACE
  if (USR_IO_KYS.hsDn['p']) PAUSED = !PAUSED
  if (USR_IO_KYS.hsDn['t']) TRAILS = !TRAILS


  if (!PAUSED) {
    HELI_V += dt * acceleration
    HELI_Y += dt * HELI_V
  }

  if (HELI_Y < 0 || 1 < HELI_Y  || RESET) {
    HELI_Y = 1/2
    HELI_V = 0
    SCORE = 0
    BARS = []
  }


  if (TRAILS) {
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

  g.fillStyle = 'white'
  g.font = "bold 20px arial,serif"
  g.fillText(`${SCORE} / ${MAX_SCORE}`,20,20)

  if (SPACE) {
    g.fillStyle = 'white'
    g.fillText("Press SPACE to boost",20,45)
    g.fillText("Press P to pause",20,70)
    g.fillText("Press T for trails",20,95)
    g.fillText("Press ? for Instructions",20,120)
    g.fillText("iconium9000:3000",300,20)
  }

}
