log = console.log

//----------------------------------------------------------------
// PROJECT SETUP
//----------------------------------------------------------------
PROJECT_NAME = 'Nano Project'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false
PI2 = Math.PI*2

//----------------------------------------------------------------
// GAME SETUP
//----------------------------------------------------------------

SRVR_TICK_RATE = 5
TICK_RATE = 0.8
UPDATE_RATE = 0.01
FUEL_FLOW = 1.5e0
DERP_SPEED = 3e1
DERP_PAYLOAD = FUEL_FLOW / TICK_RATE
DERP_RADIUS = 3
DERP_COLOR = 'white'
LINK_COLOR = '#202020'
EMPTY_COLOR = {
  n: 'E',
  c1: LINK_COLOR,
  c2: LINK_COLOR,
  r: null
}
JOINT_COLOR = {
  n: 'J',
  c1: '#404040',
  c2: '#ffffff',
  r: null
}

JOINT_RADIUS = 7
SCREEN_CNTR = []
MIN_DT = 1e-2

MAX_START_FILL = 0.7
LINK_RADIUS_SCALER = 10

NODES = []
LINKS = []
DERPS = []

NODE_MIN_RAD = 7
NODE_MAX_RAD = 30
NODE_SOI = 10
N_NODES = 1e3
JOINT_RATIO = 0.6
NODE_SPREAD = 40 * Math.sqrt(N_NODES)
NODE_SPEED = 1
LINE_WIDTH = 4

GET_POINT = p => GET_POINT.f(p,SCREEN_CNTR,CNTR,2)
GET_POINT.f = PT.vcc('vvv',(p,s,c)=> p - s + c)

MAX_MOVE_DIST = 10
SEL_NODE = null
MOVE_DIST = 0

TIME = (new Date()).getTime() * 1e-3
UPDATE_TIME = TIME + TICK_RATE
PAUSED = false
N_DERPS = 0

TEMP_SRVR = () => CLNT_ID

// set colors
{
  COLORS = [
    { n: 'P', c1: '#400040', c2: '#800080', r: { 'Y': 2, 'T': 3, 'R': 1 } },
    { n: 'T', c1: '#004040', c2: '#008080', r: { 'Y': 1 } },
    { n: 'G', c1: '#004000', c2: '#008000', r: { 'Y': 1, 'T': 1 } },
    { n: 'R', c1: '#400000', c2: '#800000', r: { 'Y': 1, 'L': 1 } },
    { n: 'Y', c1: '#404000', c2: '#808000', r: { 'L': 1 } },
    { n: 'L', c1: '#101010', c2: '#404040', r: { 'Y': 1 } }
  ]
  COLOR_N = {}
  for (var i = 0; i < COLORS.length; ++i) {
    var c = COLORS[i]
    c.i = i
    COLOR_N[c.n] = c
  }
  COLOR_N[JOINT_COLOR.n] = JOINT_COLOR
  COLOR_N[EMPTY_COLOR.n] = EMPTY_COLOR
}

//----------------------------------------------------------------
// Interval
//----------------------------------------------------------------

setInterval(update_derps, UPDATE_RATE * 1e3)

//----------------------------------------------------------------
// SRVR INIT
//----------------------------------------------------------------

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  case 'rqst_update': send_update([sndr]); break
  case 'rcv_nodes': rcv_nodes(msg); break
  case 'rcv_links': rcv_links(msg); break
  case 'new_link': new_link(msg[0],msg[1]); break
  case 'kill_links': kill_links(msg); break
  default:
    log(key, sndr, rcvr, msg)
  }
}

//----------------------------------------------------------------
// SRVR INIT
//----------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')
  get_nodes()

  // setInterval(send_update, SRVR_TICK_RATE * 1e3)
}

//----------------------------------------------------------------
// CLNT INIT
//----------------------------------------------------------------

GAME_CLNT_INIT = () => {
  log('init game clnt')
  get_nodes()
  // HOST_MSG('rqst_update',[SRVR_CLNT_ID])
}

//----------------------------------------------------------------
// functions
//----------------------------------------------------------------

