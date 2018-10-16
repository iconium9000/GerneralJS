log = console.log

PROJECT_NAME = 'MazeGame V3'
GAME_HIDE_CURSER = false

log('init game.js', PROJECT_NAME)

GAME_MSG = (key, sndr, rcvr, msg) => {
  log('GAME_MSG')
  switch (key) {
  case 'srvr_rcv_save':
    log('srvr_rcv_save from',sndr)
    SRVR_WRITE_FILE('file_name.txt',msg)
    break
  case 'srvr_snd_save':
    log('srvr_snd_save to',sndr)
    HOST_MSG('clnt_rcv_save',[sndr],SRVR_READ_FILE('file_name.txt'))
    break
  case 'clnt_rcv_save':
    log('clnt_rcv_save',msg)
    read_save(msg)
    break
  default:
    log(key, sndr, rcvr, msg)
  }
}

GAME_SRVR_INIT = () => {
  log('init game srvr')
}
GAME_CLNT_INIT = () => {
  log('init game clnt')
  rqst_save()
}


GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var cntr = PT.divs(wh,2)
<<<<<<< HEAD
  var cur_mws = USR_IO_MWS
  var prv_mws = USR_IO_MWS.prv

  draw_level(g,cur_mws,prv_mws)
}
=======

  for (var i in MODE_KEYS) {
    var key = MODE_KEYS[i]
    var mode = parseInt(i)
    if (USR_IO_KYS.hsDn[key]) {
      log(MODE_NAMES[mode])
      MODE = mode
      if (MODE == SQR_MODE || MODE == GAME_MODE) {
        SEL_NODE = null
      }
      for (var i in SEL_LEVEL.drivers) {
        var driver = SEL_LEVEL.drivers[i]
        if (driver.node) driver.node.driver = null
        driver.node = driver.home_node
        driver.node.driver = driver
        driver.point = driver.node.point
      }
      for (var i in SEL_LEVEL.keys) {
        var key = SEL_LEVEL.keys[i]
        if (key.node) key.node.key = null
        if (key.driver) key.driver.key = null
        key.node = key.home_node
        key.node.key = key
      }
      for (var i in SEL_LEVEL.nodes) check_gate(SEL_LEVEL.nodes[i].gate)
    }
  }
