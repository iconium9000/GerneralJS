log = console.log
err = console.error

//----------------------------------------------------------------
// GAME SETUP
//----------------------------------------------------------------

PROJECT_NAME = 'Blockade'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false
IS_MOBILE = false

COLORS = ['green','yellow','orange','red','magenta','lightblue','blue','purple']

HOLD = false

HELI_X = 1/60
HELI_Y = 1/2
HELI_W = 1/12
HELI_H = 1/20
HELI_V = 0

if (IS_MOBILE) HELI_GRAVITY = 0.7
else HELI_GRAVITY = 0.8  // h per sec per sec (easy 1.1)
HELI_LIFT = 2.5 * HELI_GRAVITY // h per sec per sec

ON_SRVR_KILL = save_game

SCORE_BOARD = []

SHOW_STATS = true

PAUSED = true
TRAILS = false

LINE_WIDTH = 6
BAR_START = 1 + 0.1
BAR_FREQ = 4/1      // bar spawn per sec
MAX_BAR_FREQ = 7/1
BAR_SPEED  = 2/3    // w per sec
BAR_TIMER = 0
BARS = []
BAR_W_MIN = 1/30
BAR_H_MIN = 1/30
BAR_W = 1/8
BAR_H = 1/10
DEATHS = {}
ALL_SCORE = 0
MY_DEATHS = 1

NAME_SCALE = 40
TIME_LINE_SCALE = 100
DEATH_LINE_SCALE = 200

BAR_QUEUE = []
MAX_BAR_QUEUE = 20
BAR_SCORE = 0
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

MSGS = []

MUL = (a,b) => a*b

//----------------------------------------------------------------
// FUNCTIONS
//----------------------------------------------------------------

function new_bar() {
  var w = BAR_W_MIN + BAR_W * Math.random()
  var h = BAR_H_MIN + BAR_H * Math.random()
  HOST_MSG('new_bar',null,[[BAR_START, Math.random() * (1 - h)], [w,h]])
}

function save_game() {
  var data = [SCORE_BOARD,DEATHS]
  SRVR_WRITE_FILE('save_file.json',data)
}

function draw_quad(g,a1,a2,b1,b2,c1,c2,c) {
  g.strokeStyle = c
  g.beginPath()
  g.moveTo(a1,a2)
  g.quadraticCurveTo(b1,b2,c1,c2)
  g.stroke()
}

//----------------------------------------------------------------
// GAME MSG
//----------------------------------------------------------------

function do_fun(snd,msg) {
  if (sndr == SRVR_CLNT_ID) {
    try {
      eval(msg)
    }
    catch (e) {
      err(e)
    }
  }
}
function do_refresh() {
  location && location.reload()
}
function rcv_msg(msg) {
  MSGS.push(msg)
  log(msg)
  if (MSGS.length > 5) MSGS = MSGS.slice(1,6)
}
function rcv_new_bar(msg) {
  if (CLNT_ID != SRVR_CLNT_ID && BAR_QUEUE < MAX_BAR_QUEUE) BAR_QUEUE.push(msg)
}
function rcv_player_update(sndr,msg) {
  // log('rcv_player_update')
  if (sndr != CLNT_ID) {
    PLAYERS[sndr] = msg
  }

  var name = msg[2]
  var score = msg[3]
  var all_score = msg[4]
  var deaths = msg[5]
  var max_score = msg[6]
  // log('max_score',max_score)

  if (max_score > SRVR_MAX_SCORE) {
    SRVR_MAX_SCORE = max_score
  }

  var flag = true
  for (var i in SCORE_BOARD) {
    var score_board = SCORE_BOARD[i]
    if (score_board.name == name) {
      score_board.score = score
      score_board.deaths = deaths
      score_board.all_score = all_score
      score_board.max_score = max_score
      flag = false
      break
    }
  }
  if (flag) {
    SCORE_BOARD.push({
      name: name, score: score, deaths: deaths,
      all_score: all_score, max_score: max_score,
    })
  }
  SCORE_BOARD.sort((a,b)=>a.max_score-b.max_score)
  if (SCORE_BOARD.length) {
    var score_board = SCORE_BOARD[SCORE_BOARD.length-1]
    SRVR_WINNER = score_board.name
    SRVR_MAX_SCORE = score_board.max_score
  }
}
function send_game_state(sndr) {
  var data = [SCORE_BOARD,DEATHS]
  HOST_MSG('send_game_state',[sndr],data)
}
function rcv_game_state(msg) {
  SCORE_BOARD = msg[0]
  DEATHS = msg[1]

  for (var i in SCORE_BOARD) {
    var score_board = SCORE_BOARD[i]

    if (score_board.name == CLNT_NAME) {
      MAX_SCORE = score_board.max_score
      MY_DEATHS = score_board.deaths
      ALL_SCORE = score_board.all_score
      SCORE = 0
      break
    }
  }

  SCORE_BOARD.sort((a,b)=>a.max_score-b.max_score)
  if (SCORE_BOARD.length) {
    var score_board = SCORE_BOARD[SCORE_BOARD.length-1]
    SRVR_WINNER = score_board.name
    SRVR_MAX_SCORE = score_board.max_score
  }
  else {
    SRVR_WINNER = 'SRVR'
    SRVR_MAX_SCORE = 10
  }
}
function on_death(msg) {
  var name = msg[0]
  var score = msg[1]
  if (score > 1000) score = 1000
  if (score < 0) score = 0
  if (isNaN(score)) return
  if (DEATHS[score]) ++DEATHS[score]
  else DEATHS[score] = 1
  if (SRVR_CLNT_ID == CLNT_ID) save_game()
  log(`${name} died at ${score}`)
}

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  case 'fun': return do_fun(sndr,msg)
  case 'refresh': return do_refresh()
  case 'msg': return rcv_msg(msg)
  case 'new_bar': return rcv_new_bar(msg)
  case 'player_update': return rcv_player_update(sndr,msg)
  case 'rqst_game_state': return send_game_state(sndr)
  case 'death': return on_death(msg)
  case 'send_game_state': return rcv_game_state(msg)
  case 'new_high_score': return rcv_new_high_score(msg)
  default: return log(key, sndr, rcvr, msg)
  }
}

