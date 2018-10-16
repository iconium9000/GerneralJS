log = console.log

PROJECT_NAME = 'Astroids'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)



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

var PI = Math.PI
var PI2 = 2*PI
var rotP = PT.unit([20,1])
var rotN = PT.unit([20,-1])
var acc = 1
var aacc = 0.1
var slw = 0.05
var vrec = 10
var vmin = 1

var deltaV = 0
var deltaA = 0

var srand = Math.random
var rand = PT.vcc('s',s=>s*(srand()*2-1),2)
var lrand = PT.vcc('v',v=>v*srand(),2)
var ship = ['ship',[100,100],[vrec],[1,0],[0,0],4]
var food = ['food',[100,100],rand(vrec*srand()),4]

var rap = PT.vcc('vv',FU.mod,2)

function getT(a,v,b,u) {
  var a0 = a[0], a1 = a[1], v0 = v[0], v1 = v[1]
  var b0 = b[0], b1 = b[1], u0 = u[0], u1 = u[1]
  return (v1 * (b0 - a0) - v0 * (b1 - a1)) / (u1 * v0 - u0 * v1)
}

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.wh
  var dt = USR_IO_EVNTS.dt * 1e-3
  var kys = USR_IO_KYS.isDn
  var mws = USR_IO_MWS

  var cntr = PT.divs(wh,2)

  var w = wh[0], h = wh[1]
  var kE = kys['e']
  var kQ = kys['q']
  var kS = kys[' ']
  var kW = kys['w']

  g.strokeStyle = 'white'
  if (w>h) {
    var x = w/4
    PT.drawLine(g,[x,0],[x,h])
    PT.drawLine(g,[w-x,0],[w-x,h])
    PT.drawLine(g,[x,h/2],[w-x,h/2])
    if (mws.isDn) {
      if (mws[0]<x) kQ = true
      else if (mws[0]>w-x) kE = true
      else if (mws[1]<h/2) kW = true
      else kS = true
    }
  }
  else {
    var y = h/4
    PT.drawLine(g,[0,y],[w,y])
    PT.drawLine(g,[0,h-y],[w,h-y])
    PT.drawLine(g,[w/2,y],[w/2,h-y])
    if (mws.isDn) {
      if (mws[1]<y) kW = true
      else if (mws[1]>h-y) kS = true
      else if (mws[0]<w/2) kQ = true
      else kE = true
    }
  }

  g.strokeStyle = g.fillStyle = 'white'
  var pavel = ship[4][1]
  if (kE) {
    ship[4][1] += aacc*dt
    deltaA += aacc*dt
  }
  if (kQ) {
    ship[4][1] -= aacc*dt
    deltaA += aacc*dt
  }
  if (kS) {
    var change = slw*dt
    var abs = Math.abs(ship[4][1])
    if (abs < change) {
      deltaA += abs
      ship[4][1] = 0
    }
    else {
      ship[4][1] -= (ship[4][1]>0?1:-1) * change
      deltaA += change
    }
  }
  var avel = ship[4][1]
  var taac = (pavel - avel)/dt
  var dadist = ship[4][0]+avel*avel/2/taac


  if (kW) {
    ship[2] = PT.vec(ship[2],ship[3],acc*dt)
     deltaV += acc*dt
   }
  // if (kys['s']) {ship[2] = PT.vec(ship[2],ship[3],-acc*dt); deltaV += acc*dt}
  ship[4][0] = PT.dot(ship[4],[1,dt])
  ship[3] = PT.circle(ship[4][0])


  ship[1] = PT.vec(ship[1],ship[2],dt)
  PT.fillCircle(g,cntr,ship[5])
  PT.drawLine(g,cntr,PT.sum(cntr,ship[2]))
  PT.drawLine(g,cntr,PT.vec(cntr,ship[3],vrec))

  if (PT.dist(ship[1],food[1]) < vrec && PT.dist(ship[2],food[2]) < vmin) {
    food[1] = lrand(wh)
    food[2] = PT.muls(PT.unit(PT.sub(cntr,food[1])),srand()*vrec)
    log(deltaV,deltaA)
    deltaA = deltaV = 0
  }

  var time = getT(food[1],food[2],ship[1],ship[2])
  var st = PT.vec(ship[1],ship[2],time)
  var ft = PT.vec(food[1],food[2],time)
  PT.drawCircle(g,PT.sum(PT.sub(st,ship[1]),cntr),ship[5])
  PT.drawSquare(g,PT.sum(PT.sub(ft,ship[1]),cntr),food[3])

  food[1] = PT.vec(food[1],food[2],dt)

  var fc = PT.sum(PT.sub(food[1],ship[1]),cntr)
  PT.fillSquare(g,fc,food[3])
  PT.drawLine(g,fc,PT.sum(fc,food[2]))

  var drawAngle = (a,c,h) => {
    g.fillStyle = g.strokeStyle = c
    var r = [wh[0]/PI2 * a,wh[1]-h]
    PT.drawCircle(g,rap(r,wh),4)
    r[0] = wh[0]/PI2 * (PI+a)
    PT.drawSquare(g,rap(r,wh),4)
  }

  var vecs = 5
  var vecp = 5
  var txts = 40
  var txtp = 20
  g.font = '20px Arial'

  drawAngle(ship[4][0],'lightblue',vecs+=vecp)
  drawAngle(dadist,'pink',vecs+=vecp)
  drawAngle(PT.tan2(PT.sub(ship[2],food[2])),'yellow',vecs+=vecp)
  var tarv = PT.dist(food[2],ship[2])
  var brnt = tarv / acc
  var speed = PT.dist(ship[2],food[2])
  var dist = PT.dist(ship[1],food[1]) // time * speed
  var timetburn = dist/speed - speed/2/acc
  g.fillText(brnt,20,wh[1]-(txts+=txtp))
  g.fillText(tarv,20,wh[1]-(txts+=txtp))
  g.fillText(timetburn,20,wh[1]-(txts+=txtp))
  drawAngle(PT.tan2(PT.sub(food[1],ship[1])),'red',vecs+=vecp)
  g.fillText(PT.dist(food[1],ship[1]),20,wh[1]-(txts+=txtp))
  drawAngle(PT.tan2(PT.sub(st,ship[1])),'purple',vecs+=vecp)
  g.fillText(time,20,wh[1]-(txts+=txtp))
  drawAngle(PT.tan2(PT.sub(ft,ship[1])),'green',vecs+=vecp)
  g.fillText(PT.dist(st,ft),20,wh[1]-(txts+=txtp))

  g.fillStyle = 'white'
  g.fillText(deltaV,20,wh[1]-(txts+=txtp))
  g.fillText(deltaA,20,wh[1]-(txts+=txtp))
}
