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
// Overview
// -----------------------------------------------------------------------------
IDS = 0
EDITOR_CONTROLLER = false
GAME_CONTROLLER = true

NODE_RADIUS = 30

// -----------------------------------------------------------------------------
// Level Data
// -----------------------------------------------------------------------------
LEVELS = []
SEL_LEVEL = null
SEL_NODE = null
SEL_PORT = null

MODES = {
  WALL: {
    sqr: null,
    wall: false,
    door: false,
    portal: false,
    handle: false,
    gate: null,
    allow_piece: false,
    can_override: [],
    check_src_node: new_link
  },
  DOOR: {
    sqr: null,
    wall: true,
    door: true,
    portal: false,
    handle: false,
    gate: null,
    can_override: ['WALL'],
    allow_piece: false,
    check_src_node: new_link
  }
}
for (var i in MODES) MODES[i].name = i

function get_node(point) {
  if (!SEL_LEVEL) throw [BAD_PRG, `null level`]
  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]
    if (NODE_RADIUS > PT.dist(node.point,point)) return node
  }
  return null
}

function new_link(src_node, new_node) {

}

function new_level() {
  SEL_LEVEL = {
    id: ++IDS,
    name: prompt('New Level?','Level ' + LEVELS.length),
    nodes: {},
    links: {},
    pieces: {}
  }
  if (!SEL_LEVEL.name) throw [BAD_USR, `no level name given`]
  LEVELS.push(SEL_LEVEL)
  return SEL_LEVEL
}

function new_node(point,src_node,mode) {
  if (!SEL_LEVEL) throw [BAD_PRG, `null level`]
  var node = get_node(point)
  if (node) {
    if ()
  }

  var node = {
    id: ++IDS,
    point: PT.copy(point),
    mode: mode,
    links: {},
    handles: {},
    gate: null,
    driver: null,
    key: null
  }
  mode.check_src_node(src_node,node)

  SEL_LEVEL.nodes[node.id] = node
  return node
}

// -----------------------------------------------------------------------------
// Editor Controller
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Game Controller
// -----------------------------------------------------------------------------
