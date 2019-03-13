log = console.log

PROJECT_NAME = 'Factory'
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

// scale
{
  SCALE = 1
  SCALE_HELPER = 1
  LOC = []
  SCALE_HELPER = 1
  SCALE_SPEED = 1e-3
  function get_scale() {
    var h = SCALE_HELPER
    var s = h > 1 ? h : 1 / (h - 2)
    return s * s
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
}

// nodes
{
  /**
  @node
    @factory
    @storage
    @workers
    @items
  */
  NODES = [
    {

    }
  ]
  function draw_node(node) {

  }
}



// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {
  G = USR_IO_DSPLY.g
  WH = USR_IO_DSPLY.wh
  CNTR = PT.divs(WH,2)

  update_scale()

  NODES.forEach(draw_node)
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
