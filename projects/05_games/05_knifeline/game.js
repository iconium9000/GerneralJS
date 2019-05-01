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

GROUTH_SPEED = 5e-2
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
MIN_LEN = 1e-10
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


function copy_solve(solve) {
  return JSON.parse(JSON.stringify(solve))
}
function min_pipe_len(solve) {
  var min = Infinity
  solve.pipes.forEach(pipe => {
    var c1 = solve.colors[pipe.c1], c2 = solve.colors[pipe.c2]
    var f1 = c1 != DEF_COLOR && c1 != KNIFE_COLOR
    var f2 = c2 != DEF_COLOR && c2 != KNIFE_COLOR

    if (f1 || f2) {
      var len = pipe.len - pipe.len1 - pipe.len2

      if (f1 && f2) {
        len /= 2
      }

      if (MIN_LEN < len && len < min) {
        min = len
      }
    }
  })
  return min
}
function solve_game(game) {

  log('solve_game')

  var solve = {
    len: 0,
    pipes: [],
    colors: [],
  }
  // --------------------------------------------------------------------------|
  game.links.forEach((link,id) => {
    var pipe = {
      id: id,
      c1: solve.colors.length,
      c2: solve.colors.length+1,
      len: link.length,
      len1: 0, len2: 0,
      locked: false,
      pipes: [],
    }
    solve.pipes.push(pipe)
    solve.colors.push(DEF_COLOR,DEF_COLOR)
  })
  // --------------------------------------------------------------------------|
  game.nodes.forEach((node,id) => {
    var stat = game.stats[node.clnt_id]
    var c = node.fountain ? stat ? stat.color :
      DEF_COLOR : node.knife ? KNIFE_COLOR : DEF_COLOR
    var len = c == DEF_COLOR ? 0 : 0.5

    node.sub_links.forEach((sub_link, i) => {
      var pipe_len = len * sub_link.length
      var link1 = game.links[sub_link.link1_id]
      var link2 = game.links[sub_link.link2_id]
      var pipe1 = solve.pipes[sub_link.link1_id]
      var pipe2 = solve.pipes[sub_link.link2_id]

      var pipe = {
        id: solve.pipes.length,
        c1: link1.node1_id == id ? pipe1.c1 : pipe1.c2,
        c2: link2.node1_id == id ? pipe2.c1 : pipe2.c2,
        len: sub_link.length,
        len1: pipe_len, len2: pipe_len,
        locked: !!len,
        pipes: [pipe1.id]
      }
      pipe1.pipes.push(pipe.id)
      solve.colors[pipe.c1] = c
      if (pipe1 != pipe2) {
        pipe2.pipes.push(pipe.id)
        pipe.pipes.push(pipe2.id)
        solve.colors[pipe.c2] = c
      }
      solve.pipes.push(pipe)
      sub_link.pipe_id = pipe.id
    })
  })

  // --------------------------------------------------------------------------|
  var solves = [solve]

  var sanity = SANITY
  while (isFinite(min_len = min_pipe_len(solve)) && --sanity > 0) {
    solve = copy_solve(solve)
    solve.len += min_len

    solve.pipes.forEach((pipe) => {
      if (pipe.locked) {
        return
      }

      var c1 = solve.colors[pipe.c1], c2 = solve.colors[pipe.c2]
      var f1 = c1 != DEF_COLOR && c1 != KNIFE_COLOR
      var f2 = c2 != DEF_COLOR && c2 != KNIFE_COLOR
      if (c1 != DEF_COLOR && c1 != KNIFE_COLOR) {
        pipe.len1 += min_len
      }
      if (c2 != DEF_COLOR && c2 != KNIFE_COLOR) {
        pipe.len2 += min_len
      }
    })

    solve.pipes.forEach((pipe) => {
      if (pipe.locked) {
        return
      }

      var over = pipe.len1 + pipe.len2 - pipe.len
      if (over < 0) {
        return
      }
      pipe.locked = true
      if (pipe.len1 && pipe.len2) {
        over /= 2
      }
      if (pipe.len1) {
        pipe.len1 -= over
      }
      if (pipe.len2) {
        pipe.len2 -= over
      }

      var c1 = solve.colors[pipe.c1], c2 = solve.colors[pipe.c2]
      if (c1 == DEF_COLOR || c1 == KNIFE_COLOR) {
        solve.colors[pipe.c1] = c2
      }
      else if (c2 == DEF_COLOR || c2 == KNIFE_COLOR) {
        solve.colors[pipe.c2] = c1
      }
    })

    solves.push(solve)
  }
  if (sanity <= 0) {
    log('SANITY')
  }


  return solves
}
function solve_at(game, solves, len) {
  var prev_solve = solves[0]
  solves.forEach(solve => {
    if (solve.len < len) {
      prev_solve = solve
    }
  })
  var solve = copy_solve(prev_solve)
  var dif = len - solve.len
  solve.pipes.forEach((pipe) => {
    var c1 = solve.colors[pipe.c1], c2 = solve.colors[pipe.c2]
    if (c1 != DEF_COLOR && c1 != KNIFE_COLOR) {
      pipe.len1 += dif
    }
    if (c2 != DEF_COLOR && c2 != KNIFE_COLOR) {
      pipe.len2 += dif
    }
  })
  return solve
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
      sub_links: [],
    }
    game.nodes.push(node)
    return node
  }

  // --------------------------------------------------------------------------|
  function split_node(game, node1) {
    var links = []
    FU.forEach(node1.links, (link_id, node2_id) => {
      var link = game.links[link_id]
      var node2 = game.nodes[node2_id]
      var angle = PT.atan(PT.sub(node2.position, node1.position))
      angle = (PI2 + angle) % PI2
      links.push([angle,node2,link_id])
    })
    node1.sub_links = []
    if (links.length == 0) {
      return
    }

    links.sort((a,b)=>a[0]-b[0])
    var prev = links[links.length-1]
    links.forEach(([angle,node2,link_id], idx) => {
      var sub_link = {
        id: node1.sub_links.length,
        length: DRAW_RADIUS * ((PI2 + angle - prev[0]) % PI2),
        angle1: prev[0],
        angle2: angle,
        link1_id: prev[2],
        link2_id: link_id
      }
      if (sub_link.length < MIN_LEN) {
        sub_link.length = DRAW_RADIUS * PI2
      }
      node1.sub_links.push(sub_link)
      prev = links[idx]
    })
  }

  // --------------------------------------------------------------------------|
  function new_link(game, sndr, node1, node2) {
    if (node1.links[node2.id] != undefined) {
      return
    }

    var dist = PT.dist(node1.position, node2.position)
    var link = {
      id: FU.indexOf(game.links),
      clnt_id: sndr,
      node1_id: node1.id,
      node2_id: node2.id,
      dist: dist,
      length: dist - NODE_RADIUS * 2 + SALT * Math.random(),
    }
    if (link.id < 0) {
      link.id = game.links.length
      game.links.push(link)
    }
    else {
      game.links[link.id] = link
    }
    node1.links[node2.id] = link.id
    node2.links[node1.id] = link.id
    split_node(game, node1)
    split_node(game, node2)
    return link
  }

  // --------------------------------------------------------------------------|
  function rmv_link(game, link) {
    var node1 = game.nodes[link.node1_id]
    var node2 = game.nodes[link.node2_id]
    delete game.links[link.id]
    delete node1.links[node2.id]
    delete node2.links[node1.id]
    split_node(game, node1)
    split_node(game, node2)
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
        log('inbox', msg.mws, VIEWPORT, PT.inbox(msg.mws, [0,0], VIEWPORT))
        if (!PT.inbox(msg.mws, [0,0], VIEWPORT)) {
          return
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
              rmv_link(game, link)
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
    }

    // Draw game -------------------------------------------------------------||
    var wh = [LINE_WIDTH*3, LINE_WIDTH*2+FONT_SIZE]
    if (game) {

      // --------------------------------------------------------------------|||
      var plr_stat = game.stats[CLNT_ID]
      if (game.state == 'link' && plr_stat && plr_stat.sel_node_id >= 0) {
        var sel_node = game.nodes[plr_stat.sel_node_id]
        PT.drawLine(G, sel_node.position, USR_IO_MWS, plr_stat.color)
      }

      var len = (FU.now() - game.solve_time) * GROUTH_SPEED
      var solve = solve_at(game, game.solves, len)

      // --------------------------------------------------------------------|||
      game.links.forEach((link,id) => {
        var p1 = game.nodes[link.node1_id].position
        var p4 = game.nodes[link.node2_id].position


        if (solve) {
          var pipe = solve.pipes[id]
          var unit = PT.unit(PT.sub(p4, p1))
          var c1 = solve.colors[pipe.c1], c2 = solve.colors[pipe.c2]

          var l1 = NODE_RADIUS + pipe.len1
          var l2 = NODE_RADIUS + pipe.len - pipe.len2
          var l3 = NODE_RADIUS + pipe.len + NODE_RADIUS
          var p2 = PT.vec(p1, unit, NODE_RADIUS + pipe.len1)
          var p3 = PT.vec(p4, unit, -(NODE_RADIUS + pipe.len2))

          PT.drawLine(G, p1, p2, c1)
          PT.drawLine(G, p2, p3, DEF_COLOR)
          PT.drawLine(G, p3, p4, c2)
        }
        else {
          PT.drawLine(G, p1, p4, 'white')
        }
      })

      // --------------------------------------------------------------------|||
      game.nodes.forEach((node,id) => {
        PT.fillCircle(G, node.position, NODE_RADIUS, 'white')
      })

      // -------------------------------------------------------------------||||
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
        game.solves = solve_game(game)
        game.solve_time = FU.now()
        log('Update', game)
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
