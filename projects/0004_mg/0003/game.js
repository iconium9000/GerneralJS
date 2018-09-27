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

  for (var i in MODE_KEYS) {
    var key = MODE_KEYS[i]
    if (USR_IO_KYS.hsDn[key]) {
      log("mode",i)
      MODE = parseInt(i)
    }
  }
  if (SEL_NODE && USR_IO_KYS.hsDn['q']) {
    kill_node(SEL_NODE)
    SEL_NODE = null
  }
  if (SEL_NODE && USR_IO_KYS.hsDn['a']) {
    SEL_NODE = null
  }


  if (USR_IO_MWS.hsDn) {
    DRAG_NODE = new_node(USR_IO_MWS)
    DRAG_LEN = 0
  }
  if (USR_IO_MWS.isDn) {
    var dif = PT.sub(USR_IO_MWS,USR_IO_MWS.prv)
    DRAG_LEN += PT.length(dif)
    PT.sume(DRAG_NODE.point,dif)
    if (DRAG_LEN > MIN_DRAG_LEN) SEL_NODE = null
  }
  if (USR_IO_MWS.hsUp && DRAG_LEN < MIN_DRAG_LEN) {
    SEL_NODE = link_node(DRAG_NODE,SEL_NODE)
  }


  for (var i in SEL_LEVEL.links) {
    var link = SEL_LEVEL.links[i]

    // g.strokeStyle = 'white'
    g.strokeStyle = gate_color(link.gate)
    g.setLineDash(link.solid ? [] : [4,4])
    PT.drawLine(g,link.node_a.point,link.node_b.point)
  }

  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]

    var is_portal = SEL_LEVEL.portals[node.sid]
    g.strokeStyle = node.is_handle||is_portal ? gate_color(node.gate) : 'white'
    g.setLineDash(SEL_LEVEL.portals[node.sid] ? PORTAL_DASH : [])
    PT.drawCircle(g,node.point,NODE_RADIUS)
  }

  if (SEL_NODE) {
    g.strokeStyle = 'white'
    PT.drawLine(g,USR_IO_MWS,SEL_NODE.point)
  }
}

// -----------------------------------------------------------------------------
// CONSTS
// -----------------------------------------------------------------------------

<<<<<<< HEAD
SID = 0
LEVELS = {}
SEL_LEVEL = null
=======
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
>>>>>>> c4d2114857eb92c06e2515b2da31b1bb4eb4db06

SEL_NODE = null
DRAG_NODE = null
DRAG_LEN = 0

NODE_RADIUS = 15

IS_SQR = false
MODE = 0
MODE_KEYS = {}
WALL_MODE   = ++MODE
MODE_KEYS[WALL_MODE] = 'w'
DOOR_MODE   = ++MODE
MODE_KEYS[DOOR_MODE] = 'd'
LINK_MODE = ++MODE
MODE_KEYS[LINK_MODE] = 'l'
HANDLE_MODE = ++MODE
MODE_KEYS[HANDLE_MODE] = 'h'
PORTAL_MODE = ++MODE
MODE_KEYS[PORTAL_MODE] = 'p'
DRIVER_MODE = ++MODE
MODE_KEYS[DRIVER_MODE] = 'r'
KEY_MODE    = ++MODE
MODE_KEYS[KEY_MODE] = 'k'
GAME_MODE    = ++MODE
MODE_KEYS[GAME_MODE] = 'g'

MODE = WALL_MODE

LINE_DASH = [4,4]
PORTAL_DASH = [3,3]
PORTAL_PULSE_RATE = 2e-3
PORTAL_PULSE_RATIO = 0.3

MIN_DRAG_LEN = 10

new_level()

// -----------------------------------------------------------------------------
// BACKBONE
// -----------------------------------------------------------------------------
<<<<<<< HEAD

function gate_color(gate) {
  return gate ? !SEL_LEVEL.portal_lock&&gate.is_open ? 'green' : 'red' : 'white'
}
=======
LEVELS = []
SEL_LEVEL = null
SEL_NODE = null
SEL_PIECE = null
>>>>>>> c4d2114857eb92c06e2515b2da31b1bb4eb4db06

function new_level() {
  SEL_LEVEL = {
    sid: ++SID,
    nodes: {},
    links: {},
    portals: {},
    portal_lock: false
  }
  LEVELS[SEL_LEVEL.sid] = SEL_LEVEL
}
function get_node(point) {
  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]
<<<<<<< HEAD
    if (NODE_RADIUS > PT.dist(node.point,point)) {
      return node.pig ? node.pig.pig || node.pig : node
=======
    if (NODE_RADIUS > PT.dist(point,node.point)) {
      return node
>>>>>>> c4d2114857eb92c06e2515b2da31b1bb4eb4db06
    }
  }
  return null
}
function get_link(node_a,node_b) {
  var node_link = node_a.links[node_b.sid]
  if (node_link) return node_link.link

  var link = {
    sid: ++SID,
    node_a: node_a,
    node_b: node_b,
    gate: null
  }
  SEL_LEVEL.links[link.sid] = link
  node_a.links[node_b.sid] = {link:link,node:node_b}
  node_b.links[node_a.sid] = {link:link,node:node_a}

<<<<<<< HEAD
  return link
}
function kill_links(node) {
  for (var i in node.links) {
    var node_link = node.links[i]
    delete node.links[i]
    delete node_link.node.links[node.sid]
    delete SEL_LEVEL.links[node_link.link.sid]
    set_gate(node_link.node)
=======
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
    
>>>>>>> c4d2114857eb92c06e2515b2da31b1bb4eb4db06
  }
}
function kill_node(node) {
  if (node.pig) kill_node(node.pig)
  if (node.back) {
    node.back.pig = null
    kill_node(node.back)
  }
  kill_links(node)
  delete SEL_LEVEL.nodes[node.sid]
}
function set_gate(node,gate) {
  if (gate && node.gate == gate) return
  gate = node.gate = gate || {
    handles: {},
    is_open: true
  }

<<<<<<< HEAD
  if (node.is_handle && !node.pig) {
    gate.is_open = false
  }

  for (var i in node.links) {
    var node_link = node.links[i]
    if (node_link.link.gate) {
      node_link.link.gate = gate
      set_gate(node_link.node,gate)
    }
  }
}
function new_node(point) {
  var node = get_node(point) || {
    sid: ++SID,
    point: PT.copy(point),
    links: {},
    is_handle: false,
    pig: null,
    back: null,
    is_sqr: IS_SQR
  }
  SEL_LEVEL.nodes[node.sid] = node
  var node = node.back ? node.back.back || node.back : node
  set_gate(node)
  return node
=======
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
>>>>>>> c4d2114857eb92c06e2515b2da31b1bb4eb4db06
}
function link_node(node,src_node) {

  if (MODE == PORTAL_MODE) {
    if (SEL_LEVEL.portals[node.sid]) {
      delete SEL_LEVEL.portals[node.sid]
    }
    else {
      SEL_LEVEL.portals[node.sid] = node
    }
    node.is_handle = false
  }
  if (MODE == HANDLE_MODE) {
    delete SEL_LEVEL.portals[node.sid]
    node.is_handle = !node.is_handle
  }

  if (src_node) {
    var link = get_link(node,src_node)
    link.solid = MODE == WALL_MODE || MODE == DOOR_MODE
    link.gate = MODE != WALL_MODE
  }

  set_gate(node)
  return node
}
