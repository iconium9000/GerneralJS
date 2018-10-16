log = console.log

PROJECT_NAME = 'MazeGame V3'
GAME_HIDE_CURSER = false

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
GAME_CLNT_INIT = () => {
  log('init game clnt')
}


GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var cntr = PT.divs(wh,2)
  var cur_mws = USR_IO_MWS
  var prv_mws = USR_IO_MWS.prv

  draw_level(g,cur_mws,prv_mws)
}

// -----------------------------------------------------------------------------
// Exceptions
// -----------------------------------------------------------------------------
DEF_ERR = 0
BAD_USR = ++DEF_ERR
BAD_PRG = ++DEF_ERR
USED_NODE = ++DEF_ERR

// -----------------------------------------------------------------------------
// Modes
// -----------------------------------------------------------------------------
MODE_ID = 0
WALL_MODE = ++MODE_ID
DOOR_MODE = ++MODE_ID
PORTAL_MODE = ++MODE_ID
HANDLE_MODE = ++MODE_ID
DRIVER_MODE = ++MODE_ID
KEY_MODE = ++MODE_ID

MODE = WALL_MODE

// -----------------------------------------------------------------------------
// Overview
// -----------------------------------------------------------------------------
SIDS = 0
EDITOR_CONTROLLER = false
GAME_CONTROLLER = true

NODE_RADIUS = 15

// -----------------------------------------------------------------------------
// Level Data
// -----------------------------------------------------------------------------
LEVELS = {}
SEL_LEVEL = null
SEL_NODE = null
SEL_PIECE = null
DRAG_NODE = null
new_level()

function new_level() {
  var level = {
    sid: ++SIDS,
    name: 'Level ' + SIDS,
    nodes: {},
    walls: {},
    doors: {},
    handles: {},
    portals: {},
    drivers: {},
    keys: {}
  }
  SEL_LEVEL = LEVELS[level.sid] = level
}
function get_node(point) {
  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]
    if (NODE_RADIUS > PT.dist(point,node.point)) {
      return node
    }
  }
  return null
}

function set_gate(node) {

}
function check_src_node(node,src_node) {

}

function new_node(point,src_node,mode) {
  var node = get_node(point) || {
    sid: ++SIDS,
    point: PT.copy(point),
    peice_target: false,
    handles: {},
    doors: {},
    walls: {}
  }
  node.src_node = src_node
  SEL_LEVEL.nodes[node.sid] = node

  if (node.src_node) {
    switch (MODE) {
      case WALL_MODE:


      case DOOR_MODE:

      case PORTAL_MODE:
      case HANDLE_MODE:

    }
  }
  else if (MODE == PORTAL_MODE) {

  }
}

// -----------------------------------------------------------------------------
// Editor Controller
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Game Controller
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Graphics
// -----------------------------------------------------------------------------

var drag_fun = PT.vcc('vvv',(n,m,p)=>n+m-p,2)

function draw_level(g) {
  var drag_enable = USR_IO_KYS.isDn['1']
  if (drag_enable) {
    if (USR_IO_MWS.hsDn) DRAG_NODE = get_node(USR_IO_MWS)
    if (DRAG_NODE && USR_IO_MWS.isDn){
      DRAG_NODE.point = drag_fun(DRAG_NODE.point,USR_IO_MWS,USR_IO_MWS.prv)
    }
  }
  else if (USR_IO_MWS.hsDn) new_node(USR_IO_MWS)

  g.strokeStyle = 'white'
  g.fillStyle = 'white'
  var draw = drag_enable ? PT.drawCircle : PT.fillCircle

  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]
    draw(g,node.point,NODE_RADIUS)
  }
}
