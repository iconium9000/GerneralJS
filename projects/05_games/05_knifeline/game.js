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
NODE_RADIUS = 20
NEW_GAME_TIMEOUT = 10

// -----------------------------------------------------------------------------
// SRVR INIT
// -----------------------------------------------------------------------------
GAME_SRVR_INIT = () => {
  log('init game srvr')

  GAMES = []

  function new_node(game, position) {
    var node = {
      id: game.nodes.length,
      position: position,
    }
    game.nodes.push(node)
    return node
  }
  function color_node(game, sndr, node) {
    // TODO color_node
  }
  function new_link(game, sndr, node1, node2) {
    // TODO new_link
  }
  function split_link(game, sndr, link, point) {
    // TODO split_link
  }
  function update_game(game) {
    HOST_MSG('Update Game', game.clnts, { game: game })
  }


  // SRVR MSG =-----------------------------------------------------------------
  GAME_MSG = (key, sndr, rcvr, msg) => {
    if (sndr == SRVR_CLNT_ID) {
      return
    }

    var clnt = SRVR_CLNTS[sndr]
    if (!clnt) {
      // this shouldn't happen :)
      log('TODO no clnt')
      return
    }

    switch (key) {
      case 'Rqst New Game?': // ------------------------------------------------
        // TODO new game
        var game = {
          clnts: [],
          nodes: [],
          lines: [],
          stats: {},
          id: GAMES.length,
          state: 'start',
        }
        GAMES.push(game)
        HOST_MSG('Join New Game?', null, { name: clnt.name, game_id: game.id })
        var timeout = NEW_GAME_TIMEOUT
        var timer = () => {
          HOST_MSG('Msg', null, `timeout ${timeout}`)
          if (--timeout > 0) {
            setTimeout(timer, 1000)
          }
          else {
            log('start game!')
          }
        }

        setTimeout(timer, 1000)
        return
      case 'Join Game': // -----------------------------------------------------
        var game = GAMES[msg.game_id]
        if (!game) {
          // game does not exist
          HOST_MSG('Error', [sndr], `Game '${msg.game_id}' does not exist`)
        }
        else if (game.state != 'start') {
          // game in progress (can't join game)
          HOST_MSG('Error', [sndr], `Game '${msg.game_id}' is in progress`)
        }
        else {
          // remove player from game
          if (clnt.game) {
            var idx = clnt.game.clnts.indexOf(sndr)
            if (idx > -1) {
              clnt.game.clnts.splice(idx,1)
            }
          }

          // join clnt to game
          game.clnts.push(sndr)
          game.stats[sndr] = {}
          clnt.game = game
          log(`add ${clnt.name} to game ${game.id}`)
        }
        return
      case 'Click': // ---------------------------------------------------------
        var game = clnt.game
        if (!game) {
          log('TODO no game')
          return // if no game, no clicks. join a game stupid.
        }
        var stat = game.stats[sndr]
        if (!stat) {
          log('TODO no game stat for ', clnt.name)
          return // REALLY shouldn't happen, but hey, doesn't hurt to check
        }

        // select node if mws dist to node is less than NODE_RADIUS
        // select the most recent (topmost) node ---------------------------
        var node = null
        for (var i in game.nodes) {
          var temp_node = game.nodes[i]
          if (PT.dist(temp_node.position, msg.mws) < NODE_RADIUS) {
            node = temp_node
          }
        }

        // select closest link to mws
        // if several links are close by, don't select any of them ----------
        var link = null, link_point = null
        {
          var closest_points = []
          for (var i in game.links) {
            var temp_link = game.links[i]
            var p1 = temp_link.node1.position
            var p2 = temp_link.node2.position

            var point = PT.closest_point_on_line(mws, p1, p2)
            if (point && PT.dist(mws, point) < NODE_RADIUS) {
              closest_points.push(link, point)
            }
          }

          link_point = closest_points.pop()
          link = closest_points.pop()
          if (closest_points.length) {
            link = link_point = null
          }
        }

        // actions depend on the game's state
        switch (game.state) {
          case 'start': // -------------------------------------------------
            // do nothing
            // can't do anything till game starts
            return
          case 'node': // --------------------------------------------------
            // TODO check if player can place node
            if (node) {
              // do nothing
              // usr selected a node
            }
            else {
              // create new node
              new_node(game, sndr, msg.mws)
              update_game(game)
            }
            return
          case 'link': // ---------------------------------------------------
            // TODO check if player can place link
            if (node) {
              var sel_node = game.nodes[stat.sel_node_id]
              if (sel_node) {
                new_link(game, sndr, node, sel_node)
                stat.sel_node_id = null
              }
              else {
                stat.sel_node_id = node.id
              }
              update_game(game)
            }
            return
          case 'fountain': // -----------------------------------------------
          case 'knife': // --------------------------------------------------
            // TODO check if player can place fountain or knife
            if (node) {
              if (node.color != NODE_COLOR) {
                // do nothing, someone has claimed this node for themselves
                return
              } else {
                // claim this node for your own.
                color_node(game, sndr, node)
              }
            }
            else if (link) {
              split_link(game, sndr, link, link_point)
            }
            else {
              // do nothing, you haven't selected either a node or a link
              return
            }
            update_game(game)
            return
          case 'finished': // -----------------------------------------------
            // do nothing, game is over
            return
          default: // -------------------------------------------------------
            // invalid state, this shouldn't happen
            return
        }
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

  var game_id = null, game = null

  // GAME TICK -----------------------------------------------------------------
  GAME_TICK = () => {
    G = USR_IO_DSPLY.g
    WH = USR_IO_DSPLY.wh

    G.lineWidth = 6
    PT.drawRect(G, [10,10], VIEWPORT, 'white')

    // Rqst New Game -----------------------------------------------------------
    if (USR_IO_KYS.hsDn['q']) {
      HOST_MSG('Rqst New Game?', [SRVR_CLNT_ID])
    }
    // Send Click Msg ----------------------------------------------------------
    if (USR_IO_MWS.hsUp) {
      HOST_MSG('Click', [SRVR_CLNT_ID], {
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
      case 'Error': // ---------------------------------------------------------
        alert(msg)
        return
      case 'Msg': // -----------------------------------------------------------
        // TODO msg
        log(msg)
        return
      case 'Join New Game?': // ------------------------------------------------
        // TODO: need to do this better
        var join = confirm(`Join ${msg.name}'s new game`)
        if (join) {
          HOST_MSG('Join Game', [SRVR_CLNT_ID], { game_id: msg.game_id })
        }
        return
      case 'Update Game': // ---------------------------------------------------
        // TODO this is prolly fine, but may need changes later
        game = msg.game
        if (msg.game.id == game_id) {
        }
        else {
          game = msg.game
          game_id = game.id
        }

        log('Update Game', game_id, game)
        return

      default: // --------------------------------------------------------------
        log(key,sndr,rcvr,msg)
    }
  }
}
