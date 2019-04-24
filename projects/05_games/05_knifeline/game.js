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
DEF_COLOR = 'white'
KNIFE_COLOR = 'black'
NEW_GAME_TIMEOUT = 10
COLORS = ['#ff5050','#00ff80','#0080ff','#ff8000','#ff40ff',
  '#ffff40','#B22222','#00ffff', '#80ff00']

N_NODES = 3
N_LINKS = n => n < 6 ? n + 1 : 6
N_FOUNTAINS = 2
N_KNIVES = 2

// -----------------------------------------------------------------------------
// SRVR INIT
// -----------------------------------------------------------------------------
GAME_SRVR_INIT = () => {
  log('init game srvr')

  GAMES = []

  // SRVR MSG -----------------------------------------------------------------|
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
      // ---------------------------------------------------------------------||
      case 'Rqst New Game?':

        // ------------------------------------------------------------------|||
        // TODO new game
        var game = {
          id: GAMES.length,
          name: clnt.name,
          state: 'start',
          clnt_ids: [],
          nodes: [],
          links: [],
          stats: {},
          n_nodes: 0,
          n_links: 0,
          n_fountains: 0,
          n_knives: 0,
        }
        GAMES.push(game)

        // ------------------------------------------------------------------|||
        HOST_MSG('Join New Game?', null, { name: game.name, game_id: game.id })

        // ------------------------------------------------------------------|||
        var timeout = NEW_GAME_TIMEOUT
        var timer = () => {
          HOST_MSG('Game Timer', null, {
            game_id: game.id,
            timeout: timeout,
            name: game.name,
          })
          // ---------------------------------------------------------------||||
          if (--timeout > 0) {
            setTimeout(timer, 1000)
          }
          // ---------------------------------------------------------------||||
          else {
            // start game
            var n_clnts = game.clnt_ids.length > COLORS.length
              ? COLORS.length
              : game.clnt_ids.length
            log(`start game ${game.id} ${game.name} with '${n_clnts}' clnts`)
            var n_links = N_LINKS(n_clnts)

            game.n_nodes = n_clnts * N_NODES
            game.n_fountains = n_clnts * N_FOUNTAINS
            game.n_knives = n_clnts * N_KNIVES
            game.n_links = n_clnts * n_links

            FU.forEach(game.clnt_ids, (clnt_id, idx) => {
              if (idx >= COLORS.length) {
                return // need more colors
              }
              var clnt = SRVR_CLNTS[clnt_id]

              game.stats[clnt_id] = {
                sel_node_id: -1,
                color: COLORS[idx],
                name:
                n_nodes: N_NODES,
                n_fountains: N_FOUNTAINS,
                n_knives: N_KNIVES,
                n_links: n_links,
              }
            })

            game.state = 'node'
            HOST_MSG('Update Game', game.clnt_ids, { game: game })
          }
        }
        setTimeout(timer, 1000)
        return

      // ---------------------------------------------------------------------||
      case 'Join Game':
        var game = GAMES[msg.game_id]
        if (!game) {
          // game does not exist
          HOST_MSG('Error', [sndr], `Game '${msg.game_id}' does not exist`)
        }
        else {
          // remove clnt from its prev game
          if (clnt.game) {
            var idx = clnt.game.clnt_ids.indexOf(sndr)
            if (idx > -1) {
              clnt.game.clnt_ids.splice(idx,1)
            }
          }

          // join clnt to game
          game.clnt_ids.push(sndr)
          clnt.game = game
          log(`add ${clnt.name} to game ${game.id}`)
        }
        return

      // ---------------------------------------------------------------------||
      case 'Click':

        // ------------------------------------------------------------------|||
        var game = clnt.game
        if (!game) {
          log('TODO no game')
          return // if no game, no clicks. join a game stupid.
        }

        // ------------------------------------------------------------------|||
        var stat = game.stats[sndr]
        if (!stat) {
          log('TODO no game stat for ', clnt.name)
          return // REALLY shouldn't happen, but hey, doesn't hurt to check
        }

        // ------------------------------------------------------------------|||
        // select node if mws dist to node is less than NODE_RADIUS
        // select the most recent (topmost) node
        var node = null
        var rad = (game.state == 'node' ? 2 : 1) * NODE_RADIUS
        for (var i in game.nodes) {
          var temp_node = game.nodes[i]
          if (PT.dist(temp_node.position, msg.mws) < rad) {
            node = temp_node
          }
        }

        // ------------------------------------------------------------------|||
        // select closest link to mws
        // if several links are close by, don't select any of them
        var link = null, link_point = null
        {
          // ---------------------------------------------------------------||||
          var closest_points = []
          for (var i in game.links) {
            var temp_link = game.links[i]
            var p1 = game.nodes[temp_link.node1].position
            var p2 = game.nodes[temp_link.node2].position

            var point = PT.closest_point_on_line(mws, p1, p2)
            if (point && PT.dist(mws, point) < NODE_RADIUS) {
              closest_points.push(link, point)
            }
          }
          // ---------------------------------------------------------------||||
          link_point = closest_points.pop()
          link = closest_points.pop()
          if (closest_points.length) {
            link = link_point = null
          }
        }

        // actions depend on the game's state
        switch (game.state) {
          // ----------------------------------------------------------------|||
          case 'start':
            // do nothing
            // can't do anything till game starts
            return

          // ----------------------------------------------------------------|||
          case 'node':
            // Check if player can place node
            if (node || stat.n_nodes <= 0) {
              return
            }

            // -------------------------------------------------------------||||
            var node = {
              id: game.nodes.length,
              clnt: sndr,
              position: msg.mws,
              fountain: false,
              knife: false,
              links: {},
            }
            stat.n_nodes -= 1
            game.n_nodes -= 1
            game.nodes.push(node)
            if (game.n_nodes <= 0) {
              game.state = 'link'
            }
            break

          // ----------------------------------------------------------------|||
          case 'link':
            if (!node || stat.n_links <= 0) {
              return
            }

            var sel_node = game.nodes[stat.sel_node_id]
            if (sel_node) {

              if (node == sel_node || node.links[sel_node.id]) {
                return
              }

              // -----------------------------------------------------------||||
              var link = {
                id: game.links.length,
                clnt: sndr,
                node1_id: node.id,
                node2_id: sel_node.id,
              }
              game.links.push(link)
              node.links[sel_node.id] = true
              sel_node.links[node.id] = true
              stat.n_links -= 1
              game.n_links -= 1
              if (game.n_links <= 0) {
                game.state = 'fountain'
              }
            }
            else {
              stat.sel_node_id = node.id
            }
            break

          // ----------------------------------------------------------------|||
          case 'fountain':
            if (stat.n_fountains <= 0) {
              return
            }

            if (node) {
              if (node.fountain) {
                return
              }

              node.clnt = sndr
              node.fountain = true
            }
            else if (link) {

              delete game.links[link.id]
              var node1 = game.nodes[link.node1_id]
              var node2 = game.nodes[link.node2_id]
              delete node1[node2.id]
              delete node2[node1.id]

              var node = {
                id: game.nodes.length,
                clnt: sndr,
                position: position,
                fountain: false,
                knife: true,
                links: {},
              }
              game.nodes.push(node)

              var link1 = {
                id: game.links.length,
                clnt: sndr,
                node1_id: node1.id,
                node2_id: node2.id,
              }
              game.links.push(link1)
              node1.links[node.id] = true
              node.links[node1.id] = true

              var link2 = {
                id: game.links.length,
                clnt: sndr,
                node1_id: node.id,
                node2_id: node2.id,
              }
              game.links.push(link2)
              node.links[node2.id] = true
              node2.links[node.id] = true
            }
            else {
              return
            }

            game.n_fountains -= 1
            stat.n_fountains -= 1
            if (game.n_fountains <= 0) {
              game.state = 'knife'
            }
            break

          // ----------------------------------------------------------------|||
          case 'knife':
            if (stat.n_knives <= 0) {
              return
            }

            if (node) {
              if (node.fountain || node.knife) {
                return
              }

              node.clnt = sndr
              node.knife = true
            }
            else if (link) {

              delete game.links[link.id]
              var node1 = game.nodes[link.node1]
              var node2 = game.nodes[link.node2]
              delete node1[node2.id]
              delete node2[node1.id]

              var node = {
                id: game.nodes.length,
                clnt: sndr,
                position: position,
                fountain: false,
                knife: true,
                links: {},
              }
              game.nodes.push(node)

              var link1 = {
                id: game.links.length,
                clnt: sndr,
                node1_id: node1.id,
                node2_id: node.id,
              }
              game.links.push(link1)
              node1.links[node.id] = true
              node.links[node1.id] = true

              var link2 = {
                id: game.links.length,
                clnt: sndr,
                node1_id: node.id,
                node2_id: node2.id,
              }
              game.links.push(link2)
              node.links[node2.id] = true
              node2.links[node.id] = true
            }
            else {
              return
            }

            game.n_knives -= 1
            stat.n_knives -= 1
            if (game.n_knives <= 0) {
              game.state = 'finished'
            }
            break

          // ----------------------------------------------------------------|||
          case 'finished':
            // do nothing, game is over
            return

          // ----------------------------------------------------------------|||
          default:
            // invalid state, this shouldn't happen
            return
        }
        HOST_MSG('Update Game', game.clnt_ids, { game: game })
        return

      default: // -----------------------------------------------------------|||
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

  // GAME TICK ----------------------------------------------------------------|
  GAME_TICK = () => {
    G = USR_IO_DSPLY.g
    WH = USR_IO_DSPLY.wh

    G.lineWidth = 6
    PT.drawRect(G, [10,10], VIEWPORT, 'white')

    // Rqst New Game ---------------------------------------------------------||
    if (USR_IO_KYS.hsDn['q']) {
      HOST_MSG('Rqst New Game?', [SRVR_CLNT_ID])
    }
    // Send Click Msg --------------------------------------------------------||
    if (USR_IO_MWS.hsUp) {
      HOST_MSG('Click', [SRVR_CLNT_ID], { mws: PT.copy(USR_IO_MWS) })
      log('Click', game)
    }

    if (game) {
      game.links.forEach(link => {
        if (!link) {
          return
        }

        var p1 = game.nodes[link.node1].position
        var p2 = game.nodes[link.node2].position
        var stat = game.stats[link.clnt]
        var color = game.state == 'link' && stat ? stat.color : DEF_COLOR

        PT.drawLine(G, p1, p2, color)
      })

      game.nodes.forEach(node => {
        var in_color = 'white'
        var out_color = 'white'

        if (game.state == 'node') {
          var stat = game.stats[node.clnt_id]
          if (stat) {
            out_color = stat.color
          }
        }

        if (node.fountain) {
          var stat = game.stats[node.clnt_id]
          if (stat) {
            in_color = stat.color
          }
        }
        if (node.knife) {
          var stat = game.stats[node.clnt_id]
          in_color = KNIFE_COLOR
          if (stat) {
            out_color = stat.color
          }
        }

        PT.fullCircle(G, node.position, NODE_RADIUS, in_color)
        PT.drawCircle(G, node.position, NODE_RADIUS, out_color)
      })


    }
  }

  // CLNT MSG -----------------------------------------------------------------|
  GAME_MSG = (key, sndr, rcvr, msg) => {

    if (sndr != SRVR_CLNT_ID) {
      return
    }
    switch (key) {
      // ---------------------------------------------------------------------||
      case 'Error':
        alert(msg)
        return
      // ---------------------------------------------------------------------||
      case 'Msg':
        // TODO msg
        log(msg)
        return
      // ---------------------------------------------------------------------||
      case 'Join New Game?':
        // rcv new game invite
        var join = confirm(`Join ${msg.name}'s new game`)
        if (join) {
          HOST_MSG('Join Game', [SRVR_CLNT_ID], { game_id: msg.game_id })
        }
        return
      // ---------------------------------------------------------------------||
      case 'Update Game':
        // TODO game update
        game = msg.game
        log('game', game)
        return
      // ---------------------------------------------------------------------||
      case 'Game Timer':
        // TODO game timer
        // msg.timout
        // msg.game_id
        // msg.name
        log('timer', msg.timeout, msg.game_id, msg.name)

        return
      // ---------------------------------------------------------------------||
      default:
        log(key,sndr,rcvr,msg)
    }
  }
}


// -----------------------------------------------------------------------------
// FIN
// -----------------------------------------------------------------------------
