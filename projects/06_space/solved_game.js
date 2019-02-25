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
MU = FU.sqr(2e3)
var body_a = {
  distance: 150,
  offset_angle: PI2 * 0.1,
  color: '#ff80ff',
}
var body_b = {
  distance: 120,
  offset_angle: PI2 * 0.2,
  color: '#ffff80'
}
function get_body_period(body) {
  return  PI2 * Math.sqrt(Math.pow(body.distance, 3) / MU)
}
function get_body_position(body, time) {
  return PT.circle(get_body_angle(body, time), body.distance)
}
function get_body_angle(body, time) {
  return body.offset_angle + PI2 / body.period * time
}
function get_body_speed(body) {
  return Math.sqrt(MU / body.distance)
}
function get_body_velocity(body, time) {
  var angle = body.offset_angle + PI2 / body.period * time
  return PT.muls([-Math.sin(angle), Math.cos(angle)], body.speed)
}
body_a.period = get_body_period(body_a)
body_a.speed = get_body_speed(body_a)
body_b.period = get_body_period(body_b)
body_b.speed = get_body_speed(body_b)

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
  var p = a * (1 - e * e)

  var w = PI2 / t

  var orbit = {
    semi_major_axis: a,
    semi_minor_axis: b,
    focus: f,
    semi_latus_rectum: p,
    argument_of_periapsis: q,
    eccentricity: e,
    angular_frequency: w,
    period: t,
    epoch: epoch,
    standard_gravitational_parameter: mu,
  }
  orbit.epoch = 2 * orbit.epoch - angle4_t(orbit, angle4)
  return orbit
}
function get_orbital_distance(orbit, angle4) {
  var a = orbit.semi_major_axis, ecc = orbit.eccentricity
  var q = orbit.argument_of_periapsis, p = orbit.semi_latus_rectum
  return p / (1 - ecc * Math.cos(angle4 - q))
}
function get_orbital_position(orbit, time) {
  var angle4 = t_angle4(orbit,time)
  var distance = get_orbital_distance(orbit, angle4)
  return PT.circle(angle4, distance)
}

