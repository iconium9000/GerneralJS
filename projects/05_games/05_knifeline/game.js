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

SANITY = 1e3
NEW_GAME_TIMEOUT = 1
VIEWPORT = [600,700]
LINE_WIDTH = 6
DRAW_RADIUS = 20
NODE_RADIUS = DRAW_RADIUS+LINE_WIDTH/2
FONT_SIZE = 30
FONT = `${FONT_SIZE}px sans-serif`
DEF_COLOR = 'white'
KNIFE_COLOR = 'black'
SALT = 1e-7
COLORS = ['#ff5050','#00ff80','#0080ff','#ff8000','#ff40ff',
  '#ffff40','#B22222','#00ffff', '#80ff00']

N_NODES = 3
N_LINKS = n => n < 6 ? n + 1 : 6
N_FOUNTAINS = 2
N_KNIVES = 2

N_TABLE = {
  'node': 'n_nodes',
  'link': 'n_links',
  'fountain': 'n_fountains',
  'knife': 'n_knives',
}
X_TABLE = {
  'node': 'Node(s)',
  'link': 'Link(s)',
  'fountain': 'Fountain(s)',
  'knife': 'Knife(s)',
}

solve_game.min_len = ({nodes, links}, {colors, props}) => {
  var min = Infinity
  links.forEach((link, id) => {
    if (!link) return

    var prop = props[id]
    var c1 = colors[link.node1_id], f1 = c1 != DEF_COLOR && c1 != KNIFE_COLOR
    var c2 = colors[link.node2_id], f2 = c2 != DEF_COLOR && c2 != KNIFE_COLOR

    if (f1 || f2) {
      var len = link.length - prop.p1 - prop.p2
      if (f1 && f2) {
        len /= 2
      }
      if (len > 0 && len < min) {
        min = len
      }
    }
  })
  return min
}
solve_game.at_len = (len, game, solves) => {
  var sel_solve = null
  solves.forEach(solve => {
    if (len > length) {
      sel_solve = solve
    }
  })
  var solve = JSON.parse(JSON.stringify(sel_solve))
  var dif = len - solve.length

  game.links.forEach((link,id) => {
    var c1 = solve.colors[link.node1_id]
    var c2 = solve.colors[link.node2_id]
    var f1 = c1 != DEF_COLOR && c1 != KNIFE_COLOR
    var f2 = c2 != DEF_COLOR && c2 != KNIFE_COLOR
    var len = link.length

    if (f1) {
      prop.p1 += dif
      prop.c1 = c1
    }
    if (f2) {
      prop.p2 += dif
      prop.c2 = c2
    }
  })

  return solve
}
function solve_game(game) {
  var solve = {
    colors: [],
    props: [],
    length: 0,
  }
  game.nodes.forEach(node => {
    var stat = game.stats[node.clnt_id]
    solve.colors.push(ink = node.fountain ? stat.color :
      node.knife ? KNIFE_COLOR : DEF_COLOR)
  })
  game.links.forEach((link,id) => {
    if (!link) {
      return
    }

    var c1 = solve.colors[link.node1_id]
    var c2 = solve.colors[link.node2_id]
    solve.props[id] = { p1: 0, p2: 0, c1: c1, c2: c2, locked: false, }
  })
  // --------------------------------------------------------------------------|

  var sanity = SANITY
  var solves = [JSON.parse(JSON.stringify(solve))]
  var min_len = 0
  while (isFinite(min_len = solve_game.min_len(game, solve)) && --sanity > 0) {

    log('min_len', min_len)
    game.links.forEach((link,id) => {
      if (!link) return

      var prop = solve.props[id]
      if (prop.locked) {
        return
      }

      var c1 = solve.colors[link.node1_id]
      var c2 = solve.colors[link.node2_id]
      var f1 = c1 != DEF_COLOR && c1 != KNIFE_COLOR
      var f2 = c2 != DEF_COLOR && c2 != KNIFE_COLOR
      var len = link.length

      if (f1) {
        prop.p1 += min_len
        prop.c1 = c1
      }
      if (f2) {
        prop.p2 += min_len
        prop.c2 = c2
      }
      var over = prop.p1 + prop.p2 - len
      if (over >= 0) {
        prop.locked = true

        if (f1 && f2) {
          prop.p1 -= over / 2
          prop.p2 -= over / 2
        }
        else if (f1 && c2 != KNIFE_COLOR) {
          solve.colors[link.node2_id] = c1
        }
        else if (f2 && c1 != KNIFE_COLOR) {
          solve.colors[link.node1_id] = c2
        }
      }
    })

    solve.length += min_len
    solves.push(JSON.parse(JSON.stringify(solve)))
  }

  if (sanity <= 0) {
    log('SANITY')
  }

  return solves
}

