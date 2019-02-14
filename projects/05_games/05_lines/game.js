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

GAME = {
  nodes: [],
  links: [],
  fountains: [],
  knives: []
}

function new_node(position) {
  var node = {
    idx: GAME.nodes.length,
    position: position,
    links: {}
  }
  GAME.nodes.push(node)
  return node
}
function new_link(node_a, node_b) {
  if (node_a == node_b || node_a.links[node_b.idx]) return
  if (!no_link_cross(node_a, node_b)) return

  var link = {
    idx: GAME.links.length,
    node_a: node_a,
    node_b: node_b
  }
  node_a.links[node_b.idx] = link
  node_b.links[node_b.idx] = link
  GAME.links.push(link)
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

  for (var i in GAME.nodes) {
    var node = GAME.nodes[i]
    PT.drawCircle(G, node.position, NODE_RADIUS, NODE_COLOR)
  }

  for (var i in GAME.links) {
    var link = GAME.links[i]
    PT.drawLine(G, link.position_a, link.position_b, NODE_COLOR)
  }

  var node = closest_node(USR_IO_MWS)

  if (MODE == 'node') {
    if (USR_IO_MWS.hsDn) {
      if (node) {
        // TODO
      } else {
        new_node(USR_IO_MWS)
      }
    }
  }
  else if (MODE == 'link') {
    if (SEL_NODE) {
      var position_a = SEL_NODE.position
      var position_b = USR_IO_MWS
      var no_cross = node && no_link_cross(position_a, position_b)
      PT.drawLine(G, position_a, position_b, no_cross ? 'white' : 'red')
    }

    if (USR_IO_MWS.hsDn) {
      if (SEL_NODE && node) {
        new_link(node, SEL_NODE)
      }
      SEL_NODE = node
    }
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
