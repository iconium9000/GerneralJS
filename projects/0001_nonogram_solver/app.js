log = console.log

// return [ROWS, COLS, board, row_prompt, col_prompt]
function get_game(ROWS, COLS, rand) {
  board = []
  for (var r = 0; r < ROWS; ++r) {
    board[r] = []
    for (var c = 0; c < COLS; ++c) {
      board[r][c] = Math.random() > rand ? '_' : '#'
    }
  }

  col_prompt = []
  row_prompt = []

  for (var r = 0; r < ROWS; ++r) {
    var prompt = []
    var count = 0
    for (var c = 0; c < COLS; ++c) {
      if (board[r][c] == '#') {
        ++count
      }
      else if (count) {
        prompt.push(count)
        count = 0
      }
    }
    if (count) {
      prompt.push(count)
    }
    row_prompt.push(prompt)
  }
  for (var c = 0; c < COLS; ++c) {
    var prompt = []
    var count = 0
    for (var r = 0; r < ROWS; ++r) {
      if (board[r][c] == '#') {
        ++count
      }
      else if (count) {
        prompt.push(count)
        count = 0
      }
    }
    if (count) {
      prompt.push(count)
    }
    col_prompt.push(prompt)
  }

  var stats = []
  for (var r = 0; r < ROWS; ++r) {
    for (var p = 0; p < row_prompt[r].length; ++p) {
      var v = row_prompt[r][p]
      stats[v] = (stats[v] || 0) + 1
    }
  }

  return [ROWS, COLS, board, row_prompt, col_prompt, stats]
}
function print_board(game) {
  var ROWS = game[0]
  var COLS = game[1]
  var board = game[2]
  var row_prompt = game[3]
  var col_prompt = game[4]

  var max_row_prompt = 0
  var max_col_prompt = 0

  for (var r = 0; r < ROWS; ++r) {
    if (row_prompt[r].length > max_row_prompt)
      max_row_prompt = row_prompt[r].length
  }

  for (var c = 0; c < COLS; ++c) {
    if (col_prompt[c].length > max_col_prompt)
      max_col_prompt = col_prompt[c].length
  }

  var doc = ''
  for (var r = 0; r < max_col_prompt; ++r) {
    var s = ''

    for (var c = 0; c < max_row_prompt; ++c) {
      s += '  '
    }
    for (var c = 0; c < COLS; ++c) {
      var l = max_col_prompt - col_prompt[c].length
      s += `${col_prompt[c][r - l] || ' '} `
    }
    doc += `${s}\n`
  }
  for (var r = 0; r < ROWS; ++r) {
    var s = ''
    var l = max_row_prompt - row_prompt[r].length

    for (var c = 0; c < max_row_prompt; ++c) {
      s += `${row_prompt[r][c-l] || ' '} `
    }
    for (var c = 0; c < COLS; ++c) {
      s += `${board[r][c]} `
    }
    // s += (r + 1)
    doc += `${s}\n`
  }
  log(doc)
}
function solve_board(game) {
  var ROWS = game[0]
  var COLS = game[1]
  var board = game[2]
  var row_prompt = game[3]
  var col_prompt = game[4]

  function print_prompt(L, p) {
    var l = p.length
    // if (l == 0) return [[]]

    var sum = 0
    for (var i in p) {
      sum += p[i]
    }

    var total = L - (sum + l - 1)
    total = total > L ? L : total

    var count = l + 1

    var ops = options(total, count)
    var ans = []
    for (var o in ops) {
      var op = ops[o]

      var s = []
      for (var i = 0; i < l; ++i) {
        for (var k = 0; k < !!i + op[i]; ++k, s.push(0));
        for (var k = 0; k < p[i]; ++k, s.push(1));
      }
      for (var k = 0; k < op[p.length]; ++k, s.push(0));
      ans.push(s)
    }
    return ans
  }
  var row_combos = []
  var col_combos = []
  for (var r = 0; r < ROWS; ++r) {
    row_combos.push(print_prompt(COLS, row_prompt[r]))
  }
  for (var c = 0; c < COLS; ++c) {
    col_combos.push(print_prompt(ROWS, col_prompt[c]))
  }

  function get_mask(A,B,a_combos,b_combos) {
    var mask_0 = []
    var mask_1 = []

    for (var a = 0; a < A; ++a) {
      var sub_a_combos = a_combos[a]
      var sub_mask_0 = mask_0[a] = []
      var sub_mask_1 = mask_1[a] = []

      for (var sa = 0; sa < sub_a_combos.length; ++sa) {
        var a_combo = sub_a_combos[sa]

        for (var b = 0; b < B; ++b) {
          if (a_combo[b]) {
            sub_mask_0[b] = 1
          }
          else {
            sub_mask_1[b] = 1
          }
        }
      }
    }
    return [mask_0, mask_1]
  }
  function cut_mask(A,B,a_combos,b_combos) {
    var change = false
    var mask = get_mask(A,B,a_combos,b_combos)

    for (var b = 0; b < B; ++b) {
      var sub_b_combos = b_combos[b]
      for (var sb = 0; sb < sub_b_combos.length; ++sb) {
        var b_combo = sub_b_combos[sb]
        var fail = false
        for (var a = 0; a < A && !fail; ++a) {
          if (b_combo[a]) {
            fail = !mask[0][a][b]
          }
          else {
            fail = !mask[1][a][b]
          }
        }

        if (fail) {
          sub_b_combos.splice(sb--,1)
          change = true
        }
      }
    }

    return change
  }

  var loops = 0
  do {
    ++loops
    cut_mask(ROWS,COLS,row_combos,col_combos)
  } while (cut_mask(COLS,ROWS,col_combos,row_combos))

  var mask = get_mask(ROWS,COLS,row_combos,col_combos)
  var mask_board = []
  {
    for (var r = 0; r < ROWS; ++r) {
      var sub_mask_board = mask_board[r] = []
      for (var c = 0; c < COLS; ++c) {
        sub_mask_board[c] = mask[0][r][c] ? mask[1][r][c] ? 'x' : '#' : '_'
      }
    }
  }
  print_board([ROWS, COLS, mask_board, row_prompt, col_prompt])

  log(row_combos, col_combos)
  log('loops', loops)
}

