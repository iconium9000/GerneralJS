log = console.log

PROJECT_NAME = 'DeltaV'
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

// PHYS
{
  GRAV = 6.67408e-11
  STATE_RADIUS = 15
  HOVER_RADIUS = STATE_RADIUS * 1.1
  DRAG_STATE = null
  SEL_STATE = null
  HOVER_STATE = null
  SEL_COLOR = '#202020'
  FILL_COLOR = '#808080'

  ROUND_TO = 1 << 12
  function round(a) {
    return Math.round(a * ROUND_TO) / ROUND_TO
  }

  TICK_DT = 1 / (1 << 4)
  SUB_TICKS = (1 << 4)
  SUB_TICK_DT = TICK_DT / SUB_TICKS
  MAX_TICKS = 1e4

  SEL_BODY = EARTH = {
    name: 'Earth',
    position: [],
    mass: 5.97237e24,
    radius: 6371e3,
    color: '#0080ff',
    velocity: [],

    state: {
      rule: false,
      position: [150, 40],
    },
  }
  MOON = {
    name: 'Moon',
    position: [384399e3],
    radius: 1737.1e3,
    mass: 7.342e22,
    color: '#808080',
    velocity: [0,1e3],

    state: {
      rule: false,
      position: [250, 40],
    },
  }
  EARTH.velocity = PT.muls(MOON.velocity, -MOON.mass / EARTH.mass)
  SHIP = {
    name: 'Ship',
    position: [EARTH.radius + 2e2],
    radius: 9,
    mass: 60e3,
    color: '#00ff00',

    state: {
      position: [350,40],
      rule: ['lock', 0],
    }
  }
  SHIP.velocity = [0,Math.sqrt(GRAV * EARTH.mass / PT.length(SHIP.position))]
  BODIES = [EARTH, MOON, SHIP, ]
  MAJOR_BODIES = [EARTH, MOON, ]
  MINOR_BODIES = [SHIP, ]
  BODIES.forEach(b => {
    b.state.body = b
    b.state.hidden = false
    b.state.deltaV = []
    b.state.sub_states = []
    b.state.vectors = [[
      b.position,
      b.velocity,
    ]]
    b.state.settings = {}
  })

  function draw_state(state, defined, tick) {
    var super_state = state.super_state
    var super_defined = defined
    var color = defined ? state.body.color : FILL_COLOR
    if (super_state) {
      var p1 = state.position
      var p2 = super_state.position
      var mid = state.position
      var partial = false

      if (state.rule[0] == 'time') {
        var state_time = state.rule[1]
        var super_time = (super_state.vectors.length-1) * TICK_DT
        partial = super_time < state_time && state_time
        var scale = partial ? super_time / state_time : 1
        mid = PT.vec(p2, PT.sub(p1,p2), scale)
      }
      PT.drawLine(G, p1, mid, FILL_COLOR)
      PT.drawLine(G, mid, p2, color)

      if (partial) {
        color = FILL_COLOR
        defined = false
      }
    }

    if (PT.dist(USR_IO_MWS, state.position) < STATE_RADIUS) {
      HOVER_STATE = state
    }
    if (state.hidden) {
      PT.drawCircle(G, state.position, STATE_RADIUS, color)
    }
    else {

      if (super_defined && !defined) {
        if (state.rule[0] == 'time') {
          var state_time = state.rule[1]
          var super_time = (super_state.vectors.length-1) * TICK_DT

          while (super_time < state_time && TICKS++ < MAX_TICKS) {
            var prev_vector = super_state.vectors.pop()
            var next_vector = get_minor_vector(super_state, ++tick, prev_vector)
            super_state.vectors.push(prev_vector, next_vector)
            super_time = (super_state.vectors.length-1) * TICK_DT
          }
        }
      }


      PT.fillCircle(G, state.position, STATE_RADIUS, color)
      state.sub_states.forEach(sub_state => draw_state(sub_state,defined,tick))
    }
  }
  drag_state.hlpr = PT.vcc('vv', (p,w)=>p<0?0:p>w?w:p, 2)
  function drag_state(state, drag_by) {
    PT.sume(state.position, drag_by)
    state.position = drag_state.hlpr(state.position, WH)

    state.sub_states.forEach(sub_state => drag_state(sub_state, drag_by))
  }

  function draw_body(body) {
    draw_state(body.state, true, 0)
  }

  function new_state(state) {
    var new_state = {
      super_state: state,
      hidden: false,
      body: state.body,
      deltaV: [],
      position: PT.copy(state.position),
      rule: ['time', 0],
      sub_states: [],
      settings: {},

      vectors: [state.vectors[0]],
    }
    state.sub_states.push(new_state)
    return new_state
  }

  function get_detlav(state) {
    return state ? PT.length(state.deltaV) + get_detlav(state.super_state) : 0
  }

  function setrule(state,rule) {
    // TODO
    var rule_name = rule[0]
    switch (rule_name) {
      case 'time':
        var time = rule[1]
        if (time > 0) {
          rule[1] = round(time)
        }
        else {
          rule[1] = 0
        }
        state.rule = rule
        break
      case 'lock':
        break
    }
  }

  edit_value.shifts = [0.01, 0.1, 1, 10, 1e2, 1e3]
  edit_value.deltav = ['Progrd', 'Radial', 'Normal']
  function edit_value(name, get, set, settings) {
    if (!settings[name]) {
      settings[name] = 1
    }
    var ret = [
      {
        txt: name,
      },
      {
        txt: `-`,
        act: () => set(get() - settings[name]),
      },
      {
        txt: `+`,
        act: () => set(get() + settings[name]),
      },
      {
        txt: get().toFixed(2),
        act: () => {
          set(parseFloat(prompt(`Set ${name}`,'0')))
          USR_IO_MWS.isDn = false
        },
      },
      {
        txt: '0',
        act: () => set(0),
      }
    ]
    edit_value.shifts.forEach(shift => {
      ret.push({
        txt: shift,
        sel: settings[name] == shift ? SEL_COLOR : null,
        act: () => settings[name] = shift,
      })
    })
    return ret
  }

  // sel, txt, act()z
  function edit_state(state) {
    var ret = []

    var sel_color = SEL_COLOR
    var rule = state.rule[0]
    var locked = rule =='lock'
    var rules = [
      {
        txt:'RULE:',
      },
      {
        txt:'lock',
        sel: locked ? sel_color : null,
        act: locked ? null : () => setrule(state,['lock']),
      },
      {
        txt:'time',
        sel: rule == 'time' ? sel_color : null,
        act: locked ? null : () => setrule(state,['time',0]),
      },
    ]
    ret.push(rules)
    if (rule == 'lock') {
      return ret
    }
    else if (rule == 'time') {
      var get = () => state.rule[1]
      var set = t => setrule(state,['time',t])
      ret.push(edit_value('Time', get, set, state.settings))
    }
    var local_dv = PT.length(state.deltaV).toFixed(2)
    var total_dv = get_detlav(state).toFixed(2)
    ret.push([
      {
        txt: 'DetaV',
      },
      {
        txt: `${local_dv} (${total_dv})`,
      }
    ])
    edit_value.deltav.forEach((name,i) => {
      var get = () => state.deltaV[i] || 0
      var set = v => {
        if (isFinite(v) && v != undefined) {
          state.deltaV[i] = round(v)//parseFloat(v.toFixed(2))
          log(round(v))
        }
        else {
          state.deltaV[i] = 0
        }
      }
      ret.push(edit_value(name, get, set, state.settings))
    })
    return ret
  }

  function select_body(body) {
    log(`TODO::Selected '${body.name}'`)
    SEL_BODY = body
  }

  function get_major_vector(body, tick) {
    var vector = body.state.vectors[tick]
    if (vector) {
      return vector
    }

    var prev_tick = body.state.vectors.length
    var mass = []
    for (var t = prev_tick; t < tick; ++t) {
      var vectors = []
      MAJOR_BODIES.forEach(b => vectors.push(b.state.vectors[t-1]))
      FU.forlen(SUB_TICKS, i => {
        var acceleration = []
        vectors.forEach(j => acceleration.push([]))
        FU.forEach2(vectors, ([ap,av],[bp,bv],ai,bi) => {
          var aa = acceleration[ai], ba = acceleration[bi]
          var am = MAJOR_BODIES[ai].mass, bm = MAJOR_BODIES[bi].mass
          var sub = PT.sub(bp,ap)
          var dot = Math.pow(PT.dot(sub,sub), -1.5)
          PT.vece(aa, sub, -bm * dot)
          PT.vece(ba, sub, am * dot)
        })
        vectors.forEach(([p,v], i) => {
          PT.vece(v, acceleration[i], SUB_TICK_DT * GRAV)
          PT.vece(p, v, SUB_TICK_DT)
        })

      })
      MAJOR_BODIES.forEach((b,i) => b.state.vectors[t] = vectors[i])
    }
  }

  function get_minor_vector(state, tick, vector) {
    var major = []
    MAJOR_BODIES.forEach(b => major.push(get_major_vector(b, tick)))
    log(major)

    return vector
  }
}

