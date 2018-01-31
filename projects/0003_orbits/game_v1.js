log = console.log

PROJECT_NAME = 'Template Project'
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

var i_p = 0
var i_v = 1
var i_m = 2
var i_r = 3
var i_c = 4
var i_a = 5

var π = Math.PI
var RPT = 100
var PROJ_REPS = 5e3
var PDT = 0.01
var TRAIL_RATE = 3
var PROJ_RATE = 20
var TAIL_REPS = 0
var THRUST = 1e-2
var M = 1
var D = 1e-1
var T = 3
var G = 1
var Gs = (G * D * D * D) / (M * T * T)
var V = D / T

var r1 = 4*6e-2
var r2 = 6e-2
var r3 = 5e-2

var m1 = 1
var m2 = 1e-3
var m3 = m2

var directions = {
  'a': [0,0],
  'd': [0,0],
  'w': [1,0],
  's': [-1,0]
}

GAME_CLNT_INIT = () => {
  log('init game clnt')
}









// vx = Math.sqrt(G * m1x / d1x)

var d12 = 2
var d13 = 3
var d14 = 4
var v2 = Math.sqrt(G * m1 / d12)
var v3 = Math.sqrt(G * m1 / d13)
var v4 = Math.sqrt(G * m1 / d14)

// var v2 = Math.pow(2 * π * G * m1 / 20 / T, 1/3)
// var d12 = G * m1 / (v2 * v2)
//
// var v3 = Math.pow(2 * π * G * m1 / 30 / T, 1/3)
// var d13 = G * m1 / (v3 * v3)
// var v4 = Math.pow(2 * π * G * m1 / 40 / T, 1/3)
// var d14 = G * m1 / (v4 * v4)

var v1 = -(v2 * m2 + v3 * m3 + v4 * m3) / m1
// var v1 = -(v2 * m2 + v3 * m3) / m1

// v = wr     d/t
// w = v/r    ø/t
// w/2π       rot/t
// rot / t = v / 2πr

/*
M = mass scaler
D = distance scaler
T = time scaler
G = gravity scaler

F = M D / T T
V = D / T
Gs = G D D D / M T T
P = 2π V / D

circular case
  F f = Gs (M m1) (M m2) / (D d) (D d)
    F f = Gs (M M / D D) (m1 m2 / d d)
    F f = (G D D D / M T T) (M M / D D) (m1 m2 / d d)
    F f = (D M / T T) (G m1 m2 / d d)
  f = G m1 m2 / d d

  F f = (M m2) (D v2 / T) (D v2 / T) / (D d)
    F f = (M D / T T) (m2 v2 v2 / d)
  f = m2 v v / d

  f = f
    G m1 m2 / d d = m2 v2 v2 / d
    G m1 = v2 v2 d
  v2 = sqrt(G m1 / d)
  p2 = 2π v2 / d
    p2 = 2π sqrt(G m1 / d) / d
  p2 = 2π sqrt(G m1 / d d d)
    p2 = 2π / T
    p2 t = rotations given t

  f13 = f23
    f13 = G m1 m3 / d13 d13
    f23 = G m2 m3 / d23 d23
    d12 = d13 + d23
    G m1 m3 / d13 d13 = G m2 m3 / d23 d23
    m1 / d13 d13 = m2 / d23 d23
    m2 d13 d13 = m1 d23 d23
      m12 = m1 / m2
      m21 = m2 / m1
      sm12 = sqrt(m12)
      sm21 = sqrt(m21)
      sm12 = 1 / sm21
    d13 = sm12 d23
    d13 = sm12 (d12 - d13)
    d13 = sm12 d12 - sm12 d13
    (sm12 + 1) d13 = sm12 d12
    d13 = sm12 d12 / sm12 + 1
    d13 = d12 / 1 + sm21

general case
  F f = Gs (M m1) (M m2) / (D d) (D d)
  f = G m1 m2 / d d
  k = G m1

  p(0) defined
  v(0) defined
  a(t) = k p(t) / |p(t)| ^ 3

  I a(t) dt = v(t)
  I v(t) dt = p(t)

  pt(t) = k I I (p(t) / |p(t)| ^ 3) dt dt
  p(t) = [p1(t) p2(t) p3(t)]

  pt(t) = k I I (p(t) / (p1(t) + p2(t) + p3(t)) ^ (3/2)) dt dt

potential (2 -> 1)
  eg = G m1 m2 / d
  ev = m2 v v / 2
  e = eg + ev
  e = m2 (-G m1 / d + v v / 2)
  e = m2 (-G m1 / d + G m1 / d 2)
  e = -G m1 m2 / 2 d


*/

