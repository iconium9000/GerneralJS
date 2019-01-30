log = console.log

PROJECT_NAME = 'Circle Factory'
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
}

// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------

PLAYER = {
  normal: [1,0,0], // y
  position: [0,0,1], // z
  speed: 1,
  _scale: 1e1,
  get lens() { return PT.mats(this.xyz,3,PT.length)},
  get scale() { return this._scale * this._scale },
  get xyz() { return [this.cross,this.normal,this.position] },
  get xy() { return [this.cross,this.normal] },
  get yx() { return [this.normal,this.cross] },
  get yz() { return [this.normal,this.position] },
  get zx() { return [this.position,this.cross] },
  get zy() { return [this.position,this.normal] },
}
PLAYER.cross = PT.cross(PLAYER.position,PLAYER.normal)

DIRS = {
  a: [-1], d: [1],
  w: [0,1], s: [0,-1],
  q: [0,0,1], e: [0,0,-1]
}


POINTS = []

FU.forlen(3e2, i => {
  var theta = PI2 * Math.random()
  var phi = Math.acos( 2 * Math.random() - 1)
  POINTS.push(PT.sphere_to_cart([theta,phi,1]))
})

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  CNTR = PT.divs(USR_IO_DSPLY.wh,2)
  DT = USR_IO_EVNTS.dt * 1e-3
  if (isNaN(DT) || DT > 1) DT = 5e-3


  G.fillStyle = 'white'
  POINTS.forEach(p => draw_circle(p,0.01,'white'))

  var dir = []
  FU.forEach(DIRS,(p,d) => USR_IO_KYS.isDn[d] && PT.sume(dir,p))
  PT.mulse(dir,DT*PLAYER.speed,3)

  if (PT.length(dir)) {
    PLAYER.position = PT.vecx(PLAYER.zx,PT.circle(dir[0],1))
    PLAYER.cross = PT.cross(PLAYER.position,PLAYER.normal)

    PLAYER.normal = PT.vecx(PLAYER.yz,PT.circle(dir[1],1))
    PLAYER.position = PT.cross(PLAYER.normal,PLAYER.cross)

    // PLAYER.position = PT.unit(PLAYER.position)
    // PLAYER.cross = PT.unit(PLAYER.cross)
    // PLAYER.normal = PT.unit(PLAYER.normal)
  }

  G.fillText(PLAYER.cross,20,20)
  G.fillText(PLAYER.normal,20,40)
  G.fillText(PLAYER.position,20,60)
  G.fillText(PLAYER.lens,20,80)
  G.fillText([
    PT.length(PT.cross(PLAYER.normal,PLAYER.cross)),
    PT.length(PT.cross(PLAYER.cross,PLAYER.position)),
    PT.length(PT.cross(PLAYER.position,PLAYER.normal)),
  ],20,100)

  draw_circle([],1,'white')
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

// var plr_proj = p => {
//   // var z =
// }

// var rev_proj = p => rev_proj.hlpr(PLAYER.position,CNTR,p,PLAYER.scale)
// rev_proj.hlpr = PT.vcc('vvvs',(r,c,p,s)=>(p-c)/s+r,2)
// var draw_rect = (p,d,c) => PT.drawRect(G,plr_proj(p),PT.muls(d,PLAYER.scale),c)
// var fill_rect = (p,d,c) => PT.fillRect(G,plr_proj(p),PT.muls(d,PLAYER.scale),c)
var draw_circle = (p,r,c) => {
  var dot = PT.dot(p,PLAYER.position)
  if (dot < 0) return
  var u = PT.mats(PLAYER.xy,p,PT.dot)
  var v = PT.vec(CNTR,u,PLAYER.scale)
  PT.drawCircle(G,v,r*PLAYER.scale,c)
}
// var fill_circle = (p,r,c) => PT.fillCircle(G,plr_proj(p),r*PLAYER.scale,c)
// var draw_line = (a,b,c) => PT.drawLine(G,plr_proj(a),plr_proj(b),c)
