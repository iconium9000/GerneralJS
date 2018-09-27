log = console.log

PROJECT_NAME = 'Graph Theory'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

SEL = 1

ARROW_SIZE = 3
ARROW_TIME = 20
ELAPSED_TIME = 0

OBJ_IDS = 0
SIZE = {}
LOC = {}
LNKS = {}

SEL_ID = null
MOV_ID = null

RAD = 10
TEXT_SIZE = 8

PROMPT = false

function newNode(msij) {

  PROMPT = false

  for (var id in LOC)
    if (PT.dist(LOC[id],msij) < RAD)
      return id

  PROMPT = true

  var id = ++OBJ_IDS

  var size
  do { size = parseFloat(prompt('getSize')) }
  while (!(100 > size && size > 0))

  SIZE[id] = size
  LOC[id] = msij
  LNKS[id] = {}

  return id
}
function rmvNode(id) {
  delete SIZE[id]
  delete LNKS[id]
  delete LOC[id]
  for (var id2 in LNKS) delete LNKS[id2][id]
}

function newLnk(id1,id2) {
  if (LNKS[id1]) LNKS[id1][id2] = SEL
}

GAME_TICK = () => {
  ELAPSED_TIME = USR_IO_EVNTS.nw

  var mws = USR_IO_MWS
  var g = USR_IO_DSPLY.g
  var kys = USR_IO_KYS.hsDn
  g.textAlign = 'center'

  var msij = PT.copy(mws)
  var node_id = null
  for (var id in LOC)
    if (PT.dist(LOC[id],msij) < RAD)
      node_id = id

  if (SEL_ID && node_id) {
    var loc = LOC[SEL_ID]
    var loc2 = LOC[node_id]

    g.fillStyle = 'red'
    g.strokeStyle = 'red'
    drawArrowLine(g,loc,loc2,RAD,RAD)
  }
  else if (SEL_ID) {
    var loc = LOC[SEL_ID]

    g.fillStyle = g.strokeStyle = 'blue'
    drawArrowLine(g,loc,msij,RAD,RAD)

    PT.fillCircle(g,msij,RAD,'black')
    PT.drawCircle(g,msij,RAD,'white')
  }

  for (var id in LNKS) {
    var loc = LOC[id]
    for (var id2 in LNKS[id]) {
      var loc2 = LOC[id2]

      g.fillStyle = g.strokeStyle = 'white'
      drawArrowLine(g,loc,loc2,RAD,RAD)
    }
  }

  for (var id in LOC) {
    var loc = LOC[id]

    PT.fillCircle(g,loc,RAD,'black')
    PT.drawCircle(g,loc,RAD,'white')
    g.fillStyle = 'white'
    g.fillText(SIZE[id],loc[0],loc[1]+TEXT_SIZE/2)
  }

  if (node_id && kys['l'])
    LNKS[node_id] = {}

  if (kys['q']) {
    SEL_ID = null
    if (node_id) rmvNode(node_id)
    node_id = null
  }

  if (SEL_ID) {
    var loc = LOC[SEL_ID]
    var loc2 = LOC[node_id]

    var loc2 = LOC[id]
    g.fillStyle = 'white'
    g.strokeStyle = 'white'
    drawArrowLine(g,loc,loc2,RAD,RAD)
  }

  if (mws.hsDn) {
    var sel_id = newNode(msij)
    if (SEL_ID) newLnk(SEL_ID,sel_id)
    SEL_ID = sel_id

    if (!PROMPT) MOV_ID = SEL_ID
    else MOV_ID = null
  }
  if (mws.isDn && MOV_ID) {
    LOC[MOV_ID] = msij
  }
  if (mws.hsUp) {
    MOV_ID = null
  }
}

function drawArrowLine(g, pointA, pointB, radA, radB) {
  if (pointA != pointB) {
    pt.drawLine(g, pointB, pointA)

    var vect = pt.sub(pointB, pointA)
    var length = pt.length(vect)
    var arrow = ARROW_TIME * length //Math.ceil(length / 20) * 20
    var scale = (ELAPSED_TIME % arrow) / arrow
    arrow = scale * length

    if (arrow > length - radB) pt.drawCircle(g, pointB, radB + 2)
    else if (radA > arrow) pt.drawCircle(g, pointA, radA + 2)

    pt.fillCircle(g, pt.sum(pointA,pt.muls(vect, scale)), ARROW_SIZE)
  }
}

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
