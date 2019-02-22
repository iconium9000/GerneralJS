log = console.log

PROJECT_NAME = 'Template Project'
GAME_HIDE_CURSER = false
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



// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

var mu = 1e5
var body_a = {
  distance: 100,
  offset_angle: PI2 * 0.1,
  color: '#ff80ff',
}
var body_b = {
  distance: 200,
  offset_angle: PI2 * 0.2,
  color: '#ffff80'
}
function get_period(body) {
  return  PI2 * Math.sqrt(Math.pow(body.distance, 3) / mu)
}
function get_position(body) {
  return PT.circle(get_angle(body), body.distance)
}
function get_angle(body) {
  return body.offset_angle + PI2 / body.period * TIME
}
body_a.period = get_period(body_a)
body_b.period = get_period(body_b)

function get_orbit(p0, v0, mu) {
  var o = { p0: p0, v0: v0, mu: mu }
  var p0 = p0[0], p1 = p0[1], v01 = v0[0], v02 = v0[1]
  o.r = PT.length(o.p0)
  o.v = PT.length(o.v0)
  o.a = 1 / (2/r - o.v*o.v/mu)
  o.v1 = PT.divs([PT.dot(v0,p0), PT.dot(v0, PT.invert(p0))], o.r)
  var v11 = o.v1[0], v12 = o.v1[1]
  o.q = [o.a*v11*v11 + v12*(o.r-o.a), (2*o.a - o.r) * v11 * v12]
  o.e = v11 / PT.dot(o.v1, PT.unit(o.q))
  o.e = v11 == 0 ? (o.q[1] >= 0 ? 1 : -1) * (o.r/o.a - 1) : o.e
  o.f = o.e * o.a
  o.b = Math.sqrt(o.a*o.a - o.f*o.f)
  o.q = PT.tan2(o.q) + Pt.tan2(p0)
  o.t0 = p01 * v02 > p02 * v01 ? 1 : -1
  o.t = PI2 * o.t0 * Math.sqrt(Math.pow(o.a, 3), mu)
}

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH, 2)
  TIME = USR_IO_EVNTS.nw * 1e-3

  var e = 0.4
  var a = 150
  var f = e * a
  var b = Math.sqrt(a*a - f*f)
  var q = PI2 * 0.2
  G.strokeStyle = 'white'
  G.beginPath()
  var p = PT.sum(CNTR, PT.circle(q, f))
  G.ellipse(p[0], p[1], a, b, q, 0, PI2)
  G.stroke()


  PT.drawCircle(G, CNTR, body_a.distance, body_a.color)
  PT.drawCircle(G, CNTR, body_b.distance, body_b.color)
  PT.fillCircle(G, PT.sum(get_position(body_a), CNTR), 5, body_a.color)
  PT.fillCircle(G, PT.sum(get_position(body_b), CNTR), 5, body_b.color)
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
