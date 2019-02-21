log = console.log

PROJECT_NAME = 'Galcon'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')
}

GAME_CLNT_INIT = () => {
  log('init game clnt')

  new_game()
}

// -----------------------------------------------------------------------------
// SORT
// -----------------------------------------------------------------------------

var g = 6
var k = 3
function perm(array, start, depth) {
  if (depth == k) return [array.slice()]
  else {
    var ret = []
    for (array[depth] = start; array[depth] < g; ++array[depth]) {
      ret = ret.concat(perm(array, array[depth] + 1, depth + 1))
    }
    return ret
  }
}
for (var g = 1; g < 10; ++g) {
  for (var k = 1; k <= g; ++k) {
    var array = perm([], 0, 0)
    log('-----', g, k, array.length)
  }
}


// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------

N_NODES = 1e3
NODE_DENSITY = 1e4
SIZE = Math.sqrt(NODE_DENSITY * N_NODES / PI) // circle layout
GRAV_PARA = 1e6


// square layout
// SIZE = Math.sqrt(N_NODES * NODE_DENSITY)
// SIZE = [SIZE,SIZE,1]

PROJ = 0.5
MAP = []
MAP_DISTANCE = 0
MAP_PERIOD = 0
MAP_START_ANGLE = 0

SCALE_HELPER = 1
SCALE_SPEED = 1e-3
function get_scale() {
  var h = SCALE_HELPER
  var s = h > 1 ? h : 1 / (h - 2)
  return s * s
}
SCALE = get_scale()
NODE_AREA_VARY = 20e2
NODE_MIN_SIZE = 2e2
DEFAULT_COLOR = 'white'

function new_game() {
  GAME = {
    players: {},
    nodes: [],
    planes: {}
  }
  FU.forlen(N_NODES, new_node)
}
function new_node() {
  var node = {
    // position: PT.mul(PT.rand(3), SIZE), // square layout
    // position: PT.crand([0,0,1], SIZE), // circle layout
    distance: Math.sqrt(RAND()) * SIZE,
    start_angle: RAND() * PI2,
    hight: RAND(),

    color: DEFAULT_COLOR,
    player: null,
    area: Math.pow(Math.random(),5) * NODE_AREA_VARY + NODE_MIN_SIZE,
    planes_at_time: 0,
    time: null
  }


  node.radius = Math.sqrt(node.area / PI)
  node.period = get_period(node.distance)
  GAME.nodes.push(node)
  return node
}

function get_period(r) {
  return PI2 * Math.sqrt(Math.pow(r, 3) / GRAV_PARA)
}
function get_position(distance, start_angle, period) {
  return PT.circle(start_angle + PI2 * TIME / period, distance)
}

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

function base_proj_position(pos) {
  return base_proj_position_helper(pos, MAP, CNTR, SCALE)
}
base_proj_position_helper = PT.vcc('vvvs', base_proj_position_helper2, 2)
function base_proj_position_helper2(pos, map_cntr, cntr, scale) {
  return (pos - map_cntr) * scale + cntr
}
function proj_position(pos) {
  return proj_position_helper(pos, pos[2], SIZE, MAP, CNTR, SCALE, PROJ)
}
proj_position_helper = PT.vcc('vsvvvss', proj_position_helper2, 2)
function proj_position_helper2(pos, hight, size, map_cntr, cntr, scale, proj) {
  return (pos - map_cntr) * (1 + proj * scale * hight) * scale + cntr
}
function draw_rings() {
  var cntr = base_proj_position([])
  var reps = 10
  for (var i = 1; i < reps; ++i) {
    PT.drawCircle(G, cntr, i * SIZE * SCALE / reps, '#202020')
  }
}
function draw_nodes() {
  function draw_nodes_helper(n) {
    if (on_screen(n.base_proj,0)) {
      PT.drawLine(G, n.base_proj, n.proj, n.color)
      var r = n.radius * SCALE
      if (on_screen(n.proj, r)) {
        PT.fillCircle(G, n.proj, r, n.color)
      }
    }
  }
  GAME.nodes.forEach(draw_nodes_helper)
}
function proj_nodes() {
  function proj_nodes_helper(n) {
    n.position = get_position(n.distance, n.start_angle, n.period)
    n.position[2] = n.hight
    n.proj = proj_position(n.position)
    n.base_proj = base_proj_position(n.position)
  }
  GAME.nodes.forEach(proj_nodes_helper)
}


on_screen_helper = PT.vcc('vvs',(p,s,r)=>-r<p && p<s+r, 2)
function on_screen(pos, r) {
  var ans2 = on_screen_helper(pos, WH, r)
  return ans2[0] && ans2[1]
}
GAME_TICK = () => {
  TIME = USR_IO_EVNTS.nw * 1e-3
  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH,2)
  CNTR_MAP = PT.sub(CNTR, MAP)

  G.fillStyle = 'white'
  var angle = PT.tan2(MAP)
  G.fillText(angle, 20, 40)

  var sub = PT.sub(USR_IO_MWS.prv, USR_IO_MWS)
  var sub_len = PT.length(sub)
  if (USR_IO_MWS.isDn && sub_len) {
    PT.sume(MAP, PT.divs(sub, SCALE))
    MAP_DISTANCE = PT.length(MAP)
    MAP_PERIOD = get_period(MAP_DISTANCE)
    MAP_START_ANGLE = angle - PI2 * TIME / MAP_PERIOD
  }
  else {
    MAP = get_position(MAP_DISTANCE, MAP_START_ANGLE, MAP_PERIOD)
  }

  if (USR_IO_MWS.hsWl) {
    SCALE_HELPER += USR_IO_MWS.wlPt[1] * SCALE_SPEED
    SCALE = get_scale()
  }

  draw_rings()

  proj_nodes()
  draw_nodes()

  G.fillStyle = 'white'
  G.fillText(TIME, 20 ,20)

}

// -----------------------------------------------------------------------------
// IO
// -----------------------------------------------------------------------------

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  default:
    log(key, sndr, rcvr, msg)
  }
}
