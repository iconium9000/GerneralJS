log = console.log

PROJECT_NAME = 'Blockade'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false
IS_MOBILE = false

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  case 'fun':
    if (sndr == SRVR_CLNT_ID) {
      try {
        eval(msg)
      }
      catch (e) {
        console.error(e)
      }
    }
    break
  case 'refresh':
    location && location.reload()
    break
  case 'msg':
    MSGS.push(msg)
    log(msg)
    if (MSGS.length > 5) MSGS = MSGS.slice(1,6)
    break
  case 'new_bar':
    if (CLNT_ID != SRVR_CLNT_ID) {
      msg.score = ++BAR_SCORE / SRVR_MAX_SCORE
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
    HOST_MSG('deaths',[sndr],DEATHS)
    break
  case 'srvr_score':
    SRVR_WINNER = msg[0]
    SRVR_MAX_SCORE = msg[1]
    HOST_MSG('clnt_score',null,msg)
    // log('srvr_score',msg)
    break
  case 'death':
    var name = msg[0]
    var score = msg[1]
    if (score > 1000) score = 1000
    if (score < 0) score = 0
    if (isNaN(score)) break
    // log(score)
    if (DEATHS[score]) ++DEATHS[score]
    else DEATHS[score] = 1
    if (SAVE_GAME) SAVE_GAME()
    log(`${name} died at ${score}`)
    break
  case 'deaths':
    DEATHS = msg
    // log('deaths',msg)
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
  var save = SRVR_READ_FILE('save_file.txt')
  SRVR_WINNER = save[0]
  SRVR_MAX_SCORE = save[1]
  DEATHS = save[2]
  log(save)
  ON_SRVR_KILL = SAVE_GAME = () => SRVR_WRITE_FILE('save_file.txt',[SRVR_WINNER,SRVR_MAX_SCORE,DEATHS])
  setInterval(SAVE_GAME,1e5)
  setInterval(() => {
    HOST_MSG('new_bar',null,[
      [11/10,Math.random()],
      [BAR_W_MIN+BAR_W*Math.random(),BAR_H_MIN+BAR_H*Math.random()]
    ])
  },1e3/BAR_FREQ)
}

