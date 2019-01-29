log = console.log

PROJECT_NAME = 'Circle Factory'
log('init game.js', PROJECT_NAME)

// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')
}

GAME_CLNT_INIT = () => {
  log('init game clnt')


}

// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------


PLAYER = {
  position: [0.5,0.5],
  speed: 4e-1,
  radius: 7,
  inventory: {},
  scale_factor: 2e2,
  scale_speed: 5e-2,
  color: 'white',
  range: 1e-2
}
PLAYER.scale = FU.sqr(PLAYER.scale_factor)
PLAYER.radius /= PLAYER.scale
PLAYER.speed /= PLAYER.scale

MINIMAP = {
  size: 100,
  background: 'black'
}

MAP = {
  iron: {
    reps: 1e2,
    area: [1e-4, 1e-3],
    density: [1e4,1e5],
    node_area: [1e-3, 5e-3], // multiplied by roc area
    node_roc_density: 1e3,
    color: '#003040',
    node_color: '#00408050'
  },
  coal: {
    reps: 1e2,
    area: [3e-4, 8e-4],
    density: [2e4,5e5],
    node_area: [1e-3, 6e-3],
    node_roc_density: 2e3,
    color: '#202020',
    node_color: '#48404050'
  }
}

ROCS = []
for (var i in MAP) {
  var troc = MAP[i]
  FU.forlen(troc.reps, j => {
    var roc = {
      position: PT.rand(2),
      area: FU.prand(troc.area),
      density: FU.prand(troc.density),
      nodes: [],
      color: troc.color,
      troc: troc
    }
    roc.radius = Math.sqrt(roc.area/PI)
    var n = Math.floor(roc.density * roc.area)
    FU.forlen(n, k => {
      var node = {
        area: roc.area * FU.prand(troc.node_area),
        color: troc.node_color
      }
      node.radius = Math.sqrt(node.area / PI)
      node.position = PT.crand(roc.position,roc.radius-node.radius)
      node.density = troc.node_roc_density
      roc.nodes.push(node)
    })
    ROCS.push(roc)
  })
}
FU.shuffle(ROCS)
var girgle = []
CRNR_A = [0,0]
CRNR_B = [1,1]
ROCS.forEach((roc,i)=>{
  var nodes = []
  for (var j in roc.nodes) {
    var node = roc.nodes[j]
    if (PT.inbound(node.position,CRNR_A,CRNR_B,2)) {
      var flag = true
      for (var k = i+1; k < ROCS.length; ++k) {
        var kroc = ROCS[k]
        var dist = PT.dist(kroc.position,node.position)
        if (dist - node.radius < kroc.radius) {
          flag = false
          break
        }
      }
      if (flag) nodes.push(node)
      else girgle.push(node)
    }
    else girgle.push(node)
  }
  roc.nodes = nodes
})


// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

function doscroll() {
  if (USR_IO_MWS.hsWl) {
    PLAYER.scale_factor += PLAYER.scale_speed * USR_IO_MWS.wlPt[1]
    PLAYER.scale = FU.sqr(PLAYER.scale_factor)
    var max = CNTR_LEN / PLAYER.radius / 20 , min = CNTR_LEN
    var x = PLAYER.scale
    PLAYER.scale = x > max ? max : x < min ? min : x
    PLAYER.scale_factor = Math.sqrt(PLAYER.scale)
  }
}

function moveplayer() {
  var dir = []
  if (USR_IO_KYS.isDn['a']) PT.sume(dir,[-1])
  if (USR_IO_KYS.isDn['d']) PT.sume(dir,[1])
  if (USR_IO_KYS.isDn['s']) PT.sume(dir,[0,1])
  if (USR_IO_KYS.isDn['w']) PT.sume(dir,[0,-1])
  dir = PT.unit(dir)
  var bmin = PT.sums([],PLAYER.radius,2)
  var bmax = PT.subs([1,1],PLAYER.radius,2)
  PT.bound(PT.vece(PLAYER.position,dir,DT * PLAYER.speed),bmin,bmax)
}

function drawrocs() {
  ROCS.forEach(roc => {
    fill_circle(roc.position,roc.radius,roc.color)
    var dist = PT.dist(roc.position,PLAYER.position)
    if (dist - roc.radius < PLAYER.view && PLAYER.scale > CNTR_LEN * 4) {
      roc.nodes.forEach(node => {
        fill_circle(node.position,node.radius,node.color)
      })
    }
  })
  draw_rect([0,0],[1,1],'white')
}

function drawplayer() {
  if (PT.dist(MWS,PLAYER.position) < PLAYER.range) {
    draw_line(MWS,PLAYER.position,PLAYER.color)
  }
  fill_circle(PLAYER.position,PLAYER.radius,PLAYER.color)
}

function drawminimap() {
  PT.fillRect(G,[],[MINIMAP.size,MINIMAP.size],MINIMAP.background)
  ROCS.forEach(roc => {
    PT.fillCircle(G,
      PT.muls(roc.position,MINIMAP.size),
      roc.radius*MINIMAP.size,roc.color)
  })
  var minimap_player = PT.muls(PLAYER.position,MINIMAP.size)
  var minimap_cntr = PT.vec(minimap_player,CNTR,-MINIMAP.size/PLAYER.scale)
  var minimap_view = PT.muls(USR_IO_DSPLY.wh,MINIMAP.size/PLAYER.scale)
  PT.drawRect(G,minimap_cntr,minimap_view,PLAYER.color)
  PT.fillCircle(G,minimap_player,1,PLAYER.color)
  PT.drawRect(G,[],[MINIMAP.size,MINIMAP.size],'white')
}

function drawmouse() {
  PT.fillCircle(G,USR_IO_MWS,10,'white')
}

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  DT = USR_IO_EVNTS.dt
  CNTR = PT.divs(USR_IO_DSPLY.wh,2)
  CNTR_LEN = PT.length(CNTR)
  PLAYER.view = CNTR_LEN / PLAYER.scale
  MWS = rev_proj(USR_IO_MWS)

  doscroll()
  drawrocs()
  drawplayer()
  moveplayer()
  drawminimap()

  drawmouse()
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

// -----------------------------------------------------------------------------
// VIEW
// -----------------------------------------------------------------------------


var plr_proj = p => plr_proj.hlpr(PLAYER.position,CNTR,p,PLAYER.scale)
plr_proj.hlpr = PT.vcc('vvvs',(r,c,p,s)=>(p-r)*s+c,2)
var rev_proj = p => rev_proj.hlpr(PLAYER.position,CNTR,p,PLAYER.scale)
rev_proj.hlpr = PT.vcc('vvvs',(r,c,p,s)=>(p-c)/s+r,2)
var draw_rect = (p,d,c) => PT.drawRect(G,plr_proj(p),PT.muls(d,PLAYER.scale),c)
var fill_rect = (p,d,c) => PT.fillRect(G,plr_proj(p),PT.muls(d,PLAYER.scale),c)
var draw_circle = (p,r,c) => PT.drawCircle(G,plr_proj(p),r*PLAYER.scale,c)
var fill_circle = (p,r,c) => PT.fillCircle(G,plr_proj(p),r*PLAYER.scale,c)
var draw_line = (a,b,c) => PT.drawLine(G,plr_proj(a),plr_proj(b),c)
