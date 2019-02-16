log = console.log

PROJECT_NAME = 'Line Game'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

LINE_WIDTH = 5
NODE_RADIUS = 20
NODE_COLOR = 'white'
SANITY = 1e3



// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')

  LOGIN_NAME = {}
  LOGIN_ID = {}
  LOGIN_COLOR = {}
}



GAME_CLNT_INIT = () => {
  log('init game clnt')

  LOGIN = null
  SECURITY_FUN.clnt_rqst_login({msg:''})
}

// -----------------------------------------------------------------------------
// SECURITY
// -----------------------------------------------------------------------------

DEFAULT_PASS = 'password'
BAD_LOGIN_TXT = 'Incorrect Password\n'
COLORS = ['crimson','blue','green','tan','turquoise',
  'burlywood','coral','cyan', 'orange', 'violet', 'purple', 'skyblue']
function get_color() {
  for (var i in COLORS) {
    var color = COLORS[i]
    if (!LOGIN_COLOR[color]) {
      return color
    }
  }
  return 'white'
}

function check_player_turn(login, turn_type) {
  return true
}
function do_player_turn(login, turn_type, arg) {
  var color = turn_type.slice(0,5) == 'knife' ? KNIFE_COLOR : login.color

  switch (turn_type){
  case 'new_node':
    var point = arg
    var node = closest_node(point, 2 * NODE_RADIUS)
    if (!node) new_node(point)
    break
  case 'new_link':
    var node1 = GAME.nodes[arg[0]], node2 = GAME.nodes[arg[1]]
    if (node1 && node2) {
      new_link(node1, node2)
    }
    break
  case 'knife_node':
  case 'color_node':
    var node = GAME.nodes[arg]
    if (node && node.color == NODE_COLOR) {
      set_fountain(node, color)
    }
    break
  case 'knife_split':
  case 'color_split':
    var link_point = get_link_point(arg)
    if (link_point) {
      split_link(link_point[0], link_point[1], color)
    }
    break
  }

  SECURITY_FUN.srvr_update_map()
}

// msg start 'srvr' rcv by srvr, start 'clnt' rcv by clnt
SECURITY_FUN = {
  clnt_rqst_login: ({msg}) => {
    var pass = prompt(`${msg}Please log in as '${CLNT_NAME}'`, DEFAULT_PASS)
    HOST_MSG('srvr_rqst_login', [SRVR_CLNT_ID], {
      name: CLNT_NAME,
      pass: pass || DEFAULT_PASS
    })
  },
  srvr_rqst_login: ({sndr,msg}) => {
    var login = LOGIN_NAME[msg.name]
    if (login) {
      if (login.pass == msg.pass) {
        LOGIN_ID[sndr] = login
        HOST_MSG('clnt_good_login', [sndr], login.color)
      }
      else {
        HOST_MSG('clnt_rqst_login', [sndr], BAD_LOGIN_TXT)
      }
    }
    else {
      var login = msg
      login.color = get_color()
      LOGIN_NAME[msg.name] = msg
      LOGIN_ID[sndr] = msg
      LOGIN_COLOR[login.color] = login
      HOST_MSG('clnt_good_login', [sndr], login.color)
    }

    // log(sndr, LOGIN_NAME, LOGIN_ID, LOGIN_COLOR)
  },
  clnt_good_login: ({msg}) => {
    alert(`you are now logged in as '${CLNT_NAME}'`)
    FOUNTAIN_COLOR = msg
    HOST_MSG('srvr_update_map', [SRVR_CLNT_ID])
  },
  srvr_game_edit: ({sndr, msg}) => {
    var login = LOGIN_ID[sndr]
    if (login) {
      if (check_player_turn(login, msg[0])) {
        do_player_turn(login, msg[0], msg[1])
      }
    }
    else {
      HOST_MSG('clnt_rqst_login', [sndr], BAD_LOGIN_TXT)
    }
  },
  srvr_update_map: () => {
    HOST_MSG('clnt_update_map', null, save_game(GAME))
  },
  clnt_update_map: ({sndr, msg}) => {
    if (sndr == SRVR_CLNT_ID && CLNT_ID != sndr) {
      read_game(msg)
      SEL_NODE = null
      SEL_SPREADS = solve_spread()
      SPREAD_START = USR_IO_EVNTS.nw
    }
  }
}

// -----------------------------------------------------------------------------
// REQUESTS
// -----------------------------------------------------------------------------




// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------

MODE = 'node'
SEL_NODE = null
FOUNTAIN_COLOR = NODE_COLOR
KNIFE_COLOR = 'black'
SEL_SPREAD = null
SEL_SPREADS = null
SPREAD_START = null
SPREAD_SPEED = 5e-2

GAME = {
  nodes: [],
  links: []
}

