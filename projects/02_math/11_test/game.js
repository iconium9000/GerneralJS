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

MAX_TALLY = 1e2
MU = 1e6
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
  return  PI2 * Math.sqrt(Math.pow(body.distance, 3) / MU)
}
function get_position(body, time) {
  return PT.circle(get_angle(body, time), body.distance)
}
function get_angle(body, time) {
  return body.offset_angle + PI2 / body.period * time
}
body_a.period = get_period(body_a)
body_b.period = get_period(body_b)

// TODO: add inclination support
function get_orbit(p0, v0, mu, epoch) {
  var p01 = p0[0], p02 = p0[1], v01 = v0[0], v02 = v0[1]
  var r = PT.length(p0)
  var v = PT.length(v0)
  var a = 1 / (2/r - v*v/mu)

  var v1 = PT.divs([PT.dot(v0, p0), PT.dot(v0, PT.invert(p0))], r)

  var v11 = v1[0]||0, v12 = v1[1]||0
  var q = [a*v11*v11 + v12*v12*(r-a), (2*a - r) * v11 * v12]
  var e = v11 / PT.dot(v1, PT.unit(q))
  e = v11 == 0 ? (q[1] >= 0 ? 1 : -1) * (r/a - 1) : e

  var f = e * a
  var b = Math.sqrt(a*a - f*f)
  var angle4 = PT.tan2(p0)
  q = angle4 + PT.tan2(q)

  var t0 = p01 * v02 > p02 * v01 ? 1 : -1
  var t = PI2 * t0 * Math.sqrt(Math.pow(a, 3) / mu)

  var orbit = {
    semi_major_axis: a,
    semi_minor_axis: b,
    focus: f,
    argument_of_periapsis: q,
    eccentricity: e,
    period: t,
    epoch: epoch
  }
  orbit.epoch = 2 * orbit.epoch - angle4_t(orbit, angle4)
  return orbit
}
function get_orbital_distance(orbit, angle4) {
  var a = orbit.semi_major_axis, ecc = orbit.eccentricity
  var q = orbit.argument_of_periapsis
  return a * (1 - ecc * ecc) / (1 - ecc * Math.cos(angle4 - q))
}
function get_orbital_position(orbit, time) {
  var angle4 = t_angle4(orbit,time)
  var distance = get_orbital_distance(orbit, angle4)
  return PT.circle(angle4, distance)
}

function angle4_t(orbit, angle4) {
  var tpi2 = orbit.period / PI2, ecc = orbit.eccentricity
  var a = orbit.semi_major_axis, b = orbit.semi_minor_axis, f = orbit.focus
  var q = orbit.argument_of_periapsis

  // angle4 -> angle3
  var angle3 = angle4 - q

  // angle3 -> angle1
  var r = a * (1 - ecc * ecc) / (1 - ecc * Math.cos(angle3))
  var angle1 = Math.atan2(a/b*r * Math.sin(angle3), r * Math.cos(angle3) - f)
  angle1 += PI2 * Math.round(angle3 / PI2)

  // angle1 -> time
  var time = tpi2 * (ecc * Math.sin(angle1) + angle1) + orbit.epoch
  return time
}
function t_angle4(orbit, time) {
  var tpi2 = orbit.period / PI2
  var ecc = orbit.eccentricity
  var a = orbit.semi_major_axis, b = orbit.semi_minor_axis, f = orbit.focus
  var q = orbit.argument_of_periapsis

  // time -> angle1
  time -= orbit.epoch
  var angle1 = 0
  var error = 1, tally = 0, abs_time = Math.abs(time)
  var max_error = 1e-4 / (abs_time > 1 ? abs_time : 1)
  for (tally = 0; tally < MAX_TALLY && error > max_error; ++tally) {
    angle1 = time / tpi2 - ecc * Math.sin(angle1)
    var temp = tpi2 * (ecc * Math.sin(angle1) + angle1)
    error = FU.error(temp, time)
  }
  TALLY = tally

  // angle1 -> angle3
  var angle3 = Math.atan2(b * Math.sin(angle1), f + a * Math.cos(angle1))
  angle3 += PI2 * Math.round(angle1 / PI2)

  // angle3 -> angle4
  var angle4 = angle3 + q
  return angle4
}

