PROJECT_NAME = '2048'
log('init game.js', PROJECT_NAME)
GAME_HIDE_CURSER = false

GAME_CLNT_INIT = () => {
  log('init game clnt')

}

// 0 1 2 3
// 4 5 6 7
// 8 9 a b
// c d e f

// r l u d

MOVE_TIME = 100
var board = []
var moving = false
var move_direction = null
var move_timer = null

var locs = []
FU.forlen(16, i => locs.push([i%4/4+1/8, Math.floor(i/4)/4+1/8]))
var subs = [ [-1,0], [1,0], [0,1], [0,-1] ]
var cntr_keys = 'daws'
var passes = []
var nexts = []
for (var i = 0; i < 4; ++i) {
  var pass = passes[i] = []
  var next = nexts[i] = []

  for (var j = 0; j < 16; ++j) {
    
  }
}

var colors = [
  0, 'white', '#ffcc66', '#ff9900', '#ff6600',
  '#ff3300', '#cccc00', '#cccc00', '#cccc00',
  '#cccc00', '#cccc00', 'black', 'black',
  'black', 'black', 'black', 'black',
]

function loc_to_idx(loc) {
  return FU.bound(loc[0], 0, 3) + FU.bound(loc[1], 0, 3)*4
}

function add_random(board) {
  var l = []
  for (var i = 0; i < 16; ++i) {
    if (!board[i]) {
      l.push(i)
    }
  }
  if (!l.length) {
    return board
  }
  var r = Math.floor(Math.random() * l.length)
  var i = l[r]
  var v = Math.random() < 0.1 ? 2 : 1
  board[i] = { v: v, p: locs[i], }
  return board
}

board = add_random(add_random([]))
board.m = 0

GAME_TICK = () => {
  var wh = USR_IO_DSPLY.wh
  var g = USR_IO_DSPLY.g

  var w = wh[0] > wh[1] ? wh[1] : wh[0]

  PT.fillText(g, moving, [w/2, 20], 'white')

  if (moving) {
    var now = FU.now()
    var next = nexts[move_direction]
    var pass = passes[move_direction]
    if (now > move_timer + MOVE_TIME) {
      FU.forEach(pass, i => {
        var j = next[i], bi = board[i], bj = board[j]
        if (bi) {
          if (!bj) {
            board[j] = bi
            bi.p = locs[j]
            board[i] = null
          }
          else if (bj.v == bi.v && bj.m != board.m) {
            ++bj.v
            board[i] = null
            bj.m = board.m
          }
        }
      })
      moving = false
      FU.forEach(pass, i => {
        var j = next[i], bi = board[i], bj = board[j]
        if (bi && (!bj || (bj.v == bi.v && bj.m != board.m))) {
          moving = true
          move_timer = now
        }
      })
      if (!moving) {
        board = add_random(board)
        ++board.m
      }
    }
    else {
      var dif = (now - move_timer) / MOVE_TIME
      var move_vec = PT.muls(subs[move_direction], -1/4 * dif)
      FU.forEach(pass, i => {
        var j = next[i], bi = board[i], bj = board[j]
        if (bi && (!bj || bj.v == bi.v)) {
          bi.p = PT.sum(locs[i], move_vec)
        }
      })
    }
  }

  // PT.fillRect(g, [0,0], [w,w], 'white')
  for (var i = 0; i < 16; ++i) {
    var b = board[i]
    if (b) {
      var p = PT.muls(b.p, w)
      var txt = `${b.v}`
      var c = b.v < 2 ? 'black' : 'white'
      PT.centerTextBox(g, txt, p, 10, 20, c, colors[b.v])
    }
  }


  if (!moving) {
    if (USR_IO_KYS.hsDn['r']) {
      board = add_random(add_random([]))
      board.m = 0
    }
    else {
      move_direction = null
      for (var i = 0; i < 4; ++i) {
        if (USR_IO_KYS.hsDn[cntr_keys[i]]) {
          move_direction = i
        }
      }
      if (move_direction != null) {
        moving = true
        move_timer = FU.now()
      }
    }
  }
}
