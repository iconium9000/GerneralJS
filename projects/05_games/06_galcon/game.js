log = console.log

PROJECT_NAME = 'Galcon'
log('init game.js', PROJECT_NAME)

GAME_HIDE_CURSER = false

// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')
}

GAME_CLNT_INIT = () => {
  log('init game clnt')

  TIME = USR_IO_NOW() * 1e-3
  PLAYER = {
    name: CLNT_NAME,
    color: '#ff5050'
  }
  new_game([PLAYER], TIME)
}

// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------

N_NODES = 1e2
NODE_DENSITY = 1e4
SIZE = Math.sqrt(NODE_DENSITY * N_NODES / PI) // circle layout

PROJ = 0.5
MAP = []

SCALE_HELPER = 1
SCALE_SPEED = 1e-3
function get_scale() {
  var h = SCALE_HELPER
  var s = h > 1 ? h : 1 / (h - 2)
  return s * s
}
SCALE = get_scale()
NODE_AREA_VARY = 20e2
NODE_MIN_SIZE = 2e2
AREA_TO_SHIPS = 5 / NODE_MIN_SIZE
BASE_GROWTH = 0.5
SHIP_GROWTH = 0.1 / NODE_MIN_SIZE
DEFAULT_COLOR = 'white'
FONT_SCALE = 6
TIME_CHUNK = 10
SHIP_SPEED = 20
SHIP_DELAY = 5 / SHIP_SPEED
SHIP_RADIUS = 4
TIME_VARY = 1e-5
NEW_SHIP = 1
SHIP_ARC_HIGHT = 2

SEL_NODES = null
DRAG_POINT = null

SEND_RATIO = 0.5

function get_time_idx(time) {
  var time_idx = Math.floor((time - GAME.start_time) / TIME_CHUNK)
  if (time_idx > 0) {
    return time_idx
  }
  else {
    return 0
  }
}
function new_game(players, time) {
  GAME = {
    players: {},
    nodes: [],
    ships: {},
    start_time: time,
    ships: [],
    timeline: []
  }
  FU.forlen(N_NODES, new_node)
  var temp_vary = NODE_AREA_VARY
  NODE_AREA_VARY = NODE_MIN_SIZE
  players.forEach(player => {
    GAME.players[player.color] = player
    var node = new_node()
    node.events[0].player = player.color
  })
  NODE_AREA_VARY = temp_vary
  GAME.nodes.sort((a,b) => a.position[2] - b.position[2])
}
function new_node() {
  var area = Math.pow(Math.random(),5) * NODE_AREA_VARY + NODE_MIN_SIZE
  var node = {
    // position: PT.mul(PT.rand(3), SIZE), // square layout
    position: PT.crand([0,0,RAND()], SIZE), // circle layout
    color: DEFAULT_COLOR,
    radius: Math.sqrt(area / PI),
    area: area,
    growth_rate: area * SHIP_GROWTH + BASE_GROWTH,
    timeline: [0],
    events: [{
      timelock: TIME,
      time: TIME,
      player: null,
      sauce: null,
      sign: 0,
      idx: 0,
      ships: area * AREA_TO_SHIPS
    }],
  }
  GAME.nodes.push(node)
  return node
}