function angle4_t(orbit, angle4) {
  var w = orbit.angular_frequency, ecc = orbit.eccentricity
  var a = orbit.semi_major_axis, b = orbit.semi_minor_axis, f = orbit.focus
  var q = orbit.argument_of_periapsis, p = orbit.semi_latus_rectum

  // angle4 -> angle3
  var angle3 = angle4 - q

  // angle3 -> angle1
  var r = p / (1 - ecc * Math.cos(angle3))
  var angle1 = Math.atan2(a/b*r * Math.sin(angle3), r * Math.cos(angle3) - f)
  angle1 += PI2 * Math.round(angle3 / PI2)

  // angle1 -> time
  var time = (ecc * Math.sin(angle1) + angle1) / w + orbit.epoch
  return time
}
function t_angle4(orbit, time) {
  var w = orbit.angular_frequency, ecc = orbit.eccentricity
  var a = orbit.semi_major_axis, b = orbit.semi_minor_axis, f = orbit.focus
  var q = orbit.argument_of_periapsis

  // time -> angle1
  time -= orbit.epoch
  var angle1 = 0
  var error = 1, tally = 0, abs_time = Math.abs(time)
  var max_error = 1e-4 / (abs_time > 1 ? abs_time : 1)
  for (tally = 0; tally < MAX_TALLY && error > max_error; ++tally) {
    angle1 = time * w - ecc * Math.sin(angle1)
    var temp = (ecc * Math.sin(angle1) + angle1) / w
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

  var time1 = angle4_t(orbit, angle41)
  var time2 = angle4_t(orbit, angle42)

  var body_angle1 = get_body_angle(body, time1)
  var body_position1 = PT.circle(body_angle1, distance)

  var body_angle2 = get_body_angle(body, time2)
  var body_position2 = PT.circle(body_angle2, distance)

  PT.drawLine(G, CNTR, PT.sum(position1, CNTR), body.color)
  PT.drawLine(G, CNTR, PT.sum(position2, CNTR), body.color)

  PT.drawCircle(G, PT.sum(body_position1, CNTR), 5, body.color)
  PT.drawCircle(G, PT.sum(body_position2, CNTR), 5, body.color)
}
function get_intersection(orbit, body, start_time) {
  var a = orbit.semi_major_axis, b = orbit.semi_minor_axis, f = orbit.focus
  var q = orbit.argument_of_periapsis, p = orbit.semi_latus_rectum
  var ecc = orbit.eccentricity, mu = orbit.standard_gravitational_parameter

  var distance = body.distance
  var angle4 = t_angle4(orbit, start_time)
  var angle40 = Math.acos((distance * a - b * b) / distance / f)
  if (isNaN(angle40)) {
    return {
      angle_dist: PI2,
      deltaV: Infinity,
      transit_time: Infinity
    }
  }

  var angles = [
    FU.round_over(q + angle40, angle4, PI2),
    FU.round_over(q - angle40, angle4, PI2),
  ]
  angles[2] = angles[0] + PI2
  angles[3] = angles[1] + PI2

  var stats = []
  var min_angle = Infinity
  var min_stat = null
  for (var i = 0; i < angles.length; ++i) {
    var stat = stats[i] = {}
    stat.angle = angles[i]

    if (stats[i-2]) {
      stat.transit_time = stats[i-2].transit_time + orbit.period
    }
    else {
      stat.transit_time = angle4_t(orbit, stat.angle)
    }

    stat.body_angle = get_body_angle(body, stat.transit_time)
    stat.angle_dist = FU.period_dist(stat.body_angle, stat.angle, PI2)
    if (stat.angle_dist < min_angle) {
      min_stat = stat
      min_angle = stats.angle_dist
    }
  }
  var angle_dist = min_stat.angle_dist
  var body_angle = min_stat.body_angle
  var transit_time = min_stat.transit_time
  var angle = min_stat.angle


  // var angle41 = FU.round_over(q + angle40, angle4, PI2)
  // var angle42 = FU.round_over(q - angle40, angle4, PI2)
  // var transit_time1 = angle4_t(orbit, angle41)
  // var transit_time2 = angle4_t(orbit, angle42)
  // var body_angle1 = get_body_angle(body, transit_time1)
  // var body_angle2 = get_body_angle(body, transit_time2)
  // var angle_dist1 = FU.period_dist(body_angle1, angle41, PI2)
  // var angle_dist2 = FU.period_dist(body_angle2, angle42, PI2)
  //
  // if (angle_dist1 < angle_dist2) {
  //   angle_dist = angle_dist1
  //   body_angle = body_angle1
  //   transit_time = transit_time1
  //   angle = angle41
  // }
  // else {
  //   angle_dist = angle_dist2
  //   body_angle = body_angle2
  //   transit_time = transit_time2
  //   angle = angle42
  // }

  var sin = Math.sin(angle), cos = Math.cos(angle)
  var esinq = ecc * Math.sin(q), ecosq = ecc * Math.cos(q)

  var v1 = PT.muls([esinq - sin, cos - ecosq], Math.sqrt(mu / p))
  var v2 = PT.muls([-sin, cos], Math.sqrt(mu / distance))
  var deltaV = PT.dist(v1, v2)

  return {
    orbit: orbit,
    angle_dist: angle_dist,
    deltaV: deltaV,
    transit_time: transit_time - start_time,
    target_angle: body_angle,
    target_position: PT.circle(body_angle, body.distance),
    self_angle: angle,
    self_position: PT.circle(angle, body.distance)
  }
}

function draw_orbit(orbit, color) {
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

  // velocity
  var body_a_velocity = get_body_velocity(body_a, TIME)
  var body_a_speed = body_a.speed
  var max_speed = Math.sqrt(2) * body_a_speed

  var body_a_position = get_body_position(body_a, TIME)
  var body_b_position = get_body_position(body_b, TIME)


  // draw_porkchop
  var size = 200
  var porkchopsize = PT.muls([1,1], size)
  var array = []
  for (var i = 0; i < size; ++i) {
    var deltaV_scale = i / size
    for (var j = 0; j < size; ++j) {
      var angle_scale = j / size
      var k = j + i * size

      var deltaV = body_a_speed * deltaV_scale
      var angle = PI2 * angle_scale
      var deltaV_vec = PT.circle(angle, deltaV)
      var velocity = PT.sum(body_a_velocity, deltaV_vec)
      var speed = PT.length(velocity)
      if (speed > max_speed) {
        array[k] = {
          angle_dist: PI,
          deltaV: Infinity,
          transit_time: Infinity
        }
      }
      else {
        var orbit = get_orbit(body_a_position, velocity, MU, TIME)
        var intersection = get_intersection(orbit, body_b, TIME)
        array[k] = intersection
      }
      array[k].deltaV += deltaV
    }
  }
  // // var porkchop = ([deltaV_scale, angle_scale]) => {
  // //   var k = Math.floor((angle_scale + deltaV_scale * size) * size)
  // //   return array[k].angle_dist / PI * 4
  // // }
  // // PT.porkchop(G, [], porkchopsize, porkchop)
  //
  // var flag = true
  //
  var valid = []
  for (var i in array) {
    var intersection = array[i]
    if (intersection.angle_dist < 1e-3) {
      valid.push(intersection)

      // var x = intersection.deltaV / max_speed / 2 * WH[0]
      // var y = intersection.transit_time / intersection.orbit.period / 2 * WH[1]
      // PT.fillCircle(G, [x,y], 5, 'red')
    }
  }
  // valid.sort((a,b)=>a.transit_time - b.transit_time)
  valid.sort((a,b)=>a.deltaV - b.deltaV)

  if (valid[0]) {
    G.fillStyle = 'white'
    var int = valid[0]
    G.fillText(`angle_dist: ${int.angle_dist}`, 20, 140)
    G.fillText(`deltaV: ${int.deltaV}`, 20, 160)
    G.fillText(`transit_time: ${int.transit_time}`, 20, 180)

    if (USR_IO_MWS.hsDn) {
      ORBIT = int.orbit
      ORBIT.intersection = int
    }
  }

  if (ORBIT && ORBIT.intersection) {
    var int = ORBIT.intersection
    G.fillStyle = 'white'
    G.fillText(`angle_dist: ${int.angle_dist}`, 20, 40)
    G.fillText(`deltaV: ${int.deltaV}`, 20, 60)
    G.fillText(`transit_time: ${int.transit_time}`, 20, 80)
  }


  // if (USR_IO_MWS[0] < size && USR_IO_MWS[1] < size) {
  //   var k = USR_IO_MWS[1] + USR_IO_MWS[0] * size
  //   var intersection = array[k]
  //   G.fillStyle = 'white'
  //   G.fillText(`angle_dist: ${intersection.angle_dist}`, 20, size + 20)
  //   G.fillText(`deltaV: ${intersection.deltaV}`, 20, size + 40)
  //   G.fillText(`transit_time: ${intersection.transit_time}`, 20, size + 60)
  //
  //   G.fillText(`valid: ${valid.length}`, 20, size + 100)
  //
  //   if (intersection.orbit) {
  //     orbit = intersection.orbit
  //
  //     // draw orbit
  //     draw_orbit(orbit, 'white')
  //     TALLY = 0
  //     var position = get_orbital_position(orbit, TIME)
  //     PT.fillCircle(G, PT.sum(position, CNTR), 5, 'white')
  //     G.fillText(TALLY, 20, 20)
  //
  //     // draw intersection
  //     draw_intersection(orbit, body_a, TIME)
  //     draw_intersection(orbit, body_b, TIME)
  //
  //
  //
  //     flag = false
  //     if (USR_IO_MWS.hsDn) {
  //       ORBIT = orbit
  //     }
  //   }
  // }

  var flag = true
  if (ORBIT && flag) {
    // draw orbit
    draw_orbit(ORBIT, 'white')
    TALLY = 0
    var position = get_orbital_position(ORBIT, TIME)
    PT.fillCircle(G, PT.sum(position, CNTR), 5, 'white')
    G.fillText(TALLY, 20, 20)

    // draw intersection
    draw_intersection(ORBIT, body_a, TIME)
    draw_intersection(ORBIT, body_b, TIME)

    // var intersection_a = get_intersection(ORBIT, body_a, TIME)
    // if (intersection_a.self_position) {
    //   PT.drawCircle(G, PT.sum(intersection_a.self_position,CNTR), 10, body_a.color)
    // }
    // if (intersection_a.target_position) {
    //   PT.drawCircle(G, PT.sum(intersection_a.target_position,CNTR), 10, body_a.color)
    // }
    // var intersection_b = get_intersection(ORBIT, body_b, TIME)
    // if (intersection_b.self_position) {
    //   PT.drawCircle(G, PT.sum(intersection_b.self_position,CNTR), 10, body_b.color)
    // }
    // if (intersection_b.target_position) {
    //   PT.drawCircle(G, PT.sum(intersection_b.target_position,CNTR), 10, body_b.color)
    // }

    // var angle_a = get_body_angle(body_a, TIME)
    // var angle_b = get_body_angle(body_b, TIME)
    // var angle_t = t_angle4(ORBIT, TIME)

    // G.fillStyle = 'white'
    // G.fillText(angle_t, 20, 40)
    // G.fillStyle = body_a.color
    // G.fillText(angle_a, 20, 60)
    // G.fillStyle = body_b.color
    // G.fillText(angle_b, 20, 80)

    // G.fillStyle = body_a.color
    // G.fillText(FU.period_dist(angle_a, angle_t, PI2), 20, 100)
    // G.fillStyle = body_b.color
    // G.fillText(FU.period_dist(angle_b, angle_t, PI2), 20, 120)

    // var dist_a = FU.period_dist(angle_a, angle_t, PI2)
    // var dist_b = FU.period_dist(angle_b, angle_t, PI2)
    // PT.fillCircle(G, PT.muls([0.1,dist_a/PI], WH[1]), 5, body_a.color)
    // PT.fillCircle(G, PT.muls([0.2,dist_b/PI], WH[1]), 5, body_b.color)



    if (USR_IO_MWS.hsRt) ORBIT = null
  }

  // draw shadow test
  // var min_dt = 1e-4
  // var soft_reps = DT / min_dt
  // var hard_reps = Math.ceil(soft_reps)
  // var dt = DT / hard_reps
  //
  // for (var i = 0; i < hard_reps; ++i) {
  //   var distance = PT.length(BODY.position)
  //   PT.vece(BODY.velocity, BODY.position, -dt * MU / Math.pow(distance, 3))
  //   PT.vece(BODY.position, BODY.velocity, dt)
  // }
  // PT.drawCircle(G, PT.sum(BODY.position, CNTR), 5, 'red')
  // G.fillStyle = 'white'
  // G.fillText(`${min_dt} ${dt} ${hard_reps}`, 20, 40)

  PT.drawCircle(G, CNTR, body_a.distance, body_a.color)
  PT.drawCircle(G, CNTR, body_b.distance, body_b.color)
  PT.fillCircle(G, PT.sum(body_a_position, CNTR), 5, body_a.color)
  PT.fillCircle(G, PT.sum(body_b_position, CNTR), 5, body_b.color)
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
