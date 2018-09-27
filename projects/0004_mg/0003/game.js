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
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh


}

// -----------------------------------------------------------------------------
SIDS = 0
LEVELS = {}
SEL_NODE = null
SEL_PEICE = null
SEL_LEVEL = null
MODE = 'WALL'

NODE_RADIUS = 15

new_level()

// -----------------------------------------------------------------------------

function new_level() {
  SEL_LEVEL = {
    sid: ++SIDS,
    nodes: {},
    walls: {},
    portals: {},
    keys: {},
    drivers: {}
  }
}

function get_node(point) {
  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]
    if (NODE_RADIUS * 2 > PT.dist(node.point,point)) {
      return node
    }
  }
  return null
}

function check_handle(src_node,node) {
  if (src_node == node) return true
  else if (!src_node) return false
  else return check_handle(node.src_node,node)
}

function set_gate(node,gate) {

}

function new_wall(src_node,node) {
  var wall = node.walls[src_node.sid]
  if (wall) return wall
  else {
    var wall = {
      sid: ++SIDS,
      src_node: src_node,
      node: node,
    }
    SEL_LEVEL.walls[wall.sids] = wall
    src_node.walls[node.sid] = { wall: wall, node: node }
    node.walls[src_node.sid] = { wall: wall, node: src_node }
    return wall
  }
}

function kill_wall(src_node,node) {
  var wall = node.walls[src_node.sid]
  if (wall) {
    delete SEL_LEVEL.walls[wall.sid]
    delete node.walls[src_node.sid]
    delete src_node.walls[node.sid]
  }
}
function killall_walls(node) {

}

function new_node(point,src_node) {
  var node = get_node(point) || {
    sid: ++SIDS,
    peice_node: null,
    square: null,
    key: null,
    driver: null,
    src_node: null,
    handles: {},
    walls: {}
  }
  SEL_LEVEL.nodes[node.sid] = node
  if (!src_node) {
    if (MODE == 'PORTAL') {

    }
    return node
  }

  switch (MODE) {
    case 'WALL':
      node.peice_node = false
      var wall = new_wall(src_node,node)
      wall.gate = null
      set_gate(node,null)
      set_gate(src_node,null)
      return node
    case 'DOOR':
      node.peice_node = false
      var wall = new_wall(src_node,node)
      wall.gate = true
      set_gate(node,null)
      return node
    case 'HANDLE':
      kill_wall(src_node,node)

      if (check_handle(src_node,node)) return node
      if (node.src_node) {
        delete node.src_node.handles[node.sid]
        set_gate(node.src_node,null)
      }
      node.src_node = src_node
      src_node.handles[node.sid] = node
      node.peice_node = true
      for (var i in node.walls) {
        node.peice_node = false
        break
      }
      set_gate(node.src_node,null)
      return node
    case 'PORTAL':

  }
}
