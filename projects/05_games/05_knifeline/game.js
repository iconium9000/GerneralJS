sel_nodelog = console.log

PROJECT_NAME = 'KnifeLine'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

LINE_WIDTH = 5
NODE_RADIUS = 20
SMALL_RADIUS = 5
NODE_COLOR = 'white'
SANITY = 1e3

NEW_GAME_POLL_TIMEOUT = 20e3
CLNT_SIZE_INTERVAL = 4e3
SRVR_SIZE_INTERVAL = 8e3

CHANGE_TURN_INTERVAL = 5e3

SIZE = []
MIN_SCREEN_SIZE = [500, 500]
DEF_SIZE = [1920, 1080]
GAME_SIZE = DEF_SIZE

MSGS = []

// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')

  LOGIN_NAME = {}
  LOGIN_ID = {}
  LOGIN_COLOR = {}

  SIZE_ID = {}
  // setInterval(srvr_update_size, SRVR_SIZE_INTERVAL)

  setInterval(check_turns, CHANGE_TURN_INTERVAL)

}
GAME_CLNT_INIT = () => {
  log('init game clnt')

  LOGIN = null
  SECURITY_FUN.clnt_rqst_login({msg:''})

  setInterval(clnt_update_size, CLNT_SIZE_INTERVAL)
}

// -----------------------------------------------------------------------------
// SECURITY
// -----------------------------------------------------------------------------

DEFAULT_PASS = 'password'
BAD_LOGIN_TXT = 'Incorrect Password\n'
COLORS = ['#ff5050','#00ff80','#0080ff','#ff8000','#ff40ff',
  '#ffff40','#B22222','#00ffff', '#80ff00']
function get_color() {
  for (var i in COLORS) {
    var color = COLORS[i]
    if (!LOGIN_COLOR[color]) {
      return color
    }
  }
  return 'white'
}

function check_turns() {
  var new_mode = get_mode()
  if (new_mode) {
    if (GAME.mode != new_mode) {
      var turns = GAME.turns = []
      GAME.turn_idx = 0
      GAME.mode = new_mode
      var n_players = FU.count(GAME.players)
      var n_stat = STAT_FUNCTIONS[new_mode](n_players)

      for (var player in GAME.players){
        FU.forlen(n_stat, i => turns.push(player))
      }
      FU.shuffle(turns)
    }
    else {
      ++GAME.turn_idx
    }
  }

  GAME.turn = GAME.turns[GAME.turn_idx % GAME.turns.length]
  log('GAME.turn: ', GAME.turn)

  SECURITY_FUN.srvr_update_turn()
}

function check_player_turn(login, turn_type) {
  var mode = get_mode()
  var stat_name = FU.lookup(PLAYER_STATS, mode)
  var turn_idx = GAME.turns[GAME.turn_idx]

  if (mode && stat_name && mode == TURN_TYPE_MODE[turn_type]) {
    var player = GAME.players[login.color]
    var stat = player[stat_name]
    return stat > 0
  }
  else {
    return false
  }
}
function do_player_turn(login, turn_type, arg) {

  var color = turn_type.slice(0,5) == 'knife' ? KNIFE_COLOR : login.color
  var player = GAME.players[login.color]
  if (!player) return

  switch (turn_type){
  case 'new_node':
    var point = arg
    if (point[0] < GAME_SIZE[0] && point[1] < GAME_SIZE[1]) {
      var node = closest_node(point, 2 * NODE_RADIUS)
      if (node) {
        log(`${login.name} node to close`)
      } else {
        new_node(point)
        --player.n_nodes
      }
    }
    break
  case 'new_link':
    var node1 = GAME.nodes[arg[0]], node2 = GAME.nodes[arg[1]]
    var link = null
    if (node1 && node2) {
      link = new_link(node1, node2)
    }
    if (link) {
      --player.n_links
    }
    else {
      log(`${login.name} bad link`)
    }
    break
  case 'knife_node':
  case 'color_node':
    var node = GAME.nodes[arg]
    if (node && node.color == NODE_COLOR) {
      set_fountain(node, color)
      --player[turn_type == 'knife_node' ? 'n_knives' : 'n_fountains']
    }
    break
  case 'knife_split':
  case 'color_split':
    var link_point = get_link_point(arg)
    if (link_point) {
      split_link(link_point[0], link_point[1], color)
      --player[turn_type == 'knife_split' ? 'n_knives' : 'n_fountains']
    }
    break
  }

  log(`do_player_turn: '${login.name}' '${turn_type}'`)
  check_turns()
  SECURITY_FUN.srvr_update_map()
}

