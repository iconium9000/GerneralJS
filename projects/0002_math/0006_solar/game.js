log = console.log

PROJECT_NAME = 'Orbits Project'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)
GAME_MSG = (key, sndr, rcvr, msg) => {}
GAME_SRVR_INIT = () => {
  log('init game srvr')
}
GAME_CLNT_INIT = () => {
  log('init game clnt')
}

pi = Math.PI
pi2 = pi*2

phys = {

  _sma: `get semi_major_axis
    u: GM
    r: distance from center of mass
    v: speed (scaler)`,
  sma: (u,r,v) => r * u / (2*u - r*v*v),

  _period: `get orbital period
    u: GM
    a: semi_major_axis`,
  period: (u,a) => Math.sqrt(4 * pi / u * a*a*a),

  _onv: `get orbital normal vector (unit)
    p: position relative to center point
    v: velocity relative to center point`,
  onv: (p,v) => PT.unit(PT.cross(p,v)),

  _opv: `get orbital perpendicular vector (unit)
    onv: orbital normal vector
    p: position relative to center point`,
  opv: (onv,p) => PT.unit(PT.cross(p,onv)),

  _tfm: `transform from point plane to point in space
    p: point on plane
    pu: x axis of plane
    opv: y axis of plane`,
  tfm: (p,pu,opv) => PT.sum(PT.muls(pu,p[0]),PT.muls(opv,p[1])),

  _pv: `get planer velocity
    onv: orbital normal vector
    opv: orbital perpendicular vector
    p: position relative to center point
    v: velocity relative to center point`,
  pv: (onv, opv, v) => [PT.dot(onv,v),PT.dot(opv,v)],

  _rv: `get rotation vector
    r: radius
    a: semi_major_axis
    v: velocity relative to center point on plane`,
  rv: (r,a,v) => PT.unit([a*v[0]*v[0] + (r-a)*v[1]*v[1], (2*a-r)*v[0]*v[1]]),

  _ra: `get semi_major_axis angle on plane
    rv: rotational vector
    v: velocity relative to center point on plane`,
  ra: (rv,v) => v[0] == 0 ? 0 : PT.tan2(rv),

  _ecc: `get Eccentricity
    rv: rotational vector
    v: velocity relative to center point on plane
    a: semi_major_axis
    r: distance from center point`,
  ecc: (rv,v,a,r) => v[0] == 0 ? r/a - 1 : v[0] / PT.dot(v,rv),

  _r: `get distance from center as a function of angle
    o: current angle with planer horizontal axis
    a: semi_major_axis
    e: Eccentricity
    ra: semi_major_axis rotational angle`,
  r: (o,a,e,ra) => a * (1 - e*e) / (1 - e * Math.cos(o - ra)),

  _perap: `Periapsis vector on plane (minor extreme point)
    rv: rotational vector
    a: semi_major_axis
    e: Eccentricity`,
  perap: (rv,a,e) => PT.muls(rv,-a * (1 - e)),

  _apoap: `Apoapis vector on plane (major extreme point)
    rv: rotational vector
    a: semi_major_axis
    e: Eccentricity`,
  apoap: (rv,a,e) => PT.muls(rv,a * (1 + e)),

  _vmag: `Magnetude of velocity at a point
    u: GM
    a: semi_major_axis
    r: radius`,
  vmag: (u,a,r) => Math.sqrt(u * (2/r - 1/a)),

  _stdu: `standard mu value for a given semi_major_axis and period
    t: period of rotation
    a: semi_major_axis`,
  stdu: (t,a) => 4*pi2*pi2 * a*a*a /t/t,
}
phys._area = `Integral of dt/(1-ecost)^2 from 0 to x
  x: angle
  e: Eccentricity of ellipse
  z: delta theta`
phys.area = function() {
  var f = (x,e) => {
    var k = 1 - e * Math.cos(x)
    return 1 / k / k
  }
  var area_sub = (x,e,k,z) => {
    var z2 = z / 2

    // get line with slope close to x
    var s0 = FU.mod(x - z2, z) - z2
    s0 *= f(FU.flr(x - z2, z) + z, e)

    // get number of steps
    var n = Math.floor(x / z)

    var f1 = 1 / (1 - e) / (1 - e) // f(0,e)
    // trapazoid method

    var s = 0
    for (var i = 1; i <= n; ++i) {
      var f2 = f(i * z, e)
      s += (f1 + f2)
      f1 = f2
    }

    return s0 + s * z / 2
  }
  return (x,e,z) => {
    var m2 = FU.mod(x,pi2)
    var m1 = m2 < pi ? m2 : m2 - pi
    var k = Math.pow(1 - e*e, -1.5)

    if (e * m1 == 0) return x * k
    else if (m2 < pi) return area_sub(m1,e,k,z) + k*FU.flr(x, pi2)
    else return -area_sub(pi-m1,e,k,z) + k*FU.flr(x+pi, pi2)
  }
}()
phys._invs = `Inverse of Integral of dt/(1-ecost)^2 from 0 to x
  a: area under curve
  e: Eccentricity of ellipse
  z: delta theta`