function new_node(position) {
  var node = {
    idx: GAME.nodes.length,
    position: PT.copy(position),
    links: {},
    color: NODE_COLOR
  }
  GAME.nodes.push(node)
  return node
}
function new_link(node1, node2) {
  if (node1 == node2 || node1.links[node2.idx]) return
  if (!no_link_cross(node1.position, node2.position)) return

  var link = {
    node1: node1,
    node2: node2,
    length: PT.dist(node1.position, node2.position)
  }
  node1.links[node2.idx] = {link: link, node: node2, side: 1}
  node2.links[node1.idx] = {link: link, node: node1, side: 2}
  for (var i = 0; i < GAME.links.length; ++i) {
    if (!GAME.links[i]) {
      link.idx = i
      return GAME.links[i] = link
    }
  }
  link.idx = GAME.links.length
  GAME.links.push(link)
  return link
}
function split_link(link, point, color) {
  delete GAME.links[link.idx]
  delete link.node1.links[link.node2.idx]
  delete link.node2.links[link.node1.idx]

  var node = new_node(point)
  new_link(link.node1, node)
  new_link(link.node2, node)
  set_fountain(node, color)
}
function closest_node(position, radius) {
  for (var i in GAME.nodes) {
    var node = GAME.nodes[i]
    if (PT.dist(node.position, position) < radius) {
      return node
    }
  }
  return null
}
function get_link_point(start_point) {
  var closest_points = []
  for (var i in GAME.links) {
    var link = GAME.links[i]
    var p1 = link.node1.position
    var p2 = link.node2.position

    var point = PT.closest_point_on_line(start_point, p1, p2)
    if (point && PT.dist(start_point, point) < NODE_RADIUS) {
      closest_points.push([link, point])
    }
  }

  var link_point = closest_points.pop()
  if (link_point && !closest_points.length) {
    return link_point
  }
  else {
    return null
  }
}
function no_link_cross(position_a, position_b) {
  for (var i in GAME.links) {
    var link = GAME.links[i]
    var p1 = link.node1.position
    var p2 = link.node2.position

    if (PT.lineCross(position_a,position_b,p1,p2)) {
      return false
    }
  }
  return true
}
function set_fountain(node, color) {
  node.color = color
}

function get_spread() {
  var spread = {
    node_color: [],
    node_stop: [],
    links: []
  }
  for (var i in GAME.nodes) {
    var node = GAME.nodes[i]
    var color = node.color
    spread.node_color[i] = color
  }
  set_node_stop(spread)
  for (var i in GAME.links) {
    var link = GAME.links[i]
    spread.links[i] = {
      1: { idx: link.node1.idx, length: 0 },
      2: { idx: link.node2.idx, length: 0 },
      length: link.length
    }
  }
  return spread
}
function set_node_stop({node_color, node_stop}) {
  node_color.forEach((c,i) => node_stop[i] = c==NODE_COLOR || c==KNIFE_COLOR)
}
function copy_spread(spread) {
  return JSON.parse(JSON.stringify(spread))
}
function min_spread_length({node_stop, links}) {
  var min = Infinity
  for (var i in links) {
    var link = links[i]
    if (link.locked) continue

    var l1 = link[1], l2 = link[2]
    var f1 = !node_stop[l1.idx], f2 = !node_stop[l2.idx]
    if (f1 || f2) {
      var len = link.length - l1.length - l2.length

      if (f1 && f2) len /= 2

      if (len && len < min) {
        min = len
      }
    }
  }
  return min
}
function do_spread({node_color, node_stop, links}, spread_length) {

  var over_nodes = []
  // log('spread_length', spread_length)
  links.forEach((spread_link, link_idx) => {
    if (spread_link.locked) return

    var l1 = spread_link[1], l2 = spread_link[2], length = spread_link.length
    var c1 = node_color[l1.idx], c2 = node_color[l2.idx]
    var f1 = !node_stop[l1.idx], f2 = !node_stop[l2.idx]

    // log('l1,l2,len', l1.length, l2.length, length)
    if (f1) l1.length += spread_length
    if (f2) l2.length += spread_length

    var over = (l1.length + l2.length - length)
    if (over >= 0) {
      // log('over,l1,l2,lnk', over, l1.idx, l2.idx, link_idx)
      spread_link.locked = true

      if (f1 && f2) {
        l1.length -= over / 2
        l2.length -= over / 2
      }
      else if (f1 && c2 != KNIFE_COLOR) {
        var over_node = over_nodes[l2.idx] = over_nodes[l2.idx] || []
        over_node.push(c1)
      }
      else if (f2 && c1 != KNIFE_COLOR) {
        var over_node = over_nodes[l1.idx] = over_nodes[l1.idx] || []
        over_node.push(c2)
      }
    }
  })

  // log('over_nodes', over_nodes)
  for (var i in over_nodes) {
    var over_node = over_nodes[i]
    node_color[i] = over_node[Math.floor(Math.random() * over_node.length)]
  }
}