// PROJ
{
  MIN_RADIUS = 3

  SCALE = 1
  SCALE_HELPER = 1
  LOC = []
  SCALE_HELPER = 1
  SCALE_SPEED = 2e-2
  SCALE_FACTOR = 5e-2
  function get_scale() {
    var h = SCALE_HELPER
    var s = h > 1 ? h : 1 / (h - 2)
    return s * s * SCALE_FACTOR
  }
  SCALE = get_scale()
  function update_scale() {
    if (USR_IO_MWS.hsWl) {
      var pre_scale = SCALE
      SCALE_HELPER += USR_IO_MWS.wlPt[1] * SCALE_SPEED
      SCALE = get_scale()

      PT.vece(LOC, PT.sub(USR_IO_MWS, CNTR), 1/pre_scale - 1/SCALE)
    }
    if (USR_IO_MWS.isDn) {
      PT.sume(LOC, PT.divs(PT.sub(USR_IO_MWS.prv, USR_IO_MWS),SCALE))
    }
  }

  function proj_position_helper2(pos, map_cntr, cntr, scale) {
    return (pos - map_cntr) * scale + cntr
  }
  proj_position_helper = PT.vcc('vvvs', proj_position_helper2, 2)
  function proj_position(pos) {
    return proj_position_helper(pos, LOC, CNTR, SCALE)
  }

  function fillCircle(position,radius,color) {
    var r = radius * SCALE
    r = r > MIN_RADIUS ? r : MIN_RADIUS

    PT.fillCircle(G, proj_position(position), r, color)
  }
}

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