function get_event(node, time) {
  // var time_idx = get_time_idx(time)
  // while (time_idx > 0 && !node.timeline[time_idx]) {
  //   --time_idx
  // }
  // var event_idx = node.timeline[time_idx]
  var events = node.events
  var event = events[0]
  var event_idx = 0

  while (event_idx < events.length && events[event_idx].time <= time) {
    event = events[event_idx++]
  }
  return event
}
function get_player(event, time) {
  return event.player || null
}
function get_ships(event, node, time) {
  if (event.player) {
    return event.ships + node.growth_rate * (time - event.time)
  }
  else {
    return event.ships
  }
}
function set_node_values(node, time) {
  var event = get_event(node,time)
  node.color = event.player || DEFAULT_COLOR
  node.ships = Math.floor(get_ships(event, node, time))
}
function insert_event(node, pre_event, event) {
  var event_idx = pre_event.idx + 1

  var events = node.events
  events.splice(event_idx, 0, event)

  var time_idx = get_time_idx(event.time)
  if ( !(event_idx > node.timeline[time_idx]) ) {
    node.timeline[time_idx] = event_idx
  }
  while (++time_idx < node.timeline.length) {
    if (node.timeline[time_idx] != undefined) {
      ++node.timeline[time_idx]
    }
  }

  // log('inserts')
  while (event_idx < events.length) {
    event = events[event_idx]
    event.ships = get_ships(pre_event, node, event.time)


    // if (event.sign > 0) {
    //   log(event.ships, pre_event.player, event.sauce)
    // }

    if (event.sauce == pre_event.player) {
      // if (event.sign > 0) log('+')
      event.ships += event.sign
      event.player = pre_event.player
    }
    else {
      event.ships -= event.sign
      // if (event.sign > 0) log('-')
      if (event.ships < 0) {
        event.player = event.sauce
        event.ships = -event.ships
      }
      else {
        event.player = pre_event.player
      }
    }

    event.idx = event_idx
    pre_event = event
    ++event_idx
    // log(event)
  }

}

function send_ship(src_node, dst_node, player, src_time) {
  if (src_node == dst_node) {
    return // cannot send ships to the same node
  }

  var dist = PT.dist(src_node.position, dst_node.position)
  var transit_time = dist / SHIP_SPEED + RAND() * TIME_VARY

  if (src_time < src_node.timelock) {
    // cannot send ships before timelock
    src_time = src_node.timelock + RAND() * TIME_VARY
  }

  var dst_time = src_time + transit_time
  if (dst_time < dst_node.timelock) {
    // ships cannot leave before timelock
    dst_time = dst_node.timelock + RAND() * TIME_VARY
    src_time = dst_time - transit_time
  }

  var pre_src_event = get_event(src_node, src_time)
  // log(src_node, pre_src_event, player)
  if (pre_src_event.player != player) {
    return // cannot send ships from node not owned by player at launch
  }

  var pre_ships = get_ships(pre_src_event, src_node, src_time)
  if (pre_ships < 1) {
    return // cannot send ships from an empty node
  }

  var src_event = {
    time: src_time,
    sauce: player,
    sign: -NEW_SHIP,
  }
  insert_event(src_node, pre_src_event, src_event)
  src_node.timelock = src_time

  var pre_dst_event = get_event(dst_node, dst_time)
  var dst_event = {
    time: dst_time,
    sauce: player,
    sign: NEW_SHIP
  }
  insert_event(dst_node, pre_dst_event, dst_event)

  var ship = {
    sauce: player, transit_time: transit_time,
    src_node: src_node, dst_node: dst_node,
    src_time: src_time, dst_time: dst_time,
  }
  var ship_idx = GAME.ships.length
  GAME.ships.push(ship)
  var src_time_idx = get_time_idx(src_time)
  var dst_time_idx = get_time_idx(dst_time)
  // log(src_time_idx, dst_time_idx)
  for (var i = src_time_idx; i <= dst_time_idx; ++i) {
    if (!(GAME.timeline[i] < ship_idx)) {
      GAME.timeline[i] = ship_idx
    }
  }
}