function solve_spread() {
  var spread = get_spread()
  var length = 0, spread_length = 0
  var spreads = [[length, spread]]

  var sanity = SANITY
  while(isFinite(spread_length = min_spread_length(spread)) && --sanity > 0) {
    spread = copy_spread(spread)
    do_spread(spread, spread_length)
    set_node_stop(spread)
    spreads.push([length += spread_length, spread])
  }

  if (sanity == 0) log('SANITY')

  // return null

  return spreads
}

function save_game(game) {
  var nodes = []
  for (var i in game.nodes) {
    var node = game.nodes[i]
    nodes.push([node.position, node.color])
  }
  var links = []
  for (var i in game.links) {
    var link = game.links[i]
    links.push([link.node1.idx, link.node2.idx])
  }
  return JSON.stringify([nodes, links, game.players])
}
function read_game(txt) {
  var save = JSON.parse(txt)
  GAME = {
    nodes: [],
    links: [],
    players: save[2]
  }

  var save_nodes = save[0]
  for (var i in save_nodes) {
    var position = save_nodes[i][0]
    var color = save_nodes[i][1]

    var node = new_node(position)
    set_fountain(node, color)
  }

  var save_links = save[1]
  for (var i in save_links) {
    var node1 = GAME.nodes[save_links[i][0]]
    var node2 = GAME.nodes[save_links[i][1]]
    new_link(node1, node2)
  }
  return GAME
}

function get_scores({node_color, links}) {
  var colors = {}
  for (var i in links) {
    var spread_link = links[i]
    var l1 = spread_link[1], l2 = spread_link[2], length = spread_link.length
    var c1 = node_color[l1.idx], c2 = node_color[l2.idx]
    colors[c1] = l1.length + (colors[c1] || 0)
    colors[c2] = l2.length + (colors[c2] || 0)
  }
  return colors
}

// -----------------------------------------------------------------------------
// DISPLAY GAME
// -----------------------------------------------------------------------------

function draw_links() {
  for (var i in GAME.links) {
    var link = GAME.links[i]
    var p1 = link.node1.position, p2 = link.node2.position
    if (SEL_SPREAD) {
      draw_spread_link(SEL_SPREAD, p1, p2, SEL_SPREAD.links[i])
    }
    else {
      PT.drawLine(G, p1, p2, NODE_COLOR)
    }
  }
}
function draw_spread_link({node_color, links}, p1, p2, spread_link) {
  var l1 = spread_link[1], l2 = spread_link[2], length = spread_link.length
  var c1 = node_color[l1.idx], c2 = node_color[l2.idx]

  var pa = PT.vec(p1, PT.unit(PT.sub(p2, p1)), l1.length)
  var pb = PT.vec(p2, PT.unit(PT.sub(p1, p2)), l2.length)
  if (l1.length) {
    PT.drawLine(G, p1, pa, c1)
  }
  if (l2.length) {
    PT.drawLine(G, pb, p2, c2)
  }
  if (length > l1.length + l2.length) {
    PT.drawLine(G, pa, pb, NODE_COLOR)
  }
}
function draw_nodes() {
  for (var i in GAME.nodes) {
    var node = GAME.nodes[i]
    var color = SEL_SPREAD ? SEL_SPREAD.node_color[i] : node.color
    PT.fillCircle(G, node.position, NODE_RADIUS, color)
    if (color == KNIFE_COLOR) {
      PT.drawCircle(G, node.position, NODE_RADIUS, NODE_COLOR)
    }
  }
}
function node_mode(node) {
  if (USR_IO_MWS.hsDn) {
    if (node) {
      // TODO
    } else {
      var point = PT.copy(USR_IO_MWS)
      HOST_MSG('srvr_game_edit', [SRVR_CLNT_ID], ['new_node', point])
    }
  }
}
function link_mode(node) {
  if (SEL_NODE) {
    var position_a = SEL_NODE.position
    var position_b = USR_IO_MWS
    var no_cross = node && no_link_cross(position_a, position_b)
    G.setLineDash(no_cross ? [] : [NODE_RADIUS,2 * LINE_WIDTH])
    PT.drawLine(G, position_a, position_b, NODE_COLOR)
    G.setLineDash([])
  }

  if (USR_IO_MWS.hsDn) {
    if (SEL_NODE && node) {
      // new_link(node, SEL_NODE)

      var link_idxs = [SEL_NODE.idx, node.idx]
      HOST_MSG('srvr_game_edit', [SRVR_CLNT_ID], ['new_link',link_idxs])
    }
    SEL_NODE = node
  }
}
function split_mode(node, color) {
  if (node) {
    if (node.color == NODE_COLOR) {
      PT.fillCircle(G, node.position, NODE_RADIUS, color)
      if (color == KNIFE_COLOR) {
        PT.drawCircle(G, node.position, NODE_RADIUS, NODE_COLOR)
      }
      if (USR_IO_MWS.hsDn) {
        if (color == KNIFE_COLOR) {
          HOST_MSG('srvr_game_edit', [SRVR_CLNT_ID], ['knife_node', node.idx])
        }
        else {
          HOST_MSG('srvr_game_edit', [SRVR_CLNT_ID], ['color_node', node.idx])
        }
      }
    }
  }
  else {
    var link_point = get_link_point(USR_IO_MWS)
    if (link_point) {
      var link = link_point[0], point = link_point[1]
      PT.fillCircle(G, point, NODE_RADIUS, color)
      if (color == KNIFE_COLOR) {
        PT.drawCircle(G, point, NODE_RADIUS, NODE_COLOR)
      }

      if (USR_IO_MWS.hsDn) {
        var point = PT.copy(USR_IO_MWS)
        if (color == KNIFE_COLOR) {
          HOST_MSG('srvr_game_edit', [SRVR_CLNT_ID], ['knife_split', point])
        }
        else {
          HOST_MSG('srvr_game_edit', [SRVR_CLNT_ID], ['color_split', point])
        }
      }
    }
  }
}