function start_new_game() {
  if (GAME.poll) {
    return
  }

  GAME = new_game(true, setTimeout(end_new_game_poll, NEW_GAME_POLL_TIMEOUT))
  HOST_MSG('clnt_join_game', null)

  log('starting new game')
}
function end_new_game_poll() {
  if (GAME.poll) {
    clearTimeout(GAME.timout)
    GAME.poll = false
    delete GAME.timeout

    var n_players = FU.count(GAME.players)
    if (n_players == 0) {
      GAME.over = true
      return
    }
    var n_nodes = STAT_FUNCTIONS.node(n_players)
    var n_links = STAT_FUNCTIONS.link(n_players)
    var n_fountains = STAT_FUNCTIONS.fountain(n_players)
    var n_knives = STAT_FUNCTIONS.knife(n_players)

    for (var color in GAME.players) {
      var login = LOGIN_COLOR[color]
      if (login) {
        GAME.players[color] = {
          name: login.name,
          n_nodes: n_nodes,
          n_links: n_links,
          n_fountains: n_fountains,
          n_knives: n_knives,
        }
      }
      else {
        delete GAME.players[color]
      }
    }

    log(`new game with ${n_players} player(s)`)
    SECURITY_FUN.srvr_update_map()
  }
}
function player_join_game(login) {
  GAME.players[login.color] = true
  if (check_all_clnts_in_game()) {
    end_new_game_poll()
  }
}
function check_all_clnts_in_game() {
  for (var i in SRVR_CLNTS) {
    var login = LOGIN_ID[i]
    if (login && !GAME.players[login.color]) {
      return false
    }
  }
  return true
}

var get_min_size = PT.vcc('vvv', (c,m,n) => n < c ? n < m ? m : n : c, 2)
function clnt_update_size() {
  HOST_MSG('srvr_update_size', [SRVR_CLNT_ID], SIZE)
  // log('clnt_update_size', SIZE)
}
function srvr_update_size() {
  GAME_SIZE = DEF_SIZE
  for (var id in SIZE_ID) {
    var size = SIZE_ID[id] ? SIZE_ID[id].size || DEF_SIZE : DEF_SIZE
    GAME_SIZE = get_min_size(GAME_SIZE, MIN_SCREEN_SIZE, size)
  }
  // log('srvr_update_size', GAME_SIZE, SIZE_ID)
  HOST_MSG('clnt_update_size', null, GAME_SIZE)
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
        log(`${msg.name} (${sndr}) bad login (srvr_rqst_login)`)
      }
    }
    else {
      var login = msg
      login.color = get_color()
      LOGIN_NAME[msg.name] = msg
      LOGIN_ID[sndr] = msg
      LOGIN_COLOR[login.color] = login
      HOST_MSG('clnt_good_login', [sndr], login.color)

      log(`new login: ${login.name} (${sndr}, ${login.color})`)
    }
  },
  clnt_good_login: ({msg}) => {
    alert(`you are now logged in as '${CLNT_NAME}'`)
    FOUNTAIN_COLOR = msg
    HOST_MSG('srvr_update_map', [SRVR_CLNT_ID])
    HOST_MSG('srvr_join_game', [SRVR_CLNT_ID], true)
  },
  srvr_game_edit: ({sndr, msg}) => {
    var login = LOGIN_ID[sndr]
    if (login) {
      if (check_player_turn(login, msg[0])) {
        do_player_turn(login, msg[0], msg[1])
      }
      else {
        log(`${login.name} bad turn ${msg[0]}`)
      }
    }
    else {
      HOST_MSG('clnt_rqst_login', [sndr], BAD_LOGIN_TXT)
      log(`${sndr} bad login (srvr_game_edit)`, sndr)
    }
  },
  srvr_update_map: () => {
    HOST_MSG('clnt_update_map', null, save_game(GAME))
    log('srvr_update_map')
  },
  clnt_update_map: ({sndr, msg}) => {
    if (sndr == SRVR_CLNT_ID && CLNT_ID != sndr) {
      read_game(msg)
      SEL_PROPS = solve_prop()
      PROP_START = USR_IO_EVNTS.nw
      log('clnt_update_map')
    }
  },
  clnt_join_game: ({sndr}) => {
    if (sndr == SRVR_CLNT_ID && CLNT_ID != sndr) {
      HOST_MSG('srvr_join_game', [sndr], confirm('Want to join the game?'))
    }
  },
  srvr_join_game: ({sndr, msg}) => {
    var login = LOGIN_ID[sndr]
    if (login) {
      if (GAME.players[login.color]) {
        log(`${login.name} (${sndr}) already in game`)
      }
      else if (GAME.poll) {
        player_join_game(login)
        log(`${login.name} (${sndr}) joined game`)
      } else {
        HOST_MSG('clnt_bad_join_game', [sndr])
        log(login.name, 'bad_join_game')
      }
    }
    else {
      HOST_MSG('clnt_rqst_login', [sndr], BAD_LOGIN_TXT)
      log(`${sndr} bad login (srvr_join_game)`, sndr)
    }
  },
  clnt_bad_join_game: ({sndr}) => {
    if (sndr == SRVR_CLNT_ID && sndr != CLNT_ID) {
      var rqst_new_game = confirm('Cannot join ongoing game\nRequest new Game?')
      if (rqst_new_game) {
        HOST_MSG('srvr_rqst_new_game', [sndr])
      }
    }
  },
  srvr_rqst_new_game: ({sndr}) => {
    var login = LOGIN_ID[sndr]
    if (login) {
      // TODO: check for GAME.over???
      start_new_game()

      log(`${login.name} (${sndr}) srvr_rqst_new_game`)
    }
    else {
      HOST_MSG('clnt_rqst_login', [sndr], BAD_LOGIN_TXT)
      log(`${sndr} bad login (srvr_rqst_new_game)`, sndr)
    }
  },
  srvr_snd_msg: ({sndr, msg}) => {
    var login = LOGIN_ID[sndr]
    if (login) {
      HOST_MSG('clnt_snd_msg', null, {
        name: login.name,
        color: login.color,
        msg: msg
      })
    }
  },
  clnt_snd_msg: ({msg}) => {
    MSGS.push(msg)
  },
  srvr_update_size: ({sndr, msg}) => {
    if (SIZE_ID[sndr]) {
      clearTimeout(SIZE_ID[sndr].timeout)
    }
    SIZE_ID[sndr] = {
      size: msg,
      timeout: setTimeout(() => delete SIZE_ID[sndr], SRVR_SIZE_INTERVAL)
    }
    srvr_update_size()
  },
  clnt_update_size: ({sndr, msg}) => {
    if (sndr == SRVR_CLNT_ID) {
      GAME_SIZE = msg
    }
  },
  srvr_update_turn: () => {
    HOST_MSG('clnt_update_turn', null, GAME.turn)
  },
  clnt_update_turn: () => {
    
  }
}

