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
  speed: 2e-1,
  radius: 7,
  inventory: {},
  scale: 1e3
}
PLAYER.radius /= PLAYER.scale
PLAYER.speed /= PLAYER.scale

MAP = {
  iron: {
    reps: 10,
    area: [1e-3, 1e-2],
    density: [1e3,1e4],
    node_area: [1e-2, 1e-1], // multiplied by roc area
    node_roc_density: 1e3
    color: '#000020'
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
      nodes: []
    }
    roc.radius = Math.sqrt(roc.area/PI)
    var n = Math.floor(roc.density * roc.area)
    FU.forlen(n, k => {
      var node = {
        position: PT.crand(roc.position,roc.radius),
        area: a * FU.prand(troc.node_area),
      }
      node.radius = Math.sqrt(node.area / PI)
      node.density = troc.node_roc_density
      roc.nodes.push(node)
    })
    var roc = {
      position: p,
      area: a,
      radius: r,
      density: d,
      nodes: ns,
      color: troc.color,
      troc: troc
    }
    ROCS.push(roc)
  })
}

var plr_proj = p => plr_proj.hlpr(PLAYER.position,CNTR,p,PLAYER.scale)
plr_proj.hlpr = PT.vcc('vvvs',(r,c,p,s)=>(p-r)*s+c,2)
var rev_proj = p => rev_proj.hlpr(PLAYER.position,CNTR,p,PLAYER.scale)
rev_proj.hlpr = PT.vcc('vvvs',(r,c,p,s)=>(p-c)/s+r,2)
var draw_rect = (p,d,c) => PT.drawRect(G,plr_proj(p),PT.muls(d,PLAYER.scale),c)
var fill_rect = (p,d,c) => PT.fillRect(G,plr_proj(p),PT.muls(d,PLAYER.scale),c)
var draw_circle = (p,r,c) => PT.drawCircle(G,plr_proj(p),r*PLAYER.scale,c)
var fill_circle = (p,r,c) => PT.fillCircle(G,plr_proj(p),r*PLAYER.scale,c)

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  DT = USR_IO_EVNTS.dt
  CNTR = PT.divs(USR_IO_DSPLY.wh,2)
  var mws = rev_proj(USR_IO_MWS)

  var dir = []
  if (USR_IO_KYS.isDn['a']) PT.sume(dir,[-1])
  if (USR_IO_KYS.isDn['d']) PT.sume(dir,[1])
  if (USR_IO_KYS.isDn['s']) PT.sume(dir,[0,1])
  if (USR_IO_KYS.isDn['w']) PT.sume(dir,[0,-1])
  var bmin = PT.sums([],PLAYER.radius,2)
  var bmax = PT.subs([1,1],PLAYER.radius,2)
  PT.bound(PT.vece(PLAYER.position,dir,DT * PLAYER.speed),bmin,bmax)

  ROCS.forEach(roc => {
    fill_circle(roc.position,roc.radius,roc.color)
    roc.nodes.forEach(node => {
      fill_circle( )
    })
  })

  fill_circle(PLAYER.position,PLAYER.radius,'white')
  fill_circle(mws,10/PLAYER.scale,'white')
  draw_rect([0,0],[1,1],'white')
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
