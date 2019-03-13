log = console.log

PROJECT_NAME = 'Ant Farm'
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

// color
{
  COLORS = ['#ff5050','#00ff80','#0080ff','#ff8000','#ff40ff',
    '#ffff40','#B22222','#00ffff', '#80ff00']
  function get_color() {
    return COLORS[Math.floor(RAND() * COLORS.length)]
  }
}

// scale/zoom
{
  LOC = []
  SCALE_HELPER = 1
  SCALE_SPEED = 1e-3
  SCALE = get_scale()

  function get_scale() {
    var h = SCALE_HELPER
    var s = h > 1 ? h : 1 / (h - 2)
    return s * s
  }

  var in_box_helper = PT.vcc('vv', (p,x1,x2,r) =>
    (x1-r <= p && p <= x2+r) || (x2-r <= p && p <= x1+r), 2)
  function in_box(box1, box2, position, radius) {
    var bool = in_box_helper(proj, box1, box2, radius)
    return bool[0] && bool[1]
  }

  function on_screen(position, radius) {
    var bool = in_box_helper(position, [], WH, radius)
    return bool[0] && bool[1]
  }


  function check_zoom() {
    if (USR_IO_MWS.hsWl) {
      var pre_scale = SCALE
      SCALE_HELPER += USR_IO_MWS.wlPt[1] * SCALE_SPEED
      SCALE = get_scale()
      PT.vece(LOC, PT.sub(USR_IO_MWS, CNTR), 1/pre_scale - 1/SCALE)
    }

    if (USR_IO_MWS.isDn) {
      PT.sume(LOC, PT.divs(PT.sub(USR_IO_MWS.prv, USR_IO_MWS), SCALE))
    }
  }

  function proj_position_helper2(pos, map_cntr, cntr, scale) {
    return (pos - map_cntr) * scale + cntr
  }
  proj_position_helper = PT.vcc('vvvs', proj_position_helper2, 2)
  function proj_position(pos) {
    return proj_position_helper(pos, LOC, CNTR, SCALE)
  }

  function set_proj(object) {
    object.proj = proj_position_helper(object.position, LOC, CNTR, SCALE)
    object.proj_radius = object.radius * SCALE
  }
}

// points
{
  var platter_specs = [30, 200]
  var link_colors = ['white', '#ffffff20', '#ffffff30']

  var moving_idx = 0

  var head_platter = {
    idx: moving_idx++,
    platter_idx: 0,
    position: [],
    radius: 100,
    color: '#ffffff10',
    super_plates: [],
    sub_plates: [],
    links: {}
  }
  var platters = [[head_platter],]
  var link_platters = [{},]

  function get_link(a,b) {
    if (a.platter_idx != b.platter_idx) {
      return null
    }

    if (a.idx > b.idx) {
      var temp = b
      b = a
      a = temp
    }

    var link = a.links[b.idx]
    if (link) {
      return link
    }

    var link = {
      a: a,
      b: b,
      idx: `${a.idx},${b.idx}`,
      length: PT.dist(a.position, b.position),
      color: link_colors[a.platter_idx]
    }

    a.links[b.idx] = link
    b.links[a.idx] = link
    var links = link_platters[a.platter_idx]
    links[link.idx] = link
  }
  function remove_link(link) {
    var platter_idx = link.a.platter_idx
    delete link_platters[platter_idx][link.idx]
    delete link.a.links[link.b.idx]
    delete link.b.links[link.a.idx]
  }
  function link_cross(link_a, link_b) {
    return PT.lineCross(link_a.a.position, link_a.b.position,
      link_b.a.position, link_b.b.position)
  }

  platter_specs.forEach((spec, spec_idx) => {
    spec_idx = spec_idx + 1
    var alpha = Math.floor(0x10 * spec_idx / platter_specs.length).toString(16)
    alpha = ('00' + alpha).slice(alpha.length, alpha.length+2)
    var plates = platters[spec_idx] = []
    var links = link_platters[spec_idx] = {}

    FU.forlen(spec, plate_idx => {
      var plate = {
        idx: moving_idx++,
        platter_idx: spec_idx,
        position: PT.crand(head_platter.position, head_platter.radius),
        color: get_color() + alpha,
        radius: 0,
        super_plates: [],
        sub_plates: [],
        links: {}
      }
      var platter_queue = [head_platter]
      while (platter_queue.length) {
        var platter = platter_queue.splice(0,1)[0]
        var dist = PT.dist(platter.position, plate.position)

        if (platter.radius > dist) {
          if (platter.platter_idx < spec_idx-1) {
            platter_queue = platter_queue.concat(platter.sub_plates)
          }
          else {
            plate.super_plates.push(platter)
            platter.sub_plates.push(plate)
          }
        }
      }
      plates.push(plate)
    })

    var super_plates = platters[spec_idx - 1]
    super_plates.forEach(super_plate => {
      var sub_plates = super_plate.sub_plates
      for (var i = 0; i < sub_plates.length; ++i) {
        var a = sub_plates[i]
        for (var j = i+1; j < sub_plates.length; ++j) {
          var b = sub_plates[j]
          // log('get_link', i, j)
          get_link(a,b)
        }
      }
    })

    var super_links = link_platters[spec_idx - 1]
    FU.forEach(super_links, super_link => {
      var a_plates = super_link.a.sub_plates
      var b_plates = super_link.b.sub_plates

      a_plates.forEach(a_plate =>{
        b_plates.forEach(b_plate => {
          get_link(a_plate, b_plate)
        })
      })
    })

    var link_array = []
    FU.forEach(links, link => link_array.push(link))
    link_array.sort((a,b) => a.length - b.length)

    for (var i = 0; i < link_array.length; ++i) {
      var link_a = link_array[i]
      for (var j = i+1; j < link_array.length; ++j) {
        var link_b = link_array[j]

        if (link_cross(link_a, link_b)) {
          remove_link(link_b)
          link_array.splice(j--, 1)
        }
      }
    }

    plates.forEach(plate => {
      FU.forEach(plate.links, link => {
        var length = link.length
        if (length > plate.radius) {
          plate.radius = link.length
        }
      })
    })




  })

  function draw_plate(plate) {
    if (USR_IO_MWS.isRt && PT.dist(plate.proj, USR_IO_MWS) > plate.proj_radius){
      return
    }
    PT.fillCircle(G, plate.proj, plate.proj_radius, plate.color)
  }
  function draw_link(link) {
    PT.drawLine(G, link.a.proj, link.b.proj, link.color)
  }
}

// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {
  TIME = USR_IO_EVNTS.nw * 1e-3
  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH,2)
  CNTR_LOC = PT.sub(CNTR, LOC)

  check_zoom()

  platters.forEach(plates => plates.forEach(set_proj))
  link_platters.forEach(links => FU.forEach(links, draw_link))
  platters.forEach(plates => plates.forEach(draw_plate))
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