phys.invs = function() {
  var f = (x,e) => {
    var k = 1 - e * Math.cos(x)
    return 1 / k / k
  }
  var invs_sub = (a,e,k,z) => {
    var az2 = a + z/1
    var z2 = z / 2
    var n = Math.floor(pi*k/z)

    var f1 = 1 / (1 - e) / (1 - e)

    // log('n',n,k)
    if (!n) return pi*k

    var s = 0
    for (var i = 1; i <= n; ++i) {
      var f2 = f(i * z, e)
      var ps = s + (f1 + f2) * z2

      // log(f1,ps,az2)
      if (ps > az2) return (i-1)*z + (a-s)/f1
      s = ps

      f1 = f2
    }
    return pi*k
  }
  return (a,e,z) => {
    if (e == 1) return 0

    var k = Math.pow(1 - e*e, -1.5)
    var pik = pi*k
    var pi2k = pi2*k
    var m2 = FU.mod(a,pi2k)
    var m1 = m2 < pik ? m2 : m2 - pik

    if (e * m1 == 0) return a / k
    else if (m2 < pik) return invs_sub(m1,e,k,z) + FU.flr(a, pi2k)/k
    else return -invs_sub(pik-m1,e,k,z) + FU.flr(a+pik, pi2k)/k
  }
}()

TICK = 0
var objs = []

var reps = 1e3
var std_r = 10
var prev = null

function moveObj(b,u,dt) {
  var r = PT.length(b.p)
  var a = PT.muls(b.p, U/r/r/r)
  PT.sube(b.v, PT.muls(a, dt))
  PT.sume(b.p, PT.muls(b.v, dt))
}
function newObj(p,v) {
  var b = {}

  b.p = p
  b.v = v
  b.r = std_r

  objs.push(b)
}

var U = phys.stdu(10,100)
var z_ax = [0,0,1]

function drawEllipse(g,cvec,p,v,wh) {
  var vr = PT.length(v)
  var pr = PT.length(p)
  var pu = PT.divs(p,pr)
  var sma = phys.sma(U,pr,vr)

  var onv = phys.onv(p,v)
  var opv = phys.opv(onv,p)

  var pv = phys.pv(pu,opv,v)
  var rv = phys.rv(pr,sma,pv)

  var ra = phys.ra(rv,pv)
  var ecc = phys.ecc(rv,pv,sma,pr)

  var pa = PT.tan2(p)

  var smb = Math.sqrt(sma*sma * (1 - ecc*ecc))
  var smf = Math.sqrt(sma*sma - smb * smb)

  var pf = PT.sum(cvec,phys.tfm(PT.muls(rv,smf),pu,opv))

  var tra = PT.dot(onv,z_ax) > 0 ? -ra : ra

  var k2 = Math.pow(1 - ecc*ecc, -1.5)
  var k = Math.sqrt(sma*sma*sma/U)/k2

  var rvp = phys.tfm(rv,pu,opv)
  var rva = PT.tan2(rvp)

  g.beginPath()
  sma > 0 && g.ellipse(pf[0],pf[1],sma,smb,pa+tra,0,pi2)
  g.stroke()

  // g.fillText(ecc,20,20)
  // g.fillText(onv,20,40)

  var drwtfm = (p,r) => PT.drawCircle(g,PT.sum(cvec,phys.tfm(p,pu,opv)),r)

  var apoap = phys.apoap(rv,sma,ecc)
  var perap = phys.perap(rv,sma,ecc)

  drwtfm(apoap,3)
  drwtfm(perap,3)

  PT.drawLine(g,cvec,PT.sum(cvec,PT.muls(rvp,100)))

  var abs_ecc = Math.abs(ecc)

  // g.fillText(`sma:${sma},ecc:${ecc},rva:${rva}`,20,20)
  // g.fillText(phys.invs(pi2/k,ecc,0.5),20,40)

  var nw = USR_IO_EVNTS.nw * 1e-3

  var t = k * phys.area(ra,ecc,0.001)

  var prev = null
  var prev_o = -1
  for (var i = 0; i < wh[0]; ++i) {
    // var x = pi2 * i / 100
    // var o = phys.invs(x/k,ecc,0.5)
    // var y = phys.r(x,sma,ecc,rva)

    // if (i % 100) continue

    var x = i/100 - t
    // var o = pi2 * x
    var o = phys.invs(x/k,ecc,0.01) - rva
    var y = phys.r(o,sma,ecc,0)

    var point = [i,y]
    var point_o = [i,10*FU.mod(o,pi2)]
    prev && PT.drawLine(g,point,prev)
    prev && PT.drawLine(g,point_o,prev_o)
    prev = point
    prev_o = point_o
  }
}

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var mws = USR_IO_MWS
  var kys = USR_IO_KYS.hsDn
  var dt = USR_IO_EVNTS.dt * 1e-3

  var cvec = PT.divs(USR_IO_DSPLY.wh,2)
  var clen = PT.length(cvec)/4

  if (kys['q'])
    if (prev) prev = null
    else objs = []

  if (mws.hsDn) {
    if (prev == null) {
      prev = PT.copy(mws)
    }
    else {
      newObj(PT.sub(prev,cvec),PT.sub(mws,prev))
      prev = null
    }
  }

  g.strokeStyle = g.fillStyle = 'white'

  if (prev) {
    var v = PT.sub(mws,prev)
    var p = PT.sub(prev,cvec)
    var pr = PT.length(p)

    drawEllipse(g,cvec,p,v,USR_IO_DSPLY.wh)
    PT.drawLine(g,prev,mws)
    PT.drawCircle(g,prev,Math.sqrt(2*U/pr))
  }

  PT.fillCircle(g,cvec,4)

  var rdt = dt / reps
  FU.forlen(reps, r => objs.forEach(b => moveObj(b,U,rdt)))
  objs.forEach(b => {
    PT.fillCircle(g, PT.sum(b.p,cvec), b.r)
    drawEllipse(g,cvec,b.p,b.v,USR_IO_DSPLY.wh)
    PT.drawLine(g,cvec,PT.sum(cvec,b.p))
  })
}


