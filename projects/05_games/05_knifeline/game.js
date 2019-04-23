  log = console.log

PROJECT_NAME = 'Knifeline'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false

GAME_MSG = (key, sndr, rcvr, msg) => {
  log(key,sndr,rcvr,msg)
}
GAME_TICK = () => {}

// -----------------------------------------------------------------------------
// STATS
// -----------------------------------------------------------------------------

VIEWPORT = [600,700]

// -----------------------------------------------------------------------------
// SRVR INIT
// -----------------------------------------------------------------------------
GAME_SRVR_INIT = () => {
  log('init game srvr')

  GAMES = []
  PLRS = []

  // SRVR MSG =-----------------------------------------------------------------
  GAME_MSG = (key, sndr, rcvr, msg) => {
    if (sndr == SRVR_CLNT_ID) {
      return
    }

    switch (key) {
      case 'Rqst New Game?': // ------------------------------------------------
        var game = {
          plrs: [],
          nodes: [],
          lines: [],
          id: GAMES.length,
          state: 'start',
        }
        GAMES.push(game)
        HOST_MSG('Join New Game?', null, { plr: msg.plr, game_id: game.id })
        break
      case 'Join Game': // -----------------------------------------------------
        var game = GAMES[msg.game_id]
        var plr = PLRS[sndr]
        if (!plr) {
          err('TODO invalid outcome')
        }
        else if (!game) {
          HOST_MSG('Error', [sndr], `Game ${msg.game_id} does not Exist`)
        }
        else if (game.state != 'start') {
          HOST_MSG('Error', [sndr], `Game ${msg.game_id} is in progress`)
        }
        else {
          if (plr.game) {
            for (var i in plr.game.plrs) {
              if (plr.game.plrs[i] == plr) {
                delete plr.game.plrs[i]
              }
            }
          }
          game.plrs.push(plr)
          plr.game = game
          HOST_MSG('Update Game', [sndr], { game: game })
        }
        break
      case 'Click': // ---------------------------------------------------------
        var plr = PLRS[sndr]
        if (!plr) {
          return
        }
        var game = plr.game
        if (!game) {
          return
        }

        switch (game.state) {
          case 'start':
            break
          case 'node'              break
          case 'link':
            break
          case 'colr':
            break
          case 'knif':
            break
          case 'fnsh':
            break
        }
        break
      default: // --------------------------------------------------------------
        log(key,sndr,rcvr,msg)
    }
  }
}

// -----------------------------------------------------------------------------
// CLNT INIT
// -----------------------------------------------------------------------------

GAME_CLNT_INIT = () => {
  log('init game clnt')

  var game_id = null
  var game = null

  // GAME TICK -----------------------------------------------------------------
  GAME_TICK = () => {
    G = USR_IO_DSPLY.g
    WH = USR_IO_DSPLY.wh

    G.lineWidth = 6
    PT.drawRect(G, [10,10], VIEWPORT, 'white')

    // Rqst New Game -----------------------------------------------------------
    if (USR_IO_KYS.hsDn['q']) {
      HOST_MSG('Rqst New Game?', [SRVR_CLNT_ID], { plr: CLNT_NAME })
    }
    // Send Click Msg ----------------------------------------------------------
    if (USR_IO_MWS.hsUp) {
      HOST_MSG('Click', [SRVR_CLNT_ID], {
        plr: CLNT_NAME,
        mws: PT.copy(USR_IO_MWS),
      })
    }
  }

  // CLNT MSG =-----------------------------------------------------------------
  GAME_MSG = (key, sndr, rcvr, msg) => {
    if (sndr != SRVR_CLNT_ID) {
      return
    }

    switch (key) {
      case 'Join New Game?': // ------------------------------------------------
        // TODO: need to do this better
        var join = confirm(`Join ${msg.plr}'s new game`)
        if (join) {
          HOST_MSG('Join Game', [SRVR_CLNT_ID], {
            plr: CLNT_NAME,
            game_id: msg.game_id
          })
          game_id = msg.game_id
        }
        break
      case 'Update Game': // ---------------------------------------------------
        // TODO this is prolly fine, but may need changes later
        game = msg.game
        if (msg.game.id == game_id) {
        }
        else {
          game = msg.game
          game_id = game.id
        }
        break

      default: // --------------------------------------------------------------
        log(key,sndr,rcvr,msg)
    }
  }
}