function rcv_nodes(nodes) {
  if (CLNT_ID == SRVR_CLNT_ID) return

  NODES = []
  for (var i in nodes) {
    var temp_node = nodes[i]
    NODES[i] = {
      p: temp_node.p, i: temp_node.i,
      f: temp_node.f, c: COLOR_N[temp_node.c],
      j: temp_node.j, r: temp_node.r,
      fc: temp_node.fc,    l: {}
    }
  }
}

function rcv_links(links) {
  if (CLNT_ID == SRVR_CLNT_ID) return

  LINKS = []
  for (var i in links) {
    var temp_link = links[i]
    var src = NODES[temp_link[0]]
    var dst = NODES[temp_link[1]]
    var sub = PT.sub(dst.p,src.p)
    var link = {
      i: LINKS.length,
      src: src.i, dst: dst.i,
      sub: sub, len: PT.length(sub)
    }
    src.l[dst.i] = dst.l[dst.i] = link
    LINKS.push(link)
  }
}

function new_link(node_ai, node_bi) {
  // log('new_link')
  var src = NODES[node_ai]
  var dst = NODES[node_bi]

  if (src.l[dst.i] || dst.l[src.i]) return

  var sub = PT.sub(dst.p,src.p)
  var link = {
    i: LINKS.length,
    src: src.i,
    dst: dst.i,
    sub: sub,
    len: PT.length(sub)
  }
  LINKS.push(link)
  dst.l[src.i] = src.l[dst.i] = link
}

function kill_links(node_i) {
  var node = NODES[node_i]
  // log(node)

  // var count = 0
  // for (var i in node.l) ++count
  // log(count)


  for (var i in node.l) {
    var link = node.l[i]
    // log(link)
    delete LINKS[link.i]
    delete NODES[link.src].l[link.dst]
    delete NODES[link.dst].l[link.src]
  }
}

function rand_color() {
  var c = Math.floor(Math.random() * COLORS.length)
  return COLORS[c]
}

function get_nodes() {
  var rand = PT.vcc('s',s=>s*(Math.random()*2-1))

  log('get_nodes...')
  var flags = 0
  var rad = (NODE_MAX_RAD-NODE_MIN_RAD)
  while (NODES.length < N_NODES) {
    var p = rand(NODE_SPREAD,2)
    var joint = NODES.length < JOINT_RATIO * N_NODES
    var r = joint ? JOINT_RADIUS : NODE_MIN_RAD + Math.pow(Math.random(),3)*rad

    var flag = true
    for (var j = 0; j < NODES.length && flag; ++j) {
      var node = NODES[j]
      flag = PT.dist(p,node.p) - r - node.r > NODE_SOI
    }

    if (flag) {
      var c = joint ? JOINT_COLOR : rand_color()
      var f = joint ? 0 : Math.random() * MAX_START_FILL
      var fc = {}
      fc[c.n] = f
      NODES.push({
        p: p, r: r, j: joint,
        i: NODES.length,
        f: f, fc: fc, c: c,
        l: {}
      })
    }
    else ++flags
  }

  log(`get_nodes complete ${flags/N_NODES*100}% collision`)
}

function update_derps() {
  if (PAUSED) return

  var time = (new Date()).getTime() * 1e-3
  var hard_dt = time - TIME

  var soft_reps = hard_dt / UPDATE_RATE
  var hard_reps = Math.ceil(soft_reps)
  var soft_dt = UPDATE_RATE * soft_reps / hard_reps

  N_DERPS = 0

  var update_time = TIME
  for (var rep = 0; rep < hard_reps; ++rep) {

    move_derps(soft_dt)
    if (update_time > UPDATE_TIME) {
      UPDATE_TIME += TICK_RATE
      ++N_DERPS
      new_derps()
    }

    update_time += soft_dt
  }

  // log()
  TIME = time
}

