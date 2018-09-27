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

SID = 0
LEVELS = {}
SEL_LEVEL = null

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

function gate_color(gate) {
  return gate ? !SEL_LEVEL.portal_lock&&gate.is_open ? 'green' : 'red' : 'white'
}

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
    if (NODE_RADIUS > PT.dist(node.point,point)) {
      return node.pig ? node.pig.pig || node.pig : node
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

  return link
}
function kill_links(node) {
  for (var i in node.links) {
    var node_link = node.links[i]
    delete node.links[i]
    delete node_link.node.links[node.sid]
    delete SEL_LEVEL.links[node_link.link.sid]
    set_gate(node_link.node)
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