>>>>>>> 26782696a94f22eddf6394978c34a2a523962d49

  if (USR_IO_KYS.hsDn['ArrowRight'] && SEL_LEVEL.idx < LEVELS.length - 1) {
    if (MODE!=GAME_MODE && USR_IO_KYS.isDn.Shift) {
      var next = LEVELS[SEL_LEVEL.idx+1]
      next.idx = SEL_LEVEL.idx
      ++SEL_LEVEL.idx
      LEVELS[next.idx] = next
      LEVELS[SEL_LEVEL.idx] = SEL_LEVEL
      log('swap level')
    }
    else {
      SEL_LEVEL = LEVELS[SEL_LEVEL.idx+1]
      log('next level')
    }
    SEL_DRIVER = SEL_NODE = null
  }
  if (USR_IO_KYS.hsDn['ArrowLeft'] && SEL_LEVEL.idx > 0) {
    if (MODE!=GAME_MODE && USR_IO_KYS.isDn.Shift) {
      var prev = LEVELS[SEL_LEVEL.idx-1]
      prev.idx = SEL_LEVEL.idx
      --SEL_LEVEL.idx
      LEVELS[prev.idx] = prev
      LEVELS[SEL_LEVEL.idx] = SEL_LEVEL
      log('swap level')
    }
    else {
      SEL_LEVEL = LEVELS[SEL_LEVEL.idx-1]
      log('prev level')
    }
    SEL_DRIVER = SEL_NODE = null
  }
  if (USR_IO_KYS.hsDn['+']) {
    new_level(prompt('Level Name:',`Level ${LEVELS.length}`,))
  }
  if (USR_IO_KYS.hsDn['n']) {
    SEL_LEVEL.name = prompt('Level Name:',SEL_LEVEL.name)
  }

  if (MODE == GAME_MODE) {
    if (SEL_LEVEL.locked_driver) {
      SEL_LEVEL.locked_driver = move_driver(SEL_LEVEL.locked_driver)
    }
    else {
      var node = get_node(USR_IO_MWS)
      if (USR_IO_MWS.hsDn && node) {
        if (node.driver) {
          var driver = node.driver
          if (driver != SEL_DRIVER) {
            SEL_DRIVER = driver
            log('sel driver')
          }
          else if (set_driver_key(driver,node)) log('driver key')
          else if (set_node_key(driver,node)) log('node key')
        }
        else if (SEL_DRIVER && (SEL_LEVEL.handles[node.sid]
            || SEL_LEVEL.portals[node.sid])) {
          var driver = SEL_DRIVER
          var driver_node = driver.node

<<<<<<< HEAD
MODE = WALL_MODE

// -----------------------------------------------------------------------------
// Overview
// -----------------------------------------------------------------------------
SIDS = 0
EDITOR_CONTROLLER = false
GAME_CONTROLLER = true

NODE_RADIUS = 15
=======
          if (driver.key) log(node.is_sqr,driver.key.is_sqr)
          if (driver.key && node.is_sqr != driver.key.is_sqr
              && set_node_key(driver,driver_node))
            log('node key')

          driver.point = PT.copy(driver_node.point)
          driver.node = driver_node.driver = null
          check_gate(driver_node.gate)

          var bad_net = driver_node.net[node.sid]||driver_node.bad_net[node.sid]
          var short_route = shortest_route(driver_node,node,{})
          var route = short_route || (bad_net && [bad_net])
          log('route',route)
          if (route)
            SEL_LEVEL.locked_driver = set_route(driver,route,driver_node)
          else {
            driver.point = driver_node.point
            driver.node = driver_node
            driver_node.driver = driver
            check_gate(driver_node.gate)
          }
        }
      }
    }
  }
  else {
    if (USR_IO_KYS.hsDn['Enter']) {
      log('Save Game')
      save_game()
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
      set_net()
    }
    if (USR_IO_MWS.hsUp) {
      if (DRAG_LEN < MIN_DRAG_LEN)
        SEL_NODE = link_node(DRAG_NODE,SEL_NODE)
    }
  }
  var node = get_node(USR_IO_MWS)
  g.fillStyle = 'white'
  if (node) g.fillText(node.sid,20,20)
  g.fillText(SEL_LEVEL.name,20,wh[1]-20)

  for (var i in SEL_LEVEL.links) {
    var link = SEL_LEVEL.links[i]
    g.strokeStyle = gate_color(link.gate,false,link.gate)
    g.setLineDash(link.solid ? [] : [4,4])
    PT.drawLine(g,link.node_a.point,link.node_b.point)
  }


  g.setLineDash([1,20])
  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]
    for (var j in node.net) {
      var net = node.net[j]
      g.strokeStyle = valid_path(net) ? 'purple' : 'grey'
      PT.drawLine(g,node.point,net.node.point)
    }
  }

  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]

    var is_portal = !!SEL_LEVEL.portals[node.sid]
    var is_handle = !!SEL_LEVEL.handles[node.sid]
    g.strokeStyle = gate_color(node.gate,is_portal,is_handle)
    var radius = NODE_RADIUS
    if (is_portal) {
      radius *= Math.abs(Math.cos(node.turn)) * 3
      node.turn += USR_IO_EVNTS.dt * PORTAL_PULSE_RATE
    }
    g.setLineDash(SEL_LEVEL.portals[node.sid] ? PORTAL_DASH : []);
    PT[node.is_sqr ? 'drawSquare' : 'drawCircle'](g,node.point,radius)
  }
  g.setLineDash([])
  g.strokeStyle = 'white'
  for (var i in SEL_LEVEL.keys) {
    var key = SEL_LEVEL.keys[i]
    var point = key.driver ? key.driver.point : key.node.point
    PT[key.is_sqr?'drawSquare':'drawCircle'](g, point, KEY_RADIUS)
  }
  for (var i in SEL_LEVEL.drivers) {
    var driver = SEL_LEVEL.drivers[i]

    if (driver.key) {
      g.fillStyle = 'black'
      PT.fillCircle(g,driver.point,KEY_RADIUS-LINE_WIDTH)
    }
    var spoke = PT.circle(driver.turn,NODE_RADIUS * 2)
    var point = driver.point
    PT.drawLine(g,PT.sum(point,spoke),PT.sub(point,spoke))
    var spoke = PT.invert(spoke)
    PT.drawLine(g,PT.sum(point,spoke),PT.sub(point,spoke))
    if (SEL_DRIVER == driver) {
      driver.turn += USR_IO_EVNTS.dt * DRIVER_TURN_SPEED
    }

    if (driver.target) {
      g.strokeStyle = 'white'
      PT.drawLine(g,driver.point,driver.target.point)
    }
  }

  if (SEL_NODE) {
    g.strokeStyle = 'white'
    PT.drawLine(g,USR_IO_MWS,SEL_NODE.point)
  }
}
>>>>>>> 26782696a94f22eddf6394978c34a2a523962d49