function new_derps() {
  for (var i in LINKS) {
    var link = LINKS[i]

    var src = NODES[link.src]
    var dst = NODES[link.dst]

    var f = src.f * src.r
    var payload = f > DERP_PAYLOAD ? DERP_PAYLOAD : f

    if (!payload || dst.f == 1) payload = 0

    src.f -= payload / src.r
    if (src.f < 0) src.f = 0
    var derp = {
      payload: payload,
      link: link,
      c: payload ? src.j ? dst.c : src.c : EMPTY_COLOR,
      i: DERPS.length,
      src_to_dst: true,
      path: src.r
    }
    DERPS.push(derp)
  }
}

function move_derps(dt) {
  var flow = dt * DERP_SPEED

  var derps = {}

  for (var i in DERPS) {
    var derp = DERPS[i]
    var link = derp.link
    var src = NODES[link.src]
    var dst = NODES[link.dst]

    if (derp.src_to_dst) {
      derp.path += flow
      if (derp.path > link.len - dst.r) {
        var v1 = derps[dst.i] = derps[dst.i] || {}
        var v2 = v1[derp.c.n] = v1[derp.c.n] || []
        v2.push(derp)
      }
    }
    else {
      derp.path -= flow
      if (derp.path < src.r) {
        var v1 = derps[src.i] = derps[src.i] || {}
        var v2 = v1[derp.c.n] = v1[derp.c.n] || []
        v2.push(derp)
      }
    }
  }

  for (var i in derps) {
    var node = NODES[i]
    var r = node.r
    var f = node.f * r

    for (var c in derps[i]) {
      for (var k in derps[i][c]) {
        var derp = derps[i][c][k]
        var link = derp.link
        var src = NODES[link.src]
        var dst = NODES[link.dst]

        f += derp.payload
        derp.payload = f - r
        if (derp.payload > 0) {
          f = r
          derp.path = derp.src_to_dst ? link.len - dst.r : src.r
          derp.src_to_dst = !derp.src_to_dst
        }
        else delete DERPS[derp.i]
      }
    }

    node.f = f / r
  }
}

function send_update(sndr) {
  // NODES = []
  // get_nodes()
  var nodes = []
  for (var i in NODES) {
    var node = NODES[i]
    nodes.push({
      p: node.p,  i: node.i,
      f: node.f,  c: node.c.n,
      j: node.j,  r: node.r,
      fc: node.fc,
    })
  }
  HOST_MSG('rcv_nodes',sndr,nodes)
  var links = []
  for (var i in LINKS) {
    var link = LINKS[i]
    var src = NODES[link.src]
    var dst = NODES[link.dst]
    links.push([src.i,dst.i,link.i])
  }
  HOST_MSG('rcv_links',sndr,links)
}

function proj_nodes() {
  for (var i in NODES) {
    var node = NODES[i]
    node.pj = GET_POINT(node.p)
  }
}

function draw_sel_node(g) {
  g.lineWidth = LINE_WIDTH
  if (SEL_NODE) {
    var node = SEL_NODE
    var p = GET_POINT(node.p)
    PT.drawCircle(g,p,node.r*2,node.c.c2)
  }
}

function draw_nodes(g) {
  g.lineWidth = LINE_WIDTH
  for (var i in NODES) {
    var node = NODES[i]
    var p = node.pj
    PT.drawCircle(g,p,node.r,node.c.c2)

    PT.fillCircle(g,p,node.r,node.c.c1)

    var b = PI2 * (0.25 + node.f/2)
    var a = Math.PI - b
    g.fillStyle = node.c.c2
    g.beginPath()
    g.arc(p[0],p[1],node.r,a,b)
    g.fill()


    var s1 = 0
    for (var j in node.c.r) {
      s1 += node.c.r[j]
    }
    s1 /= PI2

    var s2 = 0
    for (var j in node.c.r) {
      var t = node.c.r[j]
      var c = COLOR_N[j]
      var r = t * node.r
      var ca = PT.sum(p, PT.circle((s2 + t/2) / s1, r + node.r))
      PT.fillCircle(g,ca,r,c.c1)
      s2 += t
    }
  }
}

function draw_links(g) {
  g.lineWidth = LINE_WIDTH
  for (var i in LINKS) {
    var link = LINKS[i]
    var p0 = NODES[link.src].pj
    var p1 = NODES[link.dst].pj
    PT.drawLine(g,p0,p1,LINK_COLOR)
  }
}