GAME_CLNT_INIT = () => {
  log('init game clnt')
  SAVE_GAME = null
  START_TIME = USR_IO_EVNTS.nw
  setInterval(() => {
    if (!PAUSED) HOST_MSG('player_update',null,[HELI_Y,2,CLNT_NAME.slice(0,8),SCORE,ALL_SCORE/MY_DEATHS])
    for (var i in PLAYERS) if (PLAYERS[i][1]-- < 0) delete PLAYERS[i]
  },UPDATE_FREQ)
  HOST_MSG('get_score',[0])

  IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

COLORS = ['green','yellow','orange','red','magenta','lightblue','blue','purple']

HELI_X = 1/60
HELI_Y = 1/2
HELI_W = 1/12
HELI_H = 1/20
HELI_V = 0

if (IS_MOBILE) HELI_GRAVITY = 0.7
else HELI_GRAVITY = 0.8  // h per sec per sec (easy 1.1)
HELI_LIFT = 2.5 * HELI_GRAVITY // h per sec per sec

SHOW_STATS = true

PAUSED = true
TRAILS = false

LINE_WIDTH = 6
BAR_FREQ = 4/1 // bar spawn per sec
BAR_SPEED  = 2/3 // w per sec
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
  g.lineWidth = LINE_WIDTH
  var score = SCORE
  var max_score = SRVR_MAX_SCORE

  if (SHOW_STATS) {
    var deaths = []
    DEATHS_BAD = deaths
    for (var i = 0; i < max_score; ++i) {
      var j = Math.floor(i / max_score * w / LINE_WIDTH)
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
  // throw 'err'

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

  PT.fillRect(g,[],wh,'#000000a0')
  for (var i = 0; i < COLORS.length; ++i) {
    var x = i * w / COLORS.length
    var color = COLORS[i]
    PT.fillRect(g,[x,0],[w / COLORS.length,score_hight],color)
  }
  var score_line = score * w / max_score
  PT.drawLine(g,[score_line,0],[score_line,score_hight*2],'white')

  heli[1] = h * HELI_Y
  PT.fillRect(g,heli,heli_box,PAUSED?'grey':'white')
  var acceleration = HELI_GRAVITY - (SPACE_DOWN ? HELI_LIFT : 0)

  RESET = false
  var floor_score = Math.floor(SCORE * COLORS.length / SRVR_MAX_SCORE)
  if (floor_score > COLORS.length) floor_score = COLORS.length
  COLOR = COLORS[floor_score]

  var bar_points = []
  var bars = []

  for (var i in BARS) {
    var bar = BARS[i]
    if (bar[0][0] < -1/10) {
      if (!PAUSED) {
        ++SCORE
        ++ALL_SCORE
      }
      if (SCORE > MAX_SCORE) {
        MAX_SCORE = SCORE
        if (MAX_SCORE > SRVR_MAX_SCORE) {
          HOST_MSG('srvr_score',[0],[CLNT_NAME,SCORE])
          SRVR_MAX_SCORE = SCORE
        }
      }
      delete BARS[i]
    }
    else {
      bar[0][0] -= BAR_SPEED * dt

      var p = PT.mat(bar[0],wh,MUL)
      var v = PT.mat(bar[1],wh,MUL)
      bars.push([p,PT.sum(p,v)])
      var p1 = p[0], p2 = p[1], v1 = v[0], v2 = v[1]
      var c1 = (p1 + p1 + v1) / 2, c2 = (p2 + p2 + v2) / 2
      bar_points.push([c1,c2],[c1,0],[c1,h],[w,c2])
      // bar_points.push(p,PT.sum(p,v),[p1+v1,p2],[p1,p2+v2])
      // bar_points.push([p1,0],[p1,h])//,[p1+v1,0],[p1+v1,h])

      if (PAUSED) {
        PT.fillRect(g,p,v,'white')
      }
      else if (bar.score > 1) {
        PT.drawRect(g,p,v,'#808080')
      }
      else {
        var floor_score = Math.floor(bar.score * COLORS.length)
        if (floor_score > COLORS.length) floor_score = COLORS.length-1
        var color = COLORS[floor_score]
        PT.fillRect(g,p,v,color)
      }

      if (PT.hitbox(heli,heli_box,p,v)) RESET = true
    }
  }



  // var bar_lines = []
  // for (var i = 0; i < bar_points.length; ++i) {
  //   for (var j = i+1; j < bar_points.length; ++j) {
  //     bar_lines.push([bar_points[i],bar_points[j],PT.dist(bar_points[i],bar_points[j])])
  //   }
  // }
  //
  // g.lineWidth = 1
  // bar_lines.sort((a,b)=>a[2]-b[2])
  // for (var i = 0; i < bar_lines.length; ++i) {
  //   var line_a = bar_lines[i]
  //   for (var j = i+1; j < bar_lines.length; ++j) {
  //     var line_b = bar_lines[j]
  //     if (!line_b) continue
  //     line_b[3] = line_b[3] || PT.lineCross(line_a[0],line_a[1],line_b[0],line_b[1])
  //   }
  // }
  //
  // var nodes = []
  // for (var i in bar_lines) {
  //   var line = bar_lines[i]
  //   if (!line[3]) {
  //     PT.drawLine(g,line[0],line[1],'#404040')
  //     var node = PT.divs(PT.sum(line[0],line[1]),2)
  //     if (node[1]>heli_box[1]&&node[1]<h-heli_box[1])
  //       nodes.push(node)
  //   }
  // }
  // nodes.push(PT.sum(heli,PT.divs(heli_box,2)))
  // nodes.sort((a,b)=>a[0]-b[0])
  // var node_lines = []
  // for (var i = 0; i < nodes.length; ++i) {
  //   var node_a = nodes[i]
  //   for (var j = i+1; j < nodes.length; ++j) {
  //     var node_b = nodes[j]
  //
  //     var q1 = node_a[0], q2 = node_a[1]
  //     var u1 = node_b[0] - q1, u2 = node_b[1] - q2
  //     var f1 = u1>0?1:-1, f2 = u2>0?1:-1
  //     var qf1 = f1*q1, qf2 = f2*q2
  //     var uf1 = f1*u1, uf2 = f2*u2
  //     var flag = true
  //
  //     for (var k in bars) {
  //       var bar = bars[k]
  //       var a1 = f1*bar[0][0], a2 = f2*bar[0][1]
  //       var b1 = f1*bar[1][0], b2 = f2*bar[1][1]
  //
  //       var af1 = a1>b1?b1:a1, af2 = a2>b2?b2:a2
  //       var bf1 = a1<b1?b1:a1, bf2 = a2<b2?b2:a2
  //
  //       var m1 = (af1 - qf1) / uf1, m2 = (af2 - qf2) / uf2
  //       var n1 = (bf1 - qf1) / uf1, n2 = (bf2 - qf2) / uf2
  //
  //       var m = m1>m2?m1:m2
  //       var n = n1>n2?n2:n1
  //
  //       if ((m<n?1:0)*((n>0?1:0)*(1>n?1:0)+(m>0?1:0)*(1>m?1:0))) {
  //         flag = false
  //         break
  //       }
  //     }
  //     if (flag) node_lines.push([node_a,node_b,PT.dist(node_a,node_b)])
  //   }
  // }
  //
  // for (var i in node_lines) {
  //   var node_line = node_lines[i]
  //   if (!node_line[3]) {
  //     PT.drawLine(g,node_line[0],node_line[1],'white')
  //   }
  // }

  // g.fillText(`num:${count}`,20,20)

  // if (SCORE == 1) throw 'err'
  g.lineWidth = LINE_WIDTH

  if (SPACE_HAS_DOWN) PAUSED = SPACE = false
  if (USR_IO_KYS.hsDn['?']) SPACE = !SPACE
  if (USR_IO_KYS.hsDn['p']) PAUSED = RESET = true
  if (USR_IO_KYS.hsDn['t']) TRAILS = !TRAILS
  if (USR_IO_KYS.hsDn['r']) RESET = true
  if (USR_IO_KYS.hsDn['s']) SHOW_STATS = !SHOW_STATS

  if (!PAUSED) {
    HELI_V += dt * acceleration
    HELI_Y += dt * HELI_V
  }

  if (HELI_Y < 0 || 1 < HELI_Y  || RESET) {
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
  var offset = 0
  g.fillText(`Score ${SCORE}`,w-20,offset+=20)
  g.fillText(`Blocks Per Run ${Math.round(ALL_SCORE/MY_DEATHS)}`,w-20,offset+=20)
  g.fillText(`High Score ${MAX_SCORE}`,w-20,offset+=20)
  g.fillText(`Server High Score ${SRVR_MAX_SCORE}`,w-20,offset+=20)
  g.fillText(`Champion ${SRVR_WINNER}`,w-20,offset+=20)

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
    g.fillText("Press M to message",w-20,offset += 40)
    g.fillText("Press C to clear messages",w-20,offset += 40)
    g.fillText("Press S to toggle Stats",w-20,offset += 40)
    g.fillText("Press ? for Instructions",w-20,offset += 40)

    g.fillText("Press Space To Start",w-20,offset += 120)
  }

  var list = []
  list.push([CLNT_NAME,ALL_SCORE/MY_DEATHS])
  for (var i in PLAYERS) {
    var plr = PLAYERS[i]
    list.push([plr[2],plr[4]])
  }
  list.sort((a,b)=>a[1]-b[1])
  var offset = h
  g.fillStyle = 'white'
  for (var i in list) {
    var l = list[i]
    g.fillText(`${l[0]}: ${Math.round(l[1])}`,w-20,offset-=20)
  }

  if (USR_IO_KYS.hsDn['m']) HOST_MSG('msg',null,`${CLNT_NAME}: ${prompt('Group Msg','Hello World')}`)
  if (USR_IO_KYS.hsDn['c']) MSGS = []
  var offset = wh[1]
  g.font =  'bold 30px arial,serif'
  for (var i = MSGS.length-1; i >= 0; --i) {
    var msg = MSGS[i]
    g.fillText(msg,wh[0]-10,offset -= 40)
  }


}