function draw_spread() {
  if (SEL_SPREADS && SEL_SPREADS.length) {
    try {
      var max_length = SEL_SPREADS[SEL_SPREADS.length-1][0]
      var spread_length = (USR_IO_EVNTS.nw - SPREAD_START) * SPREAD_SPEED
      if (spread_length > max_length) spread_length = max_length
      // log(SEL_SPREADS, spread_length)

      var temp_spread = null
      for (var i in SEL_SPREADS) {
        var sel_spread = SEL_SPREADS[i]
        if (spread_length >= sel_spread[0]) {
          temp_spread = sel_spread
        }
      }

      if (temp_spread) {
        SEL_SPREAD = copy_spread(temp_spread[1])
        do_spread(SEL_SPREAD, spread_length - temp_spread[0])
      }
      else {
        throw 'error'
      }
    }
    catch (e) {
      console.error(e)
      SEL_SPREAD = SEL_SPREADS = null
    }
  }
}

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH,2)

  G.textAlign = 'center'
  G.fillStyle = 'white'
  G.font = '20px cortier'
  G.fillText('Restart (R)',CNTR[0],20)

  G.textAlign = 'left'
  G.lineWidth = LINE_WIDTH


  draw_spread()

  if (USR_IO_KYS.hsDn['m']) {
    MODE = prompt('set mode')
    SEL_NODE = null
  }
  if (USR_IO_KYS.hsDn['n']) {
    MODE = 'node'
    log('mode switched to node')
  }
  if (USR_IO_KYS.hsDn['l']) {
    MODE = 'link'
    log('mode switched to link')
  }
  if (USR_IO_KYS.hsDn['f']) {
    MODE = 'fountain'
    log('mode switched to fountain')
  }
  if (USR_IO_KYS.hsDn['k']) {
    MODE = 'knife'
    log('mode switched to knife')
  }
  if (USR_IO_KYS.hsDn['q'] && SEL_NODE) {
    SEL_NODE = null
    log('cleared selected node')
  }
  if (USR_IO_KYS.hsDn['c']) {
    FOUNTAIN_COLOR = prompt('FOUNTAIN_COLOR')
  }

  draw_nodes()
  draw_links()
  if (SEL_SPREAD) {
    var scores = get_scores(SEL_SPREAD)
    var score_array = []
    for (var c in scores) {
      var score = scores[c]
      if (score) {
        score_array.push([c,score])
      }
    }
    score_array.sort((a,b)=>b[1]-a[1])

    for (var i = 0; i < score_array.length; ++i) {
      var color = score_array[i][0]
      var score = Math.round(score_array[i][1])
      G.fillStyle = color
      G.fillText(score, 20, 20 * (1 + i))
    }
  }

  var node = closest_node(USR_IO_MWS, NODE_RADIUS)
  if (MODE == 'node') {
    node_mode(node)
  }
  else if (MODE == 'link') {
    link_mode(node)
  }
  else if (MODE == 'fountain' || MODE == 'knife') {
    var color = MODE == 'knife' ? KNIFE_COLOR : FOUNTAIN_COLOR
    split_mode(node, color)
  }
}


// -----------------------------------------------------------------------------
// IO
// -----------------------------------------------------------------------------

GAME_MSG = (key, sndr, rcvr, msg) => {
  var arg = { key: key, sndr: sndr, rcvr: rcvr, msg: msg }

  // SECURITY
  if (SECURITY_FUN[key]) return SECURITY_FUN[key](arg)

  log(key, sndr, rcvr, msg)
}