// -----------------------------------------------------------------------------
// CONSTS
// -----------------------------------------------------------------------------
<<<<<<< HEAD
LEVELS = {}
SEL_LEVEL = null
SEL_NODE = null
SEL_PIECE = null
DRAG_NODE = null
new_level()

function new_level() {
  var level = {
    sid: ++SIDS,
    name: 'Level ' + SIDS,
    nodes: {},
    walls: {},
    doors: {},
    handles: {},
    portals: {},
    drivers: {},
    keys: {}
  }
  SEL_LEVEL = LEVELS[level.sid] = level
=======

SID = 0
LEVELS = []
SEL_LEVEL = null
SEL_NODE = null
SEL_DRIVER = null
DRAG_NODE = null
DRAG_LEN = 0

NODE_RADIUS = 8
KEY_RADIUS = 1.5 * NODE_RADIUS

IS_SQR = false
MODE = 0
MODES = {
  'WALL_MODE':'w',
  'CLEAR_MODE':'c',
  'SQR_MODE':'s',
  'DOOR_MODE':'d',
  'LINK_MODE':'r',
  'HANDLE_MODE':'h',
  'PORTAL_MODE':'p',
  'DRIVER_MODE':'v',
  'KEY_MODE':'k',
  'GAME_MODE':'g',
}
MODE_KEYS = []
MODE_NAMES = []
for (var mode in MODES) {
  eval(`${mode} = ${MODE}`)
  MODE_KEYS[MODE] = MODES[mode]
  MODE_NAMES[MODE++] = mode
}

MODE = GAME_MODE

LINE_DASH = [4,4]
PORTAL_DASH = [3,3]
PORTAL_PULSE_RATE = 2e-3
PORTAL_PULSE_RATIO = 0.3
DRIVER_TURN_SPEED = 3e-3
DRIVER_SPEED = 1e2
LINE_WIDTH = 1

MIN_DRAG_LEN = 10

new_level()

// -----------------------------------------------------------------------------
// BACKBONE
// -----------------------------------------------------------------------------

function write_save() {
  var save = []
  for (var l in LEVELS) {
    var level = LEVELS[l]
    var node_table = {}
    var node_array = []
    for (var i in level.nodes) {
      var node = level.nodes[i]
      node_table[i] = node_array.length
      var code = node.home_driver?1:0
      code += node.home_key?2:0
      code += level.portals[i]?4:0
      code += level.handles[i]?8:0
      code += node.is_sqr?16:0
      node_array.push(node.point[0],node.point[1],code)
    }
    var link_array = []
    for (var i in level.links) {
      var link = level.links[i]
      link_array.push(
        node_table[link.node_a.sid],
        node_table[link.node_b.sid],
        (link.solid?1:0) + (link.gate?2:0)
      )
    }
    save.push([level.name,node_array,link_array])
  }
  return save
}
function read_save(save) {
  var levels = {}
  LEVELS = []
  for (var s in save) {
    s = save[s]
    var name = s[0]
    var nodes = s[1]
    var links = s[2]
    var node_table = {}
    new_level(name)
    for (var i = 0; i < nodes.length; i += 3) {
      node_table[i] = new_node([nodes[i],nodes[i+1]])
    }
    var modes = [0,WALL_MODE,LINK_MODE,DOOR_MODE]
    for (var i = 0; i < links.length; i += 3) {
      var node_a = node_table[links[i]]
      var node_b = node_table[links[i+1]]
      var code = links[i+2]
      MODE = modes[code]
      link_node(node_a,node_b)
    }
    for (var i = 0; i < nodes.length; i += 3) {
      var node = node_table[i]
      var code = nodes[i+2]
      if (code & 4) {
        MODE = PORTAL_MODE
        link_node(node,null)
      }
      if (code & 8) {
        MODE = HANDLE_MODE
        link_node(node,null)
      }
      if (code & 1) {
        MODE = DRIVER_MODE
        link_node(node,null)
      }
      if (code & 2) {
        MODE = KEY_MODE
        link_node(node,null)
      }
      if (code & 16) {
        MODE = SQR_MODE
        link_node(node,null)
      }
    }
  }
}
function save_game() {
  HOST_MSG('srvr_rcv_save',[SRVR_CLNT_ID],write_save())
}
function rqst_save() {
  HOST_MSG('srvr_snd_save',[SRVR_CLNT_ID])
}

function gate_color(gate,is_portal,is_handle) {
  if (!is_portal && !is_handle) return 'white'
  if (is_portal && SEL_LEVEL.portal_lock) return 'red'
  return gate.is_open ? 'green' : 'red'
}
function new_level(name) {
  SEL_LEVEL = {
    idx: LEVELS.length,
    name: name,
    nodes: {},
    links: {},
    handles: {},
    portals: {},
    drivers: {},
    nets: {},
    keys: {},
    portal_lock: false
  }
  LEVELS.push(SEL_LEVEL)
  return SEL_LEVEL
>>>>>>> 26782696a94f22eddf6394978c34a2a523962d49
}
function get_node(point) {
  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]
    if (NODE_RADIUS > PT.dist(node.point,point)) {
      return node
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
function kill_link(link) {
  delete SEL_LEVEL.links[link.sid]
  delete link.node_a.links[link.node_b.sid]
  delete link.node_b.links[link.node_a.sid]
  set_gate(link.node_a)
  set_gate(link.node_b)
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
function new_driver(node) {
  var driver = {
    sid: ++SID,
    point: node.point,
    home_node: node,
    node: node,
    turn: 0
  }
  node.driver = node.home_driver = driver
  SEL_LEVEL.drivers[driver.sid] = driver
  if (!SEL_LEVEL.portals[node.sid]) {
    SEL_LEVEL.handles[node.sid] = node
  }
  return driver
}
function new_key(node) {
  var key = {
    sid: ++SID,
    is_sqr: node.is_sqr,
    home_node: node,
    node: node
  }
  node.key = node.home_key = key
  SEL_LEVEL.keys[key.sid] = key
  if (!SEL_LEVEL.portals[node.sid]) {
    SEL_LEVEL.handles[node.sid] = node
  }
  return key
}
function kill_driver(driver) {
  driver.node.driver = null
  driver.home_node.home_driver = null
  delete SEL_LEVEL.drivers[driver.sid]
}
function kill_key(key) {
  key.node.key = null
  key.home_node.home_key = null
  delete SEL_LEVEL.keys[key.sid]
}
function kill_node(node) {
  if (node.driver) kill_driver(node.driver)
  if (node.key) kill_key(node.key)
  delete SEL_LEVEL.portals[node.sid]
  delete SEL_LEVEL.handles[node.sid]
  delete SEL_LEVEL.nodes[node.sid]
  kill_links(node)
  set_net()
}
function check_src_node(node,src_node) {

}

<<<<<<< HEAD
function new_node(point,src_node,mode) {
  var node = get_node(point) || {
    sid: ++SIDS,
    point: PT.copy(point),
    peice_target: false,
    handles: {},
    doors: {},
    walls: {}
  }
  node.src_node = src_node
  SEL_LEVEL.nodes[node.sid] = node

  if (node.src_node) {
    switch (MODE) {
      case WALL_MODE:


      case DOOR_MODE:
=======
function set_driver_key(driver,node) {
  if (node.key) {
    driver.key = node.key
    driver.key.node = node.key = null
    driver.key.driver = driver
    return true
  }
  else return false
}
function set_node_key(driver,node) {
  if (driver.key) {
    node.key = driver.key
    driver.key = node.key.driver = null
    node.key.node = node
    return true
  }
  else return false
}

function check_portals() {
  var count = 0
  for (var i in SEL_LEVEL.portals) {
    var node = SEL_LEVEL.portals[i]
    if (node.gate.is_open) ++count
  }
  SEL_LEVEL.portal_lock = count != 2
}
function check_gate(gate) {
  gate.is_open = true
  for (var i in gate.handles) {
    var node = gate.handles[i]
    if (!node.driver && !node.key) return gate.is_open = false
  }
  check_portals()
  return true
}
function set_portals() {
  var count = 0
  for (var i in SEL_LEVEL.portals) ++count
  var i = 0, l = Math.PI / count
  for (var j in SEL_LEVEL.portals) {
    var node = SEL_LEVEL.portals[j]
    node.turn = i++ * l
  }
}
function set_gate(node,gate) {
  if (gate && node.gate == gate) return
  gate = node.gate = gate || {
    handles: {},
    is_open: true
  }
>>>>>>> 26782696a94f22eddf6394978c34a2a523962d49

  if (SEL_LEVEL.handles[node.sid]) {
    gate.handles[node.sid] = node
    if (!node.driver && !node.key) gate.is_open = false
  }

  for (var i in node.links) {
    var node_link = node.links[i]
    if (node_link.link.gate) {
      node_link.link.gate = gate
      set_gate(node_link.node,gate)
    }
  }
  check_portals()
}
function get_barriers(point_a,point_b,is_portal) {
  var points = []
  for (var i in SEL_LEVEL.links) {
    var link = SEL_LEVEL.links[i]
    if (!link.solid) continue
    var int = PT.lineint2(link.node_a.point,link.node_b.point,point_a,point_b)
    int && points.push({
      point: int,
      dist: PT.dist(int,point_a),
      gate: link.gate
    })
  }
  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]
    if (SEL_LEVEL.handles[node.sid] || SEL_LEVEL.portals[node.sid]) continue
    var int = PT.radint2(point_a,point_b,node.point,NODE_RADIUS)
    int && points.push({
      point: int,
      dist: PT.dist(int,point_a),
      gate: null
    })
  }
  points.sort((a,b)=>a.dist-b.dist)
  return points
}
function valid_path(net) {
  if (net.is_portal)
    return !SEL_LEVEL.portal_lock && net.gate_a.is_open && net.gate_b.is_open
  if (!net.barriers) return false
  for (var i in net.barriers) {
    var barrier = net.barriers[i]
    if (!barrier.gate || !barrier.gate.is_open) return false
  }
  return true
}
function get_net(node_a,node_b,is_portal) {
  var node_link = node_a.links[node_b.sid]
  if (node_link && node_link.link.solid) return
  var barriers = get_barriers(node_a.point,node_b.point)
  for (var i in barriers) if (!barriers[i].gate) {
    if (!is_portal) {
      node_a.bad_net[node_b.sid] = {
        barriers: barriers,
        node: node_b,
        is_portal: false, gate_a: null, gate_b: null
      }
      return
    }
    barriers = null
    break
  }
<<<<<<< HEAD
  else if (MODE == PORTAL_MODE) {

  }
=======
  node_a.net[node_b.sid] = {
    is_portal: is_portal,
    barriers: barriers || [],
    node: node_b,
    gate_a: is_portal && node_a.gate,
    gate_b: is_portal && node_b.gate
  }
}
function set_net() {
  for (var i in SEL_LEVEL.handles) {
    var node_a = SEL_LEVEL.handles[i]
    node_a.net = {}
    node_a.bad_net = {}
    for (var j in SEL_LEVEL.handles)
      if (i != j) get_net(node_a,SEL_LEVEL.handles[j])
    for (var j in SEL_LEVEL.portals)
      get_net(node_a,SEL_LEVEL.portals[j])
  }
  for (var i in SEL_LEVEL.portals) {
    var node_a = SEL_LEVEL.portals[i]
    node_a.net = {}
    node_a.bad_net = {}
    for (var j in SEL_LEVEL.handles)
      get_net(node_a,SEL_LEVEL.handles[j])
    for (var j in SEL_LEVEL.portals)
      if (i != j) get_net(node_a,SEL_LEVEL.portals[j],true)
  }
}
function new_node(point) {
  var node = get_node(point) || {
    sid: ++SID,
    point: PT.copy(point),
    links: {},
    home_driver: null,
    home_key: null,
    driver: null,
    key: null,
    is_sqr: IS_SQR,
    turn: 0
  }
  SEL_LEVEL.nodes[node.sid] = node
  set_gate(node)
  return node
>>>>>>> 26782696a94f22eddf6394978c34a2a523962d49
}
function link_node(node,src_node) {
  node.net = null

  // log('PORTAL_MODE',MODE == PORTAL_MODE)
  if (MODE == PORTAL_MODE) {
    if (SEL_LEVEL.portals[node.sid]) {
      delete SEL_LEVEL.portals[node.sid]
    }
    else {
      SEL_LEVEL.portals[node.sid] = node
    }
    delete SEL_LEVEL.handles[node.sid]
  }
  // log('HANDLE_MODE',MODE == HANDLE_MODE)
  if (MODE == HANDLE_MODE) {
    if (SEL_LEVEL.handles[node.sid]) {
      delete SEL_LEVEL.handles[node.sid]
    }
    else {
      SEL_LEVEL.handles[node.sid] = node
    }
    delete SEL_LEVEL.portals[node.sid]
  }
  if (src_node == node) src_node = null

<<<<<<< HEAD
// -----------------------------------------------------------------------------
// Game Controller
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Graphics
// -----------------------------------------------------------------------------

var drag_fun = PT.vcc('vvv',(n,m,p)=>n+m-p,2)

function draw_level(g) {
  var drag_enable = USR_IO_KYS.isDn['1']
  if (drag_enable) {
    if (USR_IO_MWS.hsDn) DRAG_NODE = get_node(USR_IO_MWS)
    if (DRAG_NODE && USR_IO_MWS.isDn){
      DRAG_NODE.point = drag_fun(DRAG_NODE.point,USR_IO_MWS,USR_IO_MWS.prv)
    }
  }
  else if (USR_IO_MWS.hsDn) new_node(USR_IO_MWS)

  g.strokeStyle = 'white'
  g.fillStyle = 'white'
  var draw = drag_enable ? PT.drawCircle : PT.fillCircle

  for (var i in SEL_LEVEL.nodes) {
    var node = SEL_LEVEL.nodes[i]
    draw(g,node.point,NODE_RADIUS)
  }
=======
  if (MODE == SQR_MODE) {
    node.is_sqr = !node.is_sqr
    if (node.key) node.key.is_sqr = node.is_sqr
    set_net()
    return null
  }
  else if (MODE == DRIVER_MODE) {
    if (node.driver) kill_driver(node.driver)
    else new_driver(node)
  }
  else if (MODE == KEY_MODE) {
    if (node.key) kill_key(node.key)
    else new_key(node)
  }

  if (src_node && MODE != SQR_MODE) {
    if (MODE == CLEAR_MODE) {
      var link = get_link(node,src_node)
      kill_link(link)
      return node
    }
    else {
      var link = get_link(node,src_node)
      link.solid = MODE == WALL_MODE || MODE == DOOR_MODE
      link.gate = MODE != WALL_MODE
      if (MODE == WALL_MODE) set_gate(src_node)
    }
  }

  set_gate(node)
  set_portals()
  if (node.is_sqr) log('is_sqr1',node.sid,'net',!!node.net)
  set_net()
  if (node.is_sqr) log('is_sqr2',node.sid,'net',!!node.net)
  return node
}
function shortest_route(node_a,node_b,flags) {
  if (node_a == node_b) return []
  var routes = []


  flags[node_a.sid] = true
  // log('net',node_a,node_b)
  for (var i in node_a.net) {
    if (flags[i]) continue
    var net = node_a.net[i]
    if (net.flag == flags || valid_path(net)) {
      net.flag = flags
      var new_route = shortest_route(net.node,node_b,flags)
      if (new_route) {
        new_route.push(net)
        routes.push(new_route)
      }
    }
  }
  delete flags[node_a.sid]

  var min = Infinity
  var route = null
  PT.shuffle(routes)
  for (var i in routes) if (routes[i].length < min) {
    route = routes[i]
    min = route.length
  }
  // log(routes)
  return route
}
function set_route(driver,route,return_node) {
  driver.route = route
  driver.return_node = return_node
  return driver
}
function move_driver(driver) {
  if (!driver.path) {
    if (!driver.route || !driver.route.length) {
      var return_node = driver.return_node
      driver.node = return_node
      driver.point = return_node.point
      return_node.driver = driver

      if (set_driver_key(driver,return_node)) log('driver key')
      else if (set_node_key(driver,return_node)) log('node key')

      driver.return_node = driver.route = driver.path = null
      check_gate(return_node.gate)
      return null
    }
    var net = driver.route.pop()
    var sub = PT.sub(net.node.point,driver.point)
    var dist = PT.length(sub)
    driver.path = {
      node: net.node,
      origin: PT.copy(driver.point),
      velocity: PT.divs(sub,DRIVER_SPEED),
      speed: dist / DRIVER_SPEED,
      dist: dist,
      barriers: net.barriers,
      barrier_idx: 0
    }
  }
  var path = driver.path
  var sub = PT.sub(driver.point,path.origin)
  var dist = PT.length(sub)
  var dt = USR_IO_EVNTS.dt
  var move = dist + dt * path.speed
  if (path.dist < move) {
    if (!driver.route.length) driver.return_node = driver.path.node
    driver.path = null
    return driver
  }
  else while (path.barrier_idx < path.barriers.length) {
    var barrier = path.barriers[path.barrier_idx]
    if (barrier.dist < move) {
      if (barrier.gate && barrier.gate.is_open) ++path.barrier_idx
      else {
        driver.route = [{
          flag: {},
          barriers: [],
          node: driver.return_node
        }]
        driver.path = null
        return driver
      }
    }
    else break
  }
  PT.vece(driver.point,path.velocity,dt)
  return driver
>>>>>>> 26782696a94f22eddf6394978c34a2a523962d49
}