// var prev_cv = 0
// var start = USR_IO_EVNTS.nw * 1e-3
// alt_tick = () => {
//   var g = USR_IO_DSPLY.g
//   var mws = USR_IO_MWS
//   var kys = USR_IO_KYS.isDn
//   var dt = USR_IO_EVNTS.dt * 1e-3
//
//   var cntr_vec = PT.divs(USR_IO_DSPLY.wh,2)
//   var cntr_len = PT.length(cntr_vec)/4
//
//   var T = 4
//   var e = 0.80
//   var a = cntr_len * 0.9
//   var u = Math.pow(2 * pi / T, 2) * Math.pow(a,3)
//   var k2 = Math.pow(1 - e*e, -1.5)
//   var k = Math.sqrt(a*a*a/u)/k2
//   var perap = phys.perap([1,0],a,e)
//   var apoap = phys.apoap([1,0],a,e)
//
//   var area = phys.area(pi2,e,0.01)
//
//   var nw = USR_IO_EVNTS.nw * 1e-3
//
//   if (cntr_len != prev_cv) {
//     prev_cv = cntr_len
//     // start = nw
//
//     ball = PT.copy(apoap)
//     ball_r = PT.length(ball)
//     ball_v = [0,Math.sqrt(u*(2/ball_r - 1/a))]
//   }
//
//   var t = nw - start
//   var o = phys.invs(t / k, e, 0.01)
//   var r = phys.r(o,a,e,0)
//
//   g.fillStyle = 'white'
//   g.strokeStyle = 'white'
//
//   g.fillText(apoap[0],20,120)
//
//   PT.drawCircle(g,PT.sum(cntr_vec,perap),10)
//   PT.drawCircle(g,PT.sum(cntr_vec,apoap),10)
//
//   var rdt = dt/reps
//   for (var i = 0; i < reps; ++i){
//     var ball_r = PT.length(ball)
//     var ball_a = PT.muls(ball,-u/ball_r/ball_r/ball_r)
//     PT.sume(ball_v, PT.muls(ball_a, rdt))
//     PT.sume(ball, PT.muls(ball_v,rdt))
//   }
//
//   PT.drawCircle(g,cntr_vec,2)
//
//   var p = PT.muls(PT.circle(o), r)
//   PT.drawCircle(g,PT.sum(cntr_vec,p),15)
//   PT.fillCircle(g,PT.sum(cntr_vec,ball),10)
//
//   // if (TICK++ == 10) log(cntr_len)
//
//   PT.drawCircle(g,cntr_vec,cntr_len)
//
// }
