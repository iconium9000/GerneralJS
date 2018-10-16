log = console.log

PROJECT_NAME = 'MazeGame v4'
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
// CONSTs
// -----------------------------------------------------------------------------

NODE_RADIUS = 10
NODE_DEF_TURN = 0

LEVELS = []
SEL_LEVEL = new_level('Level 1')

// -----------------------------------------------------------------------------
// Server IO
// -----------------------------------------------------------------------------

function save_game() {
  var levels = []
  for (var i in LEVELS) {
    var level = LEVELS[i]
    var node_table = {}
    var node_idx = 0
    var node_info = []
    var link_info = []
    for (var i in level.nodes) {
      var node = level.nodes[i]
      node_table[node.sid] = node_idx++
      node_info.push(node[0],node[1],node[2])
    }
    for (var i in level.links) {
      var link = level.links[i]
      link_info = [node_table[link[0]],node_table[link[1]],link[2]]
    }
    levels.push(level.name,node_info,link_info)
  }
  return levels
}
function read_save(levels) {
  LEVELS = []
  for (var i = 0; i < levels.length; i += 3) {
    var name = levels[i]
    var ni = levels[i+1]
    var li = levels[i+2]
    new_level(name)

    for (var j = 0; j < node_info.length; j += 3) {
      new_node([ni[j],ni[j+1]],ni[j+2])
    }
    var nodes = SEL_LEVEL.nodes
    for (var j = 0; j < link_info.length; j += 3) {
      new_link(nodes[li[j]],nodes[li[j+1]],li[j+2])
    }
  }
  SEL_LEVEL = LEVELS[0] || new_level('Level 1')
}

// -----------------------------------------------------------------------------
// Codes
// -----------------------------------------------------------------------------

CODE_SQR_HANDLE = 0             // 0 Sqr Handle
CODE_CIR_HANDLE = 1             // 1 Cir Handle
CODE_SQR_HANDLE_DRIVER = 2      // 2 Sqr Handle/Driver
CODE_CIR_HANDLE_DRIVER = 3      // 3 Cir Handle/Driver
CODE_SQR_HANDLE_KEY = 4         // 4 Sqr Handle/Key
CODE_CIR_HANDLE_KEY = 5         // 5 Cir Handle/Key
CODE_SQR_HANDLE_DRIVER_KEY = 6  // 6 Sqr Handle/Driver/Key
CODE_CIR_HANDLE_DRIVER_KEY = 7  // 7 Cir Handle/Driver/Key
CODE_WALL = 8                   // 8 Wall
CODE_LINK = 9                   // 9 Link
CODE_WALL_LINK = 10             // a Wall/Link
CODE_DOOR = 11                  // b Door
CODE_PORTAL = 12                // c Portal

function is_handle(code) {
  return code < CODE_WALL
}
function is_portal(code) {
  return code == CODE_PORTAL
}
function is_solid(code) {
  return code == CODE_WALL || code == CODE_WALL_LINK || code == CODE_DOOR
}
function is_sqr(code) {
  return code < 8 && (code&1)
}
function is_cir(code) {
  return code < 8 && !(code&1)
}
function is_gate(code) {
  return code != CODE_WALL
}
function is_net(code) {
  return code < CODE_WALL || code == CODE_PORTAL
}
function is_key(code) {
  return code < CODE_WALL && (code&4)
}
function is_driver(code) {
  return code < CODE_WALL && (code&2)
}
function get_radius(code) {
  return NODE_RADIUS
}

// -----------------------------------------------------------------------------
// Level Functions
// -----------------------------------------------------------------------------

function new_level(name) {
  LEVELS.push(SEL_LEVEL = {
    sid: 0,
    idx: LEVELS.length,
    nodes: {},
    links: {},
    nets: {},
    portals: {},
    state: {[],[],null},
  })
}
function get_node(point) {
  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]
    if (PT.dist(point,node) < get_radius(node.code)) {
      return node
    }
  }
  return null
}
function new_node(point,code) {
  var node = get_node(point)
  if (!node) {
    // @NODE
    node = {
      0: point[0],
      1: point[1],
      sid: SEL_LEVEL.sid++,
      code: code,
      gate: null,
      links: null,
      nets: null
    }
    SEL_LEVEL.nodes[node.sid] = node
  }
  return set_node_code(node,code)
}
function set_node_code(node,code) {
  var old_code = node.code
  if (old_code == code) return node

  // @LEVEL_PORTAL
  if (is_portal(code)) SEL_LEVEL.portals[node.sid] = node
  else delete SEL_LEVEL.portals[node.sid]


}
function new_link(node_a,node_b,code) {
  var link = node_a.links[node_b.sid]
  if (!link) {
    // @LINK
    link = {
      0: node_a,
      1: node_b,
      code: code,
    }
    SEL_LEVEL.links[link.sid] = link

    // @NODE_LINK
    node_a.links[node_b.sid] = [link,node_b]
    node_b.links[node_a.sid] = [link,node_a]
  }
  return set_link_code(link,code)
}
function set_link_code(link,code) {
  var old_code = link.code
  if (old_code == code) return link



}