function dorep(dt,f) {
  var soft_reps = dt / MAX_DT
  var hard_reps = Math.ceil(soft_reps)
  var soft_dt = dt / hard_reps

  FU.forlen(hard_reps, i => f(soft_dt))
}

function dodrag() {
  if (USR_IO_MWS.isDn || USR_IO_MWS.isRt) {
    if (DRAG_STATE && USR_IO_MWS.shftDn) {
      var sub = PT.sub(USR_IO_MWS, USR_IO_MWS.prv)
      drag_state(DRAG_STATE, sub)
    }
  }
}

function state_manip() {
  HOVER_STATE = null
  TICKS = 0
  BODIES.forEach(draw_body)

  if (HOVER_STATE) {
    PT.drawCircle(G, HOVER_STATE.position, HOVER_RADIUS, HOVER_STATE.body.color)
  }

  var inbox = SEL_STATE && PT.controlBox(G,SEL_STATE.position,
    WH, 12, USR_IO_MWS, edit_state(SEL_STATE))
  if (inbox) {
    dodrag()
    return
  }

  if (USR_IO_MWS.hsDn) {
    DRAG_STATE = HOVER_STATE
  }
  dodrag()

  if (USR_IO_MWS.hsUp || USR_IO_MWS.rtUp) {
    DRAG_STATE = null
  }

  if (USR_IO_MWS.hsRt) {
    if (HOVER_STATE && HOVER_STATE.rule) {
      if (HOVER_STATE.hidden) {
        if (USR_IO_KYS.isDn['q']) {
          HOVER_STATE.hidden = false
        }
      } else {
        if (USR_IO_MWS.shftDn) {
          DRAG_STATE = new_state(HOVER_STATE)
        }
        else if (USR_IO_KYS.isDn['q']) {
          HOVER_STATE.hidden = true
          SEL_STATE = null
        }
        else if (USR_IO_KYS.isDn['z']) {
          select_body(HOVER_STATE.body)
        }
        else if (SEL_STATE == HOVER_STATE){
          SEL_STATE = null
        }
        else {
          SEL_STATE = HOVER_STATE
        }
      }
    }
    else if (HOVER_STATE) {
      if (USR_IO_KYS.isDn['z']) {
        select_body(HOVER_STATE.body)
      }
    }
    else {
      SEL_STATE = null
    }
  }

}

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH,2)

  DT = USR_IO_EVNTS.dt * 1e-3
  if (isNaN(DT) || DT > 1) DT = 5e-3

  if (USR_IO_KYS.hsDn[']']) {
    SEL_BODY_IDX = (SEL_BODY_IDX+1) % MAJOR_BODIES.length
  }
  if (USR_IO_KYS.hsDn['[']) {
    SEL_BODY_IDX = (SEL_BODY_IDX+MAJOR_BODIES.length-1) % MAJOR_BODIES.length
  }

  state_manip()

  update_scale()
  G.font = `10px arial`
  PT.fillText(G,SCALE_HELPER,[20,20],'white')
  PT.fillText(G,SCALE/SCALE_FACTOR,[20,40],'white')
  PT.fillText(G,SCALE,[20,60],'white')
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