function send_ships(dst_node, src_nodes, start_time) {
  var player = PLAYER.color
  src_nodes.forEach(src_node => {
    if (src_node == dst_node) {
      return // cannot send ships to the same node
    }

    start_time += RAND() * TIME_VARY

    var pre_src_event = get_event(src_node, start_time)
    var ships = get_ships(pre_src_event, src_node, start_time)
    ships = Math.floor(SEND_RATIO * ships)

    var dist = PT.dist(src_node.position, dst_node.position)
    var transit_time = dist / SHIP_SPEED + RAND() * TIME_VARY

    var src_event = {
      sauce: player,
      sign: -NEW_SHIP * ships,
      time: start_time
    }
    insert_event(src_node, pre_src_event, src_event)

    FU.forlen(ships, i => {

      src_time = i * SHIP_DELAY + start_time
      var dst_time = src_time + transit_time

      var pre_dst_event = get_event(dst_node, dst_time)
      var dst_event = {
        time: dst_time,
        sauce: player,
        sign: NEW_SHIP
      }
      insert_event(dst_node, pre_dst_event, dst_event)

      var ship = {
        sauce: player, transit_time: transit_time,
        src_node: src_node, dst_node: dst_node,
        src_time: src_time, dst_time: dst_time,
      }
      var ship_idx = GAME.ships.length
      GAME.ships.push(ship)
      var src_time_idx = get_time_idx(src_time)
      var dst_time_idx = get_time_idx(dst_time)
      // log(src_time_idx, dst_time_idx)
      for (var i = src_time_idx; i <= dst_time_idx; ++i) {
        if (!(GAME.timeline[i] < ship_idx)) {
          GAME.timeline[i] = ship_idx
        }
      }


    })
    // log(dst_node, src_node, time)
  })
  log('send')
}

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

function base_proj_position_helper2(pos, map_cntr, cntr, scale) {
  return (pos - map_cntr) * scale + cntr
}
base_proj_position_helper = PT.vcc('vvvs', base_proj_position_helper2, 2)
function base_proj_position(pos) {
  return base_proj_position_helper(pos, MAP, CNTR, SCALE)
}
function rev_base_proj_position_helper2(pos, map_cntr, cntr, scale) {
  return (pos - cntr) / scale + map_cntr
}
rev_base_proj_position_helper = PT.vcc('vvvs',rev_base_proj_position_helper2,2)
function rev_base_proj_position(pos) {
  return rev_base_proj_position_helper(pos, MAP, CNTR, SCALE)
}


function proj_position(pos) {
  return proj_position_helper(pos, pos[2], SIZE, MAP, CNTR, SCALE, PROJ)
}
proj_position_helper = PT.vcc('vsvvvss', proj_position_helper2, 2)
function proj_position_helper2(pos, hight, size, map_cntr, cntr, scale, proj) {
  return (pos - map_cntr) * (1 + proj * scale * hight) * scale + cntr
}
function draw_rings() {
  var cntr = base_proj_position([])
  var reps = 10
  for (var i = 1; i < reps; ++i) {
    PT.drawCircle(G, cntr, i * SIZE * SCALE / reps, '#202020')
  }
}
function draw_nodes_helper(n) {
  if (on_screen(n.base_proj,0)) {
    PT.drawLine(G, n.base_proj, n.proj, n.color)
    var r = n.radius * SCALE
    if (on_screen(n.proj, r)) {
      PT.fillCircle(G, n.proj, r, n.color)
      G.fillStyle = 'black'
      G.fillText(n.ships, n.proj[0], n.proj[1] + FONT_SIZE/3)
    }
  }
}
function draw_nodes() {
  FONT_SIZE = Math.round(FONT_SCALE * SCALE)
  G.font = `${FONT_SIZE}px bold arial`
  G.textAlign = 'center'
  GAME.nodes.forEach(draw_nodes_helper)
}
function draw_ships(time) {
  var time_idx = get_time_idx(time)
  var start_idx = GAME.timeline[time_idx]
  for (var i = start_idx; i < GAME.ships.length; ++i) {
    var ship = GAME.ships[i]
    if (ship.src_time <= time && time <= ship.dst_time) {
      var dst = ship.dst_node.position
      var src = ship.src_node.position
      var sub = PT.sub(dst, src)
      var transit_ratio = (time - ship.src_time) / ship.transit_time

      var arc_hight = PT.length(sub) / SIZE / 2
      arc_hight *= 4 * transit_ratio * (1 - transit_ratio)

      var real_loc = PT.vec(PT.sum(src,[0,0,arc_hight]), sub, transit_ratio)
      var loc = proj_position(real_loc)
      var base_loc = base_proj_position(real_loc)

      PT.drawLine(G, loc, base_loc, ship.sauce)
      PT.fillCircle(G, loc, SHIP_RADIUS * SCALE, ship.sauce)
    }
  }
}
function proj_nodes() {
  GAME.nodes.forEach(node => {
    set_node_values(node, TIME)
    node.proj = proj_position(node.position)
    node.base_proj = base_proj_position(node.position)
  })
}