var pir = [
  0,
  (2 * π * d12) / (v2 * T),
  (2 * π * d13) / (v3 * T),
  (2 * π * d14) / (v4 * T),
]

PT.mulse(pir, TAIL_REPS)
log(d12 / v2, d13 / v3)

/*
  K = 2 π d12 / v2 T
  v2 = sqrt(G m1 / d12)
  v2 v2 = G m1 / d12
  d12 = G m1 / v2 v2
  K v2 T = 2π d12
  K v2 T = 2π G m1 / v2 v2
  v2 v2 v2 = 2π G m1 / K T
  v2 = cube(2π G m1 / K T)
*/


GAME_POINTS = [
  [[],[0,v1],m1,r1,'#ffff00F0'],
  [[d12,0],[0,v2],m2,r2,'#00fffff0'],
  [[d13,0],[0,v3],m3,r3,'#ff00fff0'],
  [[d14,0],[0,v4],m3,r3,'#ff8000f0']
]
GAME_TRAILS = []


var ticks = 0
GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var wh = USR_IO_DSPLY.d
  var dt = USR_IO_EVNTS.dt * 1e-3
  var now = USR_IO_EVNTS.nw * 1e-3
  var kydn = USR_IO_KYS.isDn

  if (ticks++ < 10) return

  g.fillStyle = '#202020'
  pt.fillRect(g,[],wh)

  // M = mass scaler
  // D = distance scaler
  // T = time scaler
  // G = gravity scaler

  // F = M D / T T
  // V = D / T
  // Gs = G D D D / M T T
  // P = 2π V / D

  var half = PT.divs(wh, 2)

  var scal = D * (half[0] > half[1] ? half[1] : half[0])

  dt = T * dt / RPT
  FU.forlen(RPT, r => {
    var len = GAME_POINTS.length
    FU.forEach(GAME_POINTS, p => p[i_a] = [])
    FU.forlen(len-1, i => {
      var a = GAME_POINTS[i]
      var a_p = a[i_p]
      var a_v = a[i_v]
      var a_m = a[i_m]
      var a_r = a[i_r]
      var a_a = a[i_a]

      for (var j = i+1; j < len; ++j) {
        var b = GAME_POINTS[j]
        var b_p = b[i_p]
        var b_v = b[i_v]
        var b_m = b[i_m]
        var b_r = b[i_r]
        var b_a = b[i_a]


        var tp = PT.sub(b_p, a_p,3)
        var dist = PT.length(tp)
        dist = G / (dist * dist * dist)
        var a_ba = PT.muls(tp, b_m * dist)
        var b_aa = PT.muls(tp, -a_m * dist)
        PT.sume(a_a, a_ba)
        PT.sume(b_a, b_aa)
      }
    })
    FU.forlen(len, i => {
      var a = GAME_POINTS[i]
      var a_p = a[i_p]
      var a_v = a[i_v]
      var a_m = a[i_m]
      var a_r = a[i_r]
      var a_a = a[i_a]

      if (i == 2) {
        var s = GAME_POINTS[0]
        var s_p = s[i_p]

        var fwd = PT.unit(a_v)
        var lft = [-a_v[1], a_v[0]]
        var kys = []
        FU.forEach(directions, (d,i) => kydn[i] &&
          PT.sume(kys, PT.sum(PT.muls(fwd, d[0]), PT.muls(lft, d[1]))))
        PT.sume(a_a, PT.muls(kys, THRUST))

        if (!r) {
          g.fillStyle = 'white'
          // g.fillText(PT.length(kys), 20, 20)
          // g.fillText(PT.length(PT.sub(a_v, tp)), 20, 40)
          // g.fillText(PT.length(a_a), 20, 20)
          // g.fillText(PT.length(a_v), 20, 40)
          // g.fillText(or_len, 20, 60)
          // g.fillText(PT.length(u_v), 20, 80)
        }

      }

      pt.sume(a_v, pt.muls(a_a, dt))
      pt.sume(a_p, pt.muls(a_v, dt))
    })
  })
  var t_pts = []
  FU.forEach(GAME_POINTS,
    p => t_pts.push([PT.copy(p[i_p]), PT.copy(p[i_v]), null, p]))
  FU.forlen(PROJ_REPS, rep => {
    FU.forEach(t_pts, p => p[2] = [])
    for (var i = 0; i < t_pts.length; ++i) {
      var a = t_pts[i]
      var a_p = a[0]
      var a_v = a[1]
      var a_a = a[2]
      var a_m = a[3][i_m]

      for (var j = i+1; j < t_pts.length; ++j) {
        var b = t_pts[j]
        var b_p = b[0]
        var b_v = b[1]
        var b_a = b[2]
        var b_m = b[3][i_m]

        var tp = PT.sub(b_p, a_p,3)
        var dist = PT.length(tp)
        dist = G / (dist * dist * dist)
        var a_ba = PT.muls(tp, b_m * dist)
        var b_aa = PT.muls(tp, -a_m * dist)
        PT.sume(a_a, a_ba)
        PT.sume(b_a, b_aa)
      }
    }
    FU.forEach(t_pts, (p,i) => {
      var p_p = p[0]
      var p_v = p[1]
      var p_a = p[2]
      var p_c = p[3][i_c]
      pt.sume(p_v, pt.muls(p_a, PDT))
      pt.sume(p_p, pt.muls(p_v, PDT))


      if (i == '2') {
        var fwd = PT.unit(p_v)
        var lft = [-p_v[1], p_v[0]]
        var kys = []
        FU.forEach(directions, (d,i) => kydn[i] &&
          PT.sume(kys, PT.sum(PT.muls(fwd, d[0]), PT.muls(lft, d[1]))))
        PT.sume(p_a, PT.muls(kys, D * THRUST))
      }

      if (rep % PROJ_RATE) return

      g.fillStyle = p_c
      var tp = PT.muls(p[i_p], scal, 2)
      tp = PT.sume(tp, half, 2)

      g.beginPath()
      g.rect(tp[0], tp[1], 1, 1)
      g.fill()
    })
  })

  for (var i = 0; i < GAME_TRAILS.length; ++i) {
    var t = GAME_TRAILS[i]
    if (t[2] < now) {
      GAME_TRAILS.splice(i--,1);
    }
    else {
      g.fillStyle = t[1]
      g.beginPath()
      g.rect(t[0][0], t[0][1], 1, 1)
      g.fill()
    }
  }
  for (var i = 0; i < GAME_POINTS.length; ++i) {
    var p = GAME_POINTS[i]
    g.fillStyle = p[i_c]
    var tp = PT.muls(p[i_p], scal, 2)
    tp = PT.sume(tp, half, 2)
    if (ticks % TRAIL_RATE == 0)
      GAME_TRAILS.push([tp, p[i_c], now + pir[i]])
    PT.fillCircle(g, tp, scal * p[i_r])
  }


  // g.fillStyle = 'black'
  // g.fillText(dt, half[0], half[1])
}
