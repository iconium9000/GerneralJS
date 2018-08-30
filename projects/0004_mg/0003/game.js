log = console.log

PROJECT_NAME = 'MazeGame V3'

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

// -----------------------------------------------------------------------------
// Overview
// -----------------------------------------------------------------------------
SIDS = 0
EDITOR_CONTROLLER = false
GAME_CONTROLLER = true

NODE_RADIUS = 30

// -----------------------------------------------------------------------------
// Level Data
// -----------------------------------------------------------------------------
LEVELS = []
SEL_LEVEL = null
SEL_NODE = null
SEL_PIECE = null

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


function set_mode(mode,node) {
  if (node.src_node) {
    switch (mode) {
      case WALL_MODE:

      case DOOR_MODE:

      case PORTAL_MODE:
      case HANDLE_MODE:

    }
  }
  else if (mode == PORTAL_MODE) {
    
  }
}

function new_node(point,src_node,mode) {
  var node = get_node(point)
  if (node) {
    node.src_node = src_node
    return set_mode(mode,node)
  }
  var node = {
    sid: ++SIDS,
    point: PT.copy(point),
    src_node: src_node,
    peice_target: false,
    handles: {},
    doors: {},
    walls: {}
  }
  SEL_LEVEL.nodes[node.sid] = node
  return set_mode(mode,src_node,node)
}

// -----------------------------------------------------------------------------
// Editor Controller
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Game Controller
// -----------------------------------------------------------------------------