// -----------------------------------------------------------------------------
// REQUESTS
// -----------------------------------------------------------------------------




// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------

MODE = 'node'
SEL_NODE_IDX = null
FOUNTAIN_COLOR = NODE_COLOR
KNIFE_COLOR = 'black'
SEL_PROP = null
SEL_PROPS = null
PROP_START = null
PROP_SPEED = 5e-2

GAME = new_game(false, Infinity)
function new_game(poll, timeout) {
  return {
    players: {},
    poll: poll,
    mode: null,
    turns: [],
    turn_idx: 0,
    over: false,
    timeout: timeout,
    nodes: [],
    links: []
  }
}
STAT_FUNCTIONS = {
  node: n => 3,
  link: n => n < 6 ? n + 1 : 6,
  fountain: n => 2,
  knife: n => 2,
}
PLAYER_STATS = {
  n_nodes: 'node',
  n_links: 'link',
  n_fountains: 'fountain',
  n_knives: 'knife',
}
TURN_TYPE_MODE = {
  new_node: 'node',
  new_link: 'link',
  knife_node: 'knife',
  color_node: 'fountain',
  knife_split: 'knife',
  color_split: 'fountain',
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

function get_prop() {
  var prop = {
    node_color: [],
    node_stop: [],
    links: []
  }
  for (var i in GAME.nodes) {
    var node = GAME.nodes[i]
    var color = node.color
    prop.node_color[i] = color
  }
  set_node_stop(prop)
  for (var i in GAME.links) {
    var link = GAME.links[i]
    prop.links[i] = {
      1: { idx: link.node1.idx, length: 0 },
      2: { idx: link.node2.idx, length: 0 },
      length: link.length
    }
  }
  return prop
}
function set_node_stop({node_color, node_stop}) {
  node_color.forEach((c,i) => node_stop[i] = c==NODE_COLOR || c==KNIFE_COLOR)
}
function copy_prop(prop) {
  return JSON.parse(JSON.stringify(prop))
}
function min_prop_length({node_stop, links}) {
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
function do_prop({node_color, node_stop, links}, prop_length) {

  var over_nodes = []
  // log('prop_length', prop_length)
  links.forEach((prop_link, link_idx) => {
    if (prop_link.locked) return

    var l1 = prop_link[1], l2 = prop_link[2], length = prop_link.length
    var c1 = node_color[l1.idx], c2 = node_color[l2.idx]
    var f1 = !node_stop[l1.idx], f2 = !node_stop[l2.idx]

    // log('l1,l2,len', l1.length, l2.length, length)
    if (f1) l1.length += prop_length
    if (f2) l2.length += prop_length

    var over = (l1.length + l2.length - length)
    if (over >= 0) {
      // log('over,l1,l2,lnk', over, l1.idx, l2.idx, link_idx)
      prop_link.locked = true

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

function solve_prop() {
  var prop = get_prop()
  var length = 0, prop_length = 0
  var props = [[length, prop]]

  var sanity = SANITY
  while(isFinite(prop_length = min_prop_length(prop)) && --sanity > 0) {
    prop = copy_prop(prop)
    do_prop(prop, prop_length)
    set_node_stop(prop)
    props.push([length += prop_length, prop])
  }

  if (sanity == 0) log('SANITY')

  // return null

  return props
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

  return JSON.stringify([nodes, links, game.players, game.turn])
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

  GAME.turn = save[3]
  return GAME
}

function get_scores({node_color, links}) {
  var colors = {}
  for (var i in links) {
    var prop_link = links[i]
    var l1 = prop_link[1], l2 = prop_link[2], length = prop_link.length
    var c1 = node_color[l1.idx], c2 = node_color[l2.idx]
    colors[c1] = l1.length + (colors[c1] || 0)
    colors[c2] = l2.length + (colors[c2] || 0)
  }
  return colors
}

function get_mode() {
  for (var state_name in PLAYER_STATS) {
    for (var color in GAME.players) {
      var player = GAME.players[color]
      if (player[state_name]) {
        return PLAYER_STATS[state_name]
      }
    }
  }
}

// -----------------------------------------------------------------------------
// DISPLAY GAME
// -----------------------------------------------------------------------------

function draw_game_size() {
  PT.drawRect(G, [], GAME_SIZE, NODE_COLOR)
}
function draw_links() {
  for (var i in GAME.links) {
    var link = GAME.links[i]
    var p1 = link.node1.position, p2 = link.node2.position
    if (SEL_PROP) {
      draw_prop_link(SEL_PROP, p1, p2, SEL_PROP.links[i])
    }
    else {
      PT.drawLine(G, p1, p2, NODE_COLOR)
    }
  }
}
function draw_prop_link({node_color, links}, p1, p2, prop_link) {
  var l1 = prop_link[1], l2 = prop_link[2], length = prop_link.length
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
    var color = SEL_PROP ? SEL_PROP.node_color[i] : node.color
    var real_color = color != NODE_COLOR && node.color != NODE_COLOR
    var big_mode = MODE == 'node' || MODE == 'link'
    var radius = big_mode || real_color ? NODE_RADIUS : SMALL_RADIUS
    PT.fillCircle(G, node.position, radius, color)
    if (color == KNIFE_COLOR) {
      PT.drawCircle(G, node.position, radius, NODE_COLOR)
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
  var sel_node = GAME.nodes[SEL_NODE_IDX]

  if (sel_node) {
    var position_a = sel_node.position
    var position_b = USR_IO_MWS
    var no_cross = node && no_link_cross(position_a, position_b)
    G.setLineDash(no_cross ? [] : [NODE_RADIUS,2 * LINE_WIDTH])
    PT.drawLine(G, position_a, position_b, NODE_COLOR)
    G.setLineDash([])
  }

  if (USR_IO_MWS.hsDn && node) {
    if (sel_node) {
      var link_idxs = [sel_node.idx, node.idx]
      HOST_MSG('srvr_game_edit', [SRVR_CLNT_ID], ['new_link',link_idxs])
    }
    SEL_NODE_IDX = node.idx
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

function draw_prop() {
  if (SEL_PROPS && SEL_PROPS.length) {
    try {
      var max_length = SEL_PROPS[SEL_PROPS.length-1][0]
      var prop_length = (USR_IO_EVNTS.nw - PROP_START) * PROP_SPEED
      if (prop_length > max_length) prop_length = max_length
      // log(SEL_PROPS, prop_length)

      var temp_prop = null
      for (var i in SEL_PROPS) {
        var sel_prop = SEL_PROPS[i]
        if (prop_length >= sel_prop[0]) {
          temp_prop = sel_prop
        }
      }

      if (temp_prop) {
        SEL_PROP = copy_prop(temp_prop[1])
        do_prop(SEL_PROP, prop_length - temp_prop[0])
      }
      else {
        throw 'error'
      }
    }
    catch (e) {
      console.error(e)
      SEL_PROP = SEL_PROPS = null
    }
  }
}
function draw_scores() {
  if (SEL_PROP) {
    var scores = get_scores(SEL_PROP)
    var score_array = []
    for (var color in GAME.players) {
      var score = scores[color]
      score_array.push([color,isNaN(score) ? 0 : score])
    }
    score_array.sort((a,b)=>b[1]-a[1])

    var stat = FU.lookup(PLAYER_STATS, MODE)
    for (var i = 0; i < score_array.length; ++i) {
      var color = score_array[i][0]
      var player = GAME.players[color]
      var score = Math.round(score_array[i][1])
      G.fillStyle = color
      var pscore = `(Score ${score})`
      var pstat = stat ? `(Number of ${MODE}(s) ${player[stat]})` : ''
      G.fillText(`${player.name} ${pscore} ${pstat}`, 20, 20 * (3 + i))
    }
  }
}

function draw_msgs() {
  MSGS.splice(0, MSGS.length - 5)

  G.textAlign = 'right'
  for (var i = 0; i < MSGS.length; ++i) {
    var msg = MSGS[MSGS.length - i - 1]
    if (msg) {
      G.fillStyle = msg.color
      G.fillText(`${msg.name}: ${msg.msg}`, WH[0] - 20, WH[1] - 20 * (i + 1))
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

  G.font = '20px cortier'
  G.textAlign = 'left'
  G.fillStyle = FOUNTAIN_COLOR
  G.fillText(`Your Name: '${CLNT_NAME}'`, 20, 20)
  if (GAME.turn == FOUNTAIN_COLOR) {
    G.textAlign = 'right'
    G.fillText('It is your turn', WH[0] - 20, 20)
  }
  G.textAlign = 'center'
  G.fillStyle = 'white'
  G.fillText('Restart (R)',CNTR[0],20)


  G.textAlign = 'left'
  G.lineWidth = LINE_WIDTH

  MODE = get_mode()

  if (SIZE[0] != WH[0] || SIZE[1] != WH[1]) {
    // log('update', SIZE, WH)
    SIZE = PT.copy(WH)
    clnt_update_size()
  }

  draw_game_size()
  draw_prop()

  // if (USR_IO_KYS.hsDn['m']) {
  //   MODE = prompt('set mode')
  //   SEL_NODE_IDX = null
  // }
  // if (USR_IO_KYS.hsDn['n']) {
  //   MODE = 'node'
  //   log('mode switched to node')
  // }
  // if (USR_IO_KYS.hsDn['l']) {
  //   MODE = 'link'
  //   log('mode switched to link')
  // }
  // if (USR_IO_KYS.hsDn['f']) {
  //   MODE = 'fountain'
  //   log('mode switched to fountain')
  // }
  // if (USR_IO_KYS.hsDn['k']) {
  //   MODE = 'knife'
  //   log('mode switched to knife')
  // }
  if (USR_IO_KYS.hsDn['q'] && SEL_NODE_IDX) {
    SEL_NODE_IDX = null
    log('cleared selected node')
  }
  if (USR_IO_KYS.hsDn['m']) {
    HOST_MSG('srvr_snd_msg', [SRVR_CLNT_ID], prompt('enter message'))
  }
  // if (USR_IO_KYS.hsDn['c']) {
  //   FOUNTAIN_COLOR = prompt('FOUNTAIN_COLOR')
  // }
  if (USR_IO_KYS.hsDn['r']) {
    HOST_MSG('srvr_rqst_new_game', [SRVR_CLNT_ID])
  }

  draw_nodes()
  draw_links()
  draw_scores()
  draw_msgs()

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

  //
  // for (var i = 0; i < COLORS.length; ++i) {
  //   var color = COLORS[i]
  //   G.fillStyle = color
  //   G.fillText(color, WH[0]-20, 100 + i * 20)
  // }
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