on_screen_helper = PT.vcc('vvs',(p,s,r)=>-r<p && p<s+r, 2)
function on_screen(pos, r) {
  var ans2 = on_screen_helper(pos, WH, r)
  return ans2[0] && ans2[1]
}
in_box_helper = PT.vcc('vvv', (p,a,b) => (a < p && p < b) || (b < p && p < a),2)
function in_box_helper2(a,b) {
  return a && b
}
function in_box(pos, a, b) {
  return PT.mata(in_box_helper(pos,a,b), true, in_box_helper2, 2)
}

function select_nodes() {
  var mouse_loc = rev_base_proj_position(USR_IO_MWS)

  var sel_node = null
  for (var i in GAME.nodes) {
    var node = GAME.nodes[i]
    var r = node.radius * SCALE
    if (node.proj && on_screen(node.proj, r)) {
      if (PT.dist(USR_IO_MWS, node.proj) < r) {
        sel_node = node
      }
    }
  }

  if (DRAG_POINT) {
    var a = base_proj_position(DRAG_POINT)
    var b = USR_IO_MWS
    PT.drawRect(G, a, PT.sub(b,a), 'white')

    SEL_NODES = []
    GAME.nodes.forEach(node => {
      var event = get_event(node, TIME)
      var player_node = get_player(event, TIME) == PLAYER.color
      if (player_node && in_box(node.position, mouse_loc, DRAG_POINT)) {
        SEL_NODES.push(node)
      }
    })
  }

  if (sel_node) {
    for (var i in SEL_NODES) {
      var node = SEL_NODES[i]
      PT.drawLine(G, node.proj, sel_node.proj, DEFAULT_COLOR)
    }

    if (USR_IO_MWS.hsRt && SEL_NODES) {
      send_ships(sel_node, SEL_NODES, TIME)
      SEL_NODES = null
    }
  } else {
    if (USR_IO_MWS.hsRt) {
      DRAG_POINT = mouse_loc
    }
    if (USR_IO_MWS.rtUp) {
      DRAG_POINT = null
    }
  }

  SEL_NODES && SEL_NODES.forEach(node => {
    PT.drawCircle(G, node.proj, node.radius * SCALE + 4, node.color)
  })
}

GAME_TICK = () => {
  TIME = USR_IO_EVNTS.nw * 1e-3
  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH,2)
  CNTR_MAP = PT.sub(CNTR, MAP)

  G.fillStyle = 'white'
  var sub = PT.sub(USR_IO_MWS.prv, USR_IO_MWS)
  var sub_len = PT.length(sub)
  if (USR_IO_MWS.isDn && sub_len) {
    PT.sume(MAP, PT.divs(sub, SCALE))
  }

  var time_idx = get_time_idx(TIME)
  var start_idx = GAME.timeline[time_idx] || GAME.ships.length
  G.fillStyle = 'white'
  G.fillText(time_idx, 20, 20)
  G.fillText(GAME.ships.length, 20, 40)
  G.fillText(GAME.timeline, 20, 60)

  if (USR_IO_MWS.hsWl) {
    var pre_scale = SCALE
    SCALE_HELPER += USR_IO_MWS.wlPt[1] * SCALE_SPEED
    SCALE = get_scale()

    PT.vece(MAP, PT.sub(USR_IO_MWS, CNTR), 1/pre_scale - 1/SCALE)

  }
  if (USR_IO_KYS.hsDn['z']) {
    MAP = PT.copy(PLAYER.start_node.position)
    SCALE_HELPER = 1
    SCALE = get_scale()
  }

  draw_rings()

  proj_nodes()
  select_nodes()
  draw_nodes()
  draw_ships(TIME)
}

// -----------------------------------------------------------------------------
// IO
// -----------------------------------------------------------------------------

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  default:
    log(key, sndr, rcvr, msg)
  }
}