// rows, cols
var game = get_game(10,10,0.6)
print_board(game)
solve_board(game)

for (var k = 0.3; k < 0.8; k += 0.1) {
  var total_stats = []
  for (var i = 0; i < 100; ++i) {
    game = get_game(10, 10, 0.7)
    var stats = game[5]
    for (var j = 0; j < stats.length; ++j) {
      total_stats[j] = (total_stats[j] || 0) + (stats[j] || 0)
    }
  }
  // log(total_stats)
}

// total: variable total
// count: number variables
function options(total, count) {
  if (count == 0) return [[]]
  else if (count == 1) return [[total]]
  else {
    var ans = []
    for (var i = [0]; [i][0] <= total; ++i[0]) {
      var op = options(total - i, count - 1)
      for (var j in op) {
        ans.push(i.concat(op[j]))
      }
    }
    return ans
  }
}

// options(n, 1) -> 1
  // n

// options(1, 2) -> 2
  // 1 0
  // 0 1

// options(2, 2) -> 3
  // 2 0
  // 1 1
  // 0 2

// options(3, 2) -> 4
  // 3 0
  // 2 1
  // 1 2
  // 0 3

// options(4, 2) -> 5
  // 4 0
  // 3 1
  // 2 2
  // 1 3
  // 0 4

// options(1, 3) -> 3
  // 1 0 0
  // 0 1 0
  // 0 0 1

// options(2, 3) -> 6
  // 2 0 0
  // 1 1 0
  // 1 0 1
  // 0 2 0
  // 0 1 1
  // 0 0 2

// options(3, 3) -> 8
  // 3 0 0
  // 2 1 0
  // 2 0 1
  // 1 1 1
  // 0 3 0
  // 0 2 1
  // 0 1 2
  // 0 0 3

// options(4, 3) -> 14
  // 4 0 0
  // 3 1 0
  // 3 0 1
  // 2 2 0
  // 2 1 1
  // 2 0 2
  // 1 3 0
  // 1 2 1
  // 1 1 2
  // 0 4 0
  // 0 3 1
  // 0 2 2
  // 0 1 3
  // 0 0 4