function draw_derps(g) {
  var derps = []
  for (var i in DERPS) derps.push(DERPS[i])
  while (derps.length) {
    var derp = derps.pop()
    var link = derp.link
    var src = NODES[link.src]
    var dst = NODES[link.dst]

    var p = PT.vec(src.pj, link.sub, derp.path / link.len)
    PT.fillCircle(g,p,DERP_RADIUS,derp.c.c2)
  }
}

function draw_ranges(g) {
  g.lineWidth = 1
  if (USR_IO_KYS.isDn[' ']) {
    for (var i in NODES) {
      var node = NODES[i]
      var p = GET_POINT(node.p)
      PT.drawCircle(g,p,2*node.r,node.c.c2)
    }
  }
}

function check_kill_links() {
  if (SEL_NODE && USR_IO_KYS.hsDn['Enter']) {
    // log('tick',SEL_NODE)
    HOST_MSG('kill_links',null,SEL_NODE.i)
    // kill_links(SEL_NODE.i)
    SEL_NODE = null
  }
}

function get_new_node() {
  var p = GET_POINT.f(USR_IO_MWS,CNTR,SCREEN_CNTR,2)
  NEW_NODE = null
  for (var i in NODES) {
    var node = NODES[i]
    if (PT.dist(node.p,p) < node.r) {
      NEW_NODE = node
      break
    }
  }
  MWS_SUB = PT.sub(USR_IO_MWS.prv,USR_IO_MWS)
}

function check_mws_hsdn() {
  if (USR_IO_MWS.hsDn) {
    MOVE_DIST = 0
    DRAG_NODE = null
    // if (NEW_NODE && NEW_NODE.j) {
    //   DRAG_NODE = NEW_NODE
    // }
    // else DRAG_NODE = null
  }
}

function check_mws_isdn() {
  if (USR_IO_MWS.isDn) {
    if (DRAG_NODE) {
      PT.sube(DRAG_NODE.p,MWS_SUB)
    }
    else {
      PT.sume(SCREEN_CNTR,MWS_SUB)
      if (SCREEN_CNTR[0] > NODE_SPREAD) SCREEN_CNTR[0] = NODE_SPREAD
      if (SCREEN_CNTR[0] < -NODE_SPREAD) SCREEN_CNTR[0] = -NODE_SPREAD
      if (SCREEN_CNTR[1] > NODE_SPREAD) SCREEN_CNTR[1] = NODE_SPREAD
      if (SCREEN_CNTR[1] < -NODE_SPREAD) SCREEN_CNTR[1] = -NODE_SPREAD
    }
    MOVE_DIST += PT.length(MWS_SUB)
  }
}

function check_mws_hsup() {
  if (USR_IO_MWS.hsUp && MOVE_DIST < MAX_MOVE_DIST) {
    // if (DRAG_NODE == NEW_NODE) SEL_NODE = null
    if (!NEW_NODE) SEL_NODE = null
    else if (SEL_NODE == NEW_NODE) SEL_NODE = null
    else if (!SEL_NODE) SEL_NODE = NEW_NODE
    else {
      HOST_MSG('new_link',null,[SEL_NODE.i,NEW_NODE.i])
      SEL_NODE = NEW_NODE
    }
  }
}

//----------------------------------------------------------------
// TICK
//----------------------------------------------------------------

GAME_TICK = () => {
  if (!NODES || !LINKS) return
  CNTR = PT.divs(USR_IO_DSPLY.wh,2)
  PAUSED = USR_IO_KYS.isDn[' ']

  proj_nodes()

  draw_links(USR_IO_DSPLY.g)

  draw_sel_node(USR_IO_DSPLY.g)

  draw_derps(USR_IO_DSPLY.g)

  draw_nodes(USR_IO_DSPLY.g)

  draw_ranges(USR_IO_DSPLY.g)

  check_kill_links()

  get_new_node()

  check_mws_hsdn()

  check_mws_isdn()

  check_mws_hsup()
}