ORBIT = null
function draw_intersection(orbit, body, time) {
  var a = orbit.semi_major_axis, b = orbit.semi_minor_axis, f = orbit.focus
  var q = orbit.argument_of_periapsis

  var distance = body.distance

  var angle4 = t_angle4(orbit, time)
  var angle40 = Math.acos((distance * a - b * b) / distance / f)
  var angle41 = FU.round_over(q + angle40, angle4, PI2)
  var angle42 = FU.round_over(q - angle40, angle4, PI2)
  var position1 = PT.circle(angle41, distance)
  var position2 = PT.circle(angle42, distance)

  var time1 = angle4_t(ORBIT, angle41)
  var time2 = angle4_t(ORBIT, angle42)


  var body_angle1 = get_angle(body, time1)
  var body_position1 = PT.circle(body_angle1, distance)

  var body_angle2 = get_angle(body, time2)
  var body_position2 = PT.circle(body_angle2, distance)

  PT.drawLine(G, CNTR, PT.sum(position1, CNTR), body.color)
  PT.drawLine(G, CNTR, PT.sum(position2, CNTR), body.color)

  PT.drawCircle(G, PT.sum(body_position1, CNTR), 5, body.color)
  PT.drawCircle(G, PT.sum(body_position2, CNTR), 5, body.color)
}
function get_intersection(orbit, body, time) {
  var a = orbit.semi_major_axis, b = orbit.semi_minor_axis, f = orbit.focus
  var q = orbit.argument_of_periapsis

  var distance = body.distance
  var angle4 = t_angle4(orbit, time)
  var angle40 = Math.acos((distance * a - b * b) / distance / f)
  var angle41 = FU.round_over(q + angle40, angle4, PI2)
  var angle42 = FU.round_over(q - angle40, angle4, PI2)
  var time1 = angle4_t(ORBIT, angle41)
  var time2 = angle4_t(ORBIT, angle42)
  var body_angle1 = get_angle(body, time1)
  var body_angle2 = get_angle(body, time2)


}

function draw_orbit(orbit, color) {
  var orbit = ORBIT
  var a = orbit.semi_major_axis, f = orbit.focus
  var b = orbit.semi_minor_axis, q = orbit.argument_of_periapsis
  G.strokeStyle = color
  G.beginPath()
  var p = PT.sum(CNTR, PT.circle(q, f))
  G.ellipse(p[0], p[1], a, b, q, 0, PI2)
  G.stroke()
}

START_TIME = null
BODY = {
  position: [80,40],
  velocity: PT.muls([-3.4,8], 1.5e-2 * Math.sqrt(MU))
}

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH, 2)
  TIME = USR_IO_EVNTS.nw * 1e-3
  DT = USR_IO_EVNTS.dt * 1e-3

  START_TIME = START_TIME == null ? TIME : START_TIME

  ORBIT = ORBIT || get_orbit(BODY.position, BODY.velocity, MU, TIME)

  // draw orbit
  draw_orbit(ORBIT, 'white')
  TALLY = 0
  var position = get_orbital_position(ORBIT, TIME)
  PT.fillCircle(G, PT.sum(position, CNTR), 5, 'white')
  G.fillText(TALLY, 20, 20)

  // draw intersection
  draw_intersection(ORBIT, body_a, TIME)
  draw_intersection(ORBIT, body_b, TIME)


  // draw shadow test
  var min_dt = 1e-4
  var soft_reps = DT / min_dt
  var hard_reps = Math.ceil(soft_reps)
  var dt = DT / hard_reps

  for (var i = 0; i < hard_reps; ++i) {
    var distance = PT.length(BODY.position)
    PT.vece(BODY.velocity, BODY.position, -dt * MU / Math.pow(distance, 3))
    PT.vece(BODY.position, BODY.velocity, dt)
  }
  PT.drawCircle(G, PT.sum(BODY.position, CNTR), 5, 'red')
  G.fillStyle = 'white'
  G.fillText(`${min_dt} ${dt} ${hard_reps}`, 20, 40)

  PT.drawCircle(G, CNTR, body_a.distance, body_a.color)
  PT.drawCircle(G, CNTR, body_b.distance, body_b.color)
  PT.fillCircle(G, PT.sum(get_position(body_a, TIME), CNTR), 5, body_a.color)
  PT.fillCircle(G, PT.sum(get_position(body_b, TIME), CNTR), 5, body_b.color)
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