//----------------------------------------------------------------
// GAME_SRVR_INIT
//----------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')
  var save = []
  try {
    save = SRVR_READ_FILE('save_file.json')
  }
  catch (e) {}

  rcv_game_state(save)

  setInterval(save_game,1e5)
  setInterval(new_bar,1e3/BAR_FREQ)
}

//----------------------------------------------------------------
// GAME_CLNT_INIT
//----------------------------------------------------------------

GAME_CLNT_INIT = () => {
  log('init game clnt')
  START_TIME = USR_IO_EVNTS.nw
  BAR_TIMER = START_TIME * 1e-3 + 1/MAX_BAR_FREQ
  setInterval(() => {
    // log('player_update')
    if (!PAUSED) HOST_MSG('player_update',null,
      [
        HELI_Y,               // 0
        2,                    // 1
        CLNT_NAME.slice(0,8), // 2
        SCORE,                // 3
        ALL_SCORE,            // 4
        MY_DEATHS,            // 5
        MAX_SCORE             // 6
      ])
    for (var i in PLAYERS) if (PLAYERS[i][1]-- < 0) delete PLAYERS[i]
  },UPDATE_FREQ)
  HOST_MSG('rqst_game_state',[0])
  IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

//----------------------------------------------------------------
// GAME_TICK
//----------------------------------------------------------------

function get_bar() {
  var now = USR_IO_EVNTS.nw *1e-3

  if (now > BAR_TIMER && BAR_QUEUE.length > 0 && !HOLD) {
    var bar = BAR_QUEUE[0]
    BAR_QUEUE = BAR_QUEUE.slice(1)
    bar.score = ++BAR_SCORE / SRVR_MAX_SCORE
    BARS.push(bar)
    BAR_TIMER = now + 1/MAX_BAR_FREQ
  }
}

function get_color(score) {
  var floor_score = Math.floor(score * COLORS.length)
  if (floor_score >= COLORS.length) return 'white'
  return COLORS[floor_score]
}

function show_stats() {
  var g = USR_IO_DSPLY.g
  var w = USR_IO_DSPLY.wh[0]
  var h = USR_IO_DSPLY.wh[1]

  var deaths = []
  for (var i = 0; i < TEMP_MAX_SCORE; ++i) {
    var j = Math.floor(i / TEMP_MAX_SCORE * w / LINE_WIDTH)
    var d =  DEATHS[i]
    if (!d) continue
    if (deaths[j]) deaths[j] += d
    else deaths[j] = d
  }

  var len = Math.floor(w/LINE_WIDTH)
  var death_hight = h/DEATH_LINE_SCALE
  var offset = 0
  for (var i = offset; i < len; ++i) {
    var d = deaths[i]
    if (!d) continue
    var j = (i-offset) / (len-offset)//(i-1) / (deaths.length-1)
    var c = Math.floor(j * COLORS.length)
    var x = j * w
    PT.drawLine(g,[x,h],[x,h-d*death_hight],COLORS[c])
  }
}

function draw_black_frost() {
  PT.fillRect(USR_IO_DSPLY.g,[],USR_IO_DSPLY.wh,'#000000a0')
}

function draw_player() {
  HELI[1] = USR_IO_DSPLY.wh[1] * HELI_Y
  var color = BAR_QUEUE.length>2?'red':PAUSED?'grey':'white'
  PT.fillRect(USR_IO_DSPLY.g,HELI,HELI_BOX,color)
}

function draw_players() {
  var g = USR_IO_DSPLY.g
  var w = USR_IO_DSPLY.wh[0]
  var h = USR_IO_DSPLY.wh[1]

  for (var i in PLAYERS) {
    var plr = PLAYERS[i]
    HELI[1] = h * plr[0]
    var color = get_color(plr[3] / TEMP_MAX_SCORE)
    PT.drawRect(g,HELI,HELI_BOX,color)

    g.fillStyle = color
    g.font = `bold ${Math.floor(w/NAME_SCALE)}px arial,serif`
    g.fillText(plr[2],10,HELI[1]+HELI_H*h*0.6)
  }
}

function draw_status_bar() {
  var g = USR_IO_DSPLY.g
  var w = USR_IO_DSPLY.wh[0]
  var h = USR_IO_DSPLY.wh[1]

  for (var i = 0; i < COLORS.length; ++i) {
    var x = i * w / COLORS.length
    var color = COLORS[i]
    PT.fillRect(g,[x,0],[w / COLORS.length,SCORE_HIGHT],color)
  }
  var score_line = SCORE * w / TEMP_MAX_SCORE
  PT.drawLine(g,[score_line,0],[score_line,SCORE_HIGHT*2],'white')
}

function draw_bars() {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var dt = USR_IO_EVNTS.dt * 1e-3
  var w = wh[0]
  var h = wh[1]

  for (var i in BARS) {
    var bar = BARS[i]
    if (bar[0][0] < -bar[1][0]) {
      if (!PAUSED) {
        ++SCORE
        ++ALL_SCORE
      }
      if (SCORE > MAX_SCORE) {
        MAX_SCORE = SCORE
      }
      delete BARS[i]
    }
    else {
      bar[0][0] -= BAR_SPEED * dt

      bar.p = PT.mat(bar[0],wh,MUL)
      bar.v = PT.mat(bar[1],wh,MUL)

      if (PAUSED) {
        PT.fillRect(g,bar.p,bar.v,'white')
      }
      else if (bar.score > 1) {
        PT.drawRect(g,bar.p,bar.v,'#808080')
      }
      else {
        PT.fillRect(g,bar.p,bar.v,get_color(bar.score))
      }
    }
  }
}

function move_player() {
  var dt = USR_IO_EVNTS.dt * 1e-3

  var acceleration = HELI_GRAVITY - (SPACE_DOWN ? HELI_LIFT : 0)
  HELI_V += dt * acceleration
  HELI_Y += dt * HELI_V
}

function check_hitbox() {
  for (var i in BARS) {
    var bar = BARS[i]
    if (PT.hitbox(HELI,HELI_BOX,bar.p,bar.v)) {
      return true
    }
  }
}

function detect_death() {
  if (HELI_Y < 0 || 1 < HELI_Y + HELI_H  || check_keys() || check_hitbox()) {
    HELI_Y = 1/2
    HELI_V = 0
    PAUSED = true
    if (SCORE > 0) {
      HOST_MSG('death',null,[CLNT_NAME,SCORE])
      ++MY_DEATHS
      SCORE = 0
    }
    BAR_SCORE = 0
    THRUST_TIME = 0
    START_TIME = USR_IO_EVNTS.nw
  }
}

function draw_trails() {
  var g = USR_IO_DSPLY.g
  var w = USR_IO_DSPLY.wh[0]
  var h = USR_IO_DSPLY.wh[1]

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

function draw_info() {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var dt = USR_IO_EVNTS.dt * 1e-3
  var w = wh[0]
  var h = wh[1]

  g.textAlign = 'right'
  g.fillStyle = 'white'
  g.font = 'bold 20px arial,serif'
  var offset = 0
  g.fillText(`Score ${SCORE}`,w-20,offset+=20)
  // g.fillText(`Average Score ${Math.round(ALL_SCORE/MY_DEATHS)}`,w-20,offset+=20)
  // g.fillText(`High Score ${MAX_SCORE}`,w-20,offset+=20)
  // g.fillText(`Server High Score ${SRVR_MAX_SCORE}`,w-20,offset+=20)
  // g.fillText(`Champion ${SRVR_WINNER}`,w-20,offset+=20)
}

function check_keys() {
  var reset = false
  if (SPACE_HAS_DOWN) PAUSED = SPACE = false
  if (USR_IO_KYS.hsDn['?']) SPACE = !SPACE
  // if (USR_IO_KYS.hsDn['p']) PAUSED = reset = true
  if (USR_IO_KYS.hsDn['t']) TRAILS = !TRAILS
  if (USR_IO_KYS.hsDn['r']) reset = true
  if (USR_IO_KYS.hsDn['s']) SHOW_STATS = !SHOW_STATS
  if (USR_IO_KYS.hsDn['m'])
    HOST_MSG('msg',null, `${CLNT_NAME}: ${prompt('Group Msg','Hello World')}`)
  if (USR_IO_KYS.hsDn['c']) MSGS = []
  if (USR_IO_KYS.hsDn['a']) {
    ALL_SCORE = MAX_SCORE + SCORE
    MY_DEATHS = 2
  }
  if (USR_IO_KYS.hsDn['p']) {
    HOLD = !HOLD
    // log('Hold',HOLD)
  }
  return reset
}

function draw_instructions() {
  var g = USR_IO_DSPLY.g
  var w = USR_IO_DSPLY.wh[0]
  var h = USR_IO_DSPLY.wh[1]

  g.font = 'bold 40px arial,serif'
  g.fillStyle = 'white'
  var offset = 140

  g.fillText("Press SPACE to boost",w-20,offset)
  g.fillText("Press P to pause",w-20,offset += 40)
  g.fillText("Press T for trails",w-20,offset += 40)
  g.fillText("Press R to restart",w-20,offset += 40)
  g.fillText("Press M to message",w-20,offset += 40)
  g.fillText("Press C to clear messages",w-20,offset += 40)
  g.fillText("Press S to toggle Stats",w-20,offset += 40)
  g.fillText("Press A to reset Average Score",w-20,offset += 40)
  g.fillText("Press ? for Instructions",w-20,offset += 40)

  g.fillText("Press Space To Start",w-20,offset += 120)
}

function draw_score_list() {
  var g = USR_IO_DSPLY.g
  var w = USR_IO_DSPLY.wh[0]
  var h = USR_IO_DSPLY.wh[1]

  g.font = 'bold 20px arial,serif'

  var offset = h

  var start = SCORE_BOARD.length - 10

  for (var i = start < 0 ? 0 : start; i < SCORE_BOARD.length; ++i) {
    var score_board = SCORE_BOARD[i]
    var name = score_board.name
    var max_score = score_board.max_score
    var score = score_board.score
    var average = Math.round(score_board.all_score / score_board.deaths)
    g.fillStyle = get_color(max_score/SRVR_MAX_SCORE)
    var color = get_color(max_score/SRVR_MAX_SCORE)
    g.fillText(`${name}: ${max_score} (${average})`,w-20,offset-=20)
  }

  // var list = []
  // list.push([CLNT_NAME,ALL_SCORE/MY_DEATHS])
  // for (var i in PLAYERS) {
  //   var plr = PLAYERS[i]
  //   list.push([plr[2],plr[4]])
  // }
  // list.sort((a,b)=>a[1]-b[1])
  // var offset = h
  // g.fillStyle = 'white'
  // for (var i in list) {
  //   var l = list[i]
  //   g.fillText(`${l[0]}: ${Math.round(l[1])}`,w-20,offset-=20)
  // }
}

function draw_msgs() {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var w = wh[0]
  var h = wh[1]

  var offset = h
  g.font =  'bold 30px arial,serif'
  for (var i = MSGS.length-1; i >= 0; --i) {
    var msg = MSGS[i]
    g.fillText(msg,w-10,offset -= 40)
  }
}

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var dt = USR_IO_EVNTS.dt * 1e-3
  var w = wh[0]
  var h = wh[1]

  g.lineWidth = LINE_WIDTH

  SPACE_HAS_DOWN = USR_IO_KYS.hsDn[' '] || USR_IO_MWS.hsDn
  SPACE_DOWN = USR_IO_KYS.isDn[' '] || USR_IO_MWS.isDn
  SCORE_HIGHT = h/TIME_LINE_SCALE
  TEMP_MAX_SCORE = SRVR_MAX_SCORE
  HELI = [HELI_X*w,HELI_Y*h]
  HELI_BOX = [HELI_W*w,HELI_H*h]

  if (SHOW_STATS) show_stats()

  draw_players()

  draw_black_frost() // BLACK FROST --------------------------------------------

  draw_status_bar()

  draw_player()

  get_bar()

  draw_bars()

  g.lineWidth = LINE_WIDTH

  if (!PAUSED) move_player()

  detect_death()

  if (!PAUSED && SPACE_DOWN) THRUST_TIME += dt

  if (TRAILS) draw_trails()

  draw_info()

  if (SPACE) draw_instructions()

  draw_score_list()

  draw_msgs()
}