// -----------------------------------------------------------------------------
// SRVR INIT
// -----------------------------------------------------------------------------
GAME_SRVR_INIT = () => {
  log('init game srvr')

  GAMES = []

  // --------------------------------------------------------------------------|
  function new_node(game, sndr, position) {
    var node = {
      id: game.nodes.length,
      clnt_id: sndr,
      position: position,
      fountain: false,
      knife: false,
      links: {},
    }
    game.nodes.push(node)
    return node
  }

  // --------------------------------------------------------------------------|
  function new_link(game, sndr, node1, node2) {
    if (node1.links[node2.id]) {
      return
    }

    var dist = PT.dist(node1.position, node2.position)
    var link = {
      id: game.links.length,
      clnt_id: sndr,
      node1_id: node1.id,
      node2_id: node2.id,
      dist: dist,
      length: dist - NODE_RADIUS * 2 + SALT * Math.random(),
    }
    game.links.push(link)
    node1.links[node2.id] = true
    node2.links[node1.id] = true
    return link
  }

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
                name: clnt.name,
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
        var node = null, node_soi = false
        for (var i in game.nodes) {
          var temp_node = game.nodes[i]
          var dist = PT.dist(temp_node.position, msg.mws)
          if (dist < NODE_RADIUS) {
            node = temp_node
          }
          if (dist < 2 * NODE_RADIUS) {
            node_soi = true
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
            var p1 = game.nodes[temp_link.node1_id].position
            var p2 = game.nodes[temp_link.node2_id].position

            var point = PT.closest_point_on_line(msg.mws, p1, p2)
            if (point && PT.dist(msg.mws, point) < NODE_RADIUS) {
              closest_points.push(temp_link, point)
            }
          }
          // ---------------------------------------------------------------||||
          log(closest_points)
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
            if (node || node_soi || stat.n_nodes <= 0) {
              return
            }

            // -------------------------------------------------------------||||
            new_node(game, sndr, msg.mws)
            stat.n_nodes -= 1
            game.n_nodes -= 1
            if (game.n_nodes <= 0) {
              game.state = 'link'
            }
            break

          // ----------------------------------------------------------------|||
          case 'link':
            if (!node) {
              stat.sel_node_id = -1
              break
            }

            if (stat.n_links <= 0) {
              return
            }

            var sel_node = game.nodes[stat.sel_node_id]
            if (sel_node) {

              if (new_link(game, sndr, node, sel_node)) {
                stat.n_links -= 1
                game.n_links -= 1
                stat.sel_node_id = -1
                if (game.n_links <= 0) {
                  game.state = 'fountain'
                }
                break
              }
              else {
                return
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

          // ----------------------------------------------------------------|||
          case 'knife':
            if (stat.n_knives <= 0) {
              return
            }

            if (link && !node && !node_soi) {
              var node1 = game.nodes[link.node1_id]
              var node2 = game.nodes[link.node2_id]
              delete game.links[link.id]
              delete node1.links[node2.id]
              delete node2.links[node1.id]

              node = new_node(game, sndr, link_point)
              new_link(game, sndr, node, node1)
              new_link(game, sndr, node, node2)
            }

            if (node) {
              if (node.fountain || node.knife) {
                return
              }

              node.clnt_id = sndr
              node[game.state] = true
            }
            else {
              return
            }

            if (game.state == 'fountain') {
              stat.n_fountains -= 1
              game.n_fountains -= 1
              if (game.n_fountains <= 0) {
                game.state = 'knife'
              }
            }
            else {
              stat.n_knives -= 1
              game.n_knives -= 1
              if (game.n_knives <= 0) {
                game.state = 'finished'
              }
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

    G.lineWidth = LINE_WIDTH
    G.font = FONT
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

    var wh = [LINE_WIDTH*3, LINE_WIDTH*2+FONT_SIZE]
    if (game) {
      game.links.forEach(link => {
        if (!link) {
          return
        }

        var p1 = game.nodes[link.node1_id].position
        var p2 = game.nodes[link.node2_id].position
        var stat = game.stats[link.clnt_id]
        var color = game.state == 'link' && stat ? stat.color : DEF_COLOR

        PT.drawLine(G, p1, p2, color)
      })

      var plr_stat = game.stats[CLNT_ID]
      if (game.state == 'link' && plr_stat && plr_stat.sel_node_id >= 0) {
        var sel_node = game.nodes[plr_stat.sel_node_id]

        PT.drawLine(G, sel_node.position, USR_IO_MWS, plr_stat.color)
      }

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
            in_color = out_color = stat.color
          }
        }
        if (node.knife) {
          var stat = game.stats[node.clnt_id]
          out_color = KNIFE_COLOR
          if (stat) {
            in_color = stat.color
          }
        }

        PT.fillCircle(G, node.position, DRAW_RADIUS, in_color)
        PT.drawCircle(G, node.position, DRAW_RADIUS, out_color)
      })

      var nt = N_TABLE[game.state], xt = X_TABLE[game.state]
      if (nt) {
        FU.forEach(game.stats, stat => {
          var txt = `${stat.name} (${xt}: ${stat[nt]})`
          PT.fillText(G, txt, wh, stat.color)
          wh[1] += FONT_SIZE + LINE_WIDTH
        })
      }
      else {
        PT.fillText(G, 'TODO GAME OVER!', wh, 'white')
      }
    }
    else {
      PT.fillText(G, 'No Game', wh,'white')
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
        var solves = solve_game(game)
        var solve = solve_game.at_len(100, game, solves)
        log(solve, solves)
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
