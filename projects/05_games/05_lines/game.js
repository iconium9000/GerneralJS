log = console.log

PROJECT_NAME = 'Line Game'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

// POLL_TIMER = 20e3
// POLL = null

LINE_WIDTH = 5
NODE_RADIUS = 20
NODE_COLOR = 'white'
// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')

  // LOGINS = []
}



GAME_CLNT_INIT = () => {
  log('init game clnt')

  // clnt_login()
}

// -----------------------------------------------------------------------------
// SECURITY
// -----------------------------------------------------------------------------

// PLAYERS = []
//
//
//
// function pass_hash(pass) {
//   return pass
// }
// function check_hash(real,check) {
//   return real == check
// }
// function clnt_login() {
//   LOGIN = null
//
//   var phrase1 = `Please enter a password to login as ${CLNT_NAME}:`
//   var phrase2 = `THIS IS NOT SECURE, DONT USE A GOOD PASSWORD`
//   var default_pass = 'password'
//   var password = prompt(`${phrase1}\n${phrase2}`,default_pass)
//
//   HOST_MSG('check_pass',[SRVR_CLNT_ID],{
//     pass: pass_hash(password || default_pass),
//     name: CLNT_NAME
//   })
// }
// function srvr_check_pass(clnt_id,{pass,name}) {
//   var login = LOGINS[name]
//
//   if (!login) {
//     login = LOGINS[name] = {
//       pass: pass,
//       name: name
//     }
//   }
//   else if (!check_hash(login.pass,pass)) {
//     login = null
//   }
//
//   if (login) {
//     HOST_MSG('good_pass',[clnt_id],login)
//   }
//   else HOST_MSG('bad_pass',[clnt_id])
// }
// function check_login(clnt_id, {pass,name}) {
//   var login = LOGINS[name]
//   if (login && check_hash(login.pass, pass)) {
//     return true
//   }
//
//   HOST_MSG('bad_pass',[clnt_id])
//   return false
// }
// function clnt_good_pass(login) {
//   LOGIN = login
//   alert(`You are now logged in as ${login.name}`)
// }
// function clnt_bad_pass(login) {
//   LOGIN = null
//   alert(`wrong password`)
//   clnt_login()
// }
//
// var security_msg_fun = {
//   check_pass: ({sndr,msg}) => {
//     srvr_check_pass(sndr,msg)
//   },
//   bad_pass: () => {
//     clnt_bad_pass()
//   },
//   good_pass: ({msg}) => {
//     clnt_good_pass(msg)
//   }
// }

// -----------------------------------------------------------------------------
// POLLS
// -----------------------------------------------------------------------------

// function compare_tables(table_a, table_b) {
//   for (var i in table_a) {
//     if (!table_b[i]) {
//       return false
//     }
//   }
//   for (var i in table_b) {
//     if (!table_a[i]) {
//       return false
//     }
//   }
//   return true
// }
//
// POLLS = {
//   'New Game': {
//     options: ['yes','no'],
//     default: 'yes',
//     result: result => {
//
//     }
//   },
//   'Number of Nodes': {
//     options: [1,2,3,4,5,`pass`],
//     default: 'pass',
//     result: result => {
//
//     }
//   },
//   'Number of Fountains': {
//     options: [1,2,3,4,'pass'],
//     default: 'pass',
//     result: result => {
//
//     }
//   },
//   'Number of Knives': {
//     options: [0,1,2,3,'pass'],
//     default: 'pass',
//     result: result => {
//
//     }
//   },
// }
//
// var poll_msg_fun = {
//
// }

// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------

MODE = 'node'
SEL_NODE = null
FOUNTAIN_COLOR = NODE_COLOR
KNIFE_COLOR = 'black'

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
  if (!no_link_cross(node1, node2)) return

  var link = {
    idx: GAME.links.length,
    node1: node1,
    node2: node2,
    length: PT.dist(node1.position, node2.position)
  }
  node1.links[node2.idx] = {link: link, node: node2, side: 1}
  node2.links[node1.idx] = {link: link, node: node1, side: 2}
  GAME.links.push(link)
}
function splitlink(link, point, color) {
  delete GAME.links[link.idx]
  delete link.node1.links[link.node2.idx]
  delete link.node2.links[link.node1.idx]

  var node = new_node(point)
  new_link(link.node1, node)
  new_link(link.node2, node)
  set_fountain(node, color)
}
function closest_node(position) {
  for (var i in GAME.nodes) {
    var node = GAME.nodes[i]
    if (PT.dist(node.position, position) < NODE_RADIUS) {
      return node
    }
  }
  return null
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
  var color = {
    nodes: [],
    links: []
  }
  for (var i in GAME.nodes) {
    var node = GAME.nodes[i]
    color.nodes[i] = node.color
  }
  for (var i in GAME.links) {
    var link = GAME.links[i]
    color.links[i] = {
      1: { idx: link.node1.idx, length: 0, color: link.node1.color },
      2: { idx: link.node2.idx, length: 0, color: link.node2.color },
      length: link.length
    }
  }

  return color
}
function copy_spread(spread) {
  return JSON.parse(JSON.stringify(spread))
}

function solve_events() {
  var spread = get_spread()

  

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

  return JSON.stringify([nodes, links])
}
function read_game(txt) {
  var save = JSON.parse(txt)
  GAME = {
    nodes: [],
    links: []
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

// -----------------------------------------------------------------------------
// DISPLAY GAME
// -----------------------------------------------------------------------------

function draw_links() {
  for (var i in GAME.links) {
    var link = GAME.links[i]
    PT.drawLine(G, link.node1.position, link.node2.position, NODE_COLOR)
  }
}
function draw_nodes() {
  for (var i in GAME.nodes) {
    var node = GAME.nodes[i]
    PT.fillCircle(G, node.position, NODE_RADIUS, node.color)
    if (node.color == KNIFE_COLOR) {
      PT.drawCircle(G, node.position, NODE_RADIUS, NODE_COLOR)
    }
  }
}
function node_mode(node) {
  if (USR_IO_MWS.hsDn) {
    if (node) {
      // TODO
    } else {
      new_node(USR_IO_MWS)
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
      new_link(node, SEL_NODE)
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
        set_fountain(node, color)
      }
    }
  }
  else {
    var closest_points = []
    for (var i in GAME.links) {
      var link = GAME.links[i]
      var p1 = link.node1.position
      var p2 = link.node2.position

      var point = PT.closest_point_on_line(USR_IO_MWS, p1, p2)
      if (point && PT.dist(USR_IO_MWS, point) < NODE_RADIUS) {
        closest_points.push([link, point])
      }
    }

    var link_point = closest_points.pop()
    if (link_point && !closest_points.length) {
      var link = link_point[0], point = link_point[1]
      PT.fillCircle(G, point, NODE_RADIUS, color)
      if (color == KNIFE_COLOR) {
        PT.drawCircle(G, point, NODE_RADIUS, NODE_COLOR)
      }

      if (USR_IO_MWS.hsDn) {
        splitlink(link, point, color)
      }
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

  draw_links()
  draw_nodes()

  var node = closest_node(USR_IO_MWS)
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
  // var arg = { key: key, sndr: sndr, rcvr: rcvr, msg: msg }
  //
  // // SECURITY
  // if (security_msg_fun[key]) return security_msg_fun[key](arg)
  //
  // // POLLS
  // if (poll_msg_fun[key]) return security_msg_fun[key](arg)
  //
  //
  // // GAME


  log(key, sndr, rcvr, msg)
}
