log = console.log

PROJECT_NAME = 'Solver Project'
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
err('START')

var opar = {
  '(': ')',
  '[': ']'
}
var cpar = {
  ')': true,
  ']': true,
}
var ops = {
  ',': 'sat',
  '=': 'equ',
  '+': 'add',
  '-': 'sub',
  '*': 'mul',
  '/': 'div',
  '^': 'pow',
  '@': 'log',
}
var opas = [
  {'sat': true},
  {'equ': true},
  {'add': true, 'sub': true},
  {'mul': true, 'div': true},
  {'pow': true, 'log': true},
  {'dot': true}
]
var opn = {
  'sat': 1,
  'equ': 2,
  'add': 3,
  'sub': 3,
  'div': 4,
  'mul': 5,
  'pow': 6,
  'log': 7,
  'dot': 8,
}
var opr = {
  'sat': 0,
  'equ': 0,
  'add': 1.125,
  'sub': 1.125,
  'div': 1.25,
  'mul': 1.375,
  'dot': 1.375,
  'pow': 1.5,
  'log': 1.625,
}
var opc = {
  'sat': ',\n',
  'equ': ' = ',
  'add': ' + ',
  'sub': ' - ',
  'mul': ' * ',
  'dot': ' ',
  'div': ' / ',
  'pow': '^',
  'log': ' @ ',
}
var bs = {
  'char': true,
  'num': true,
}
var sat = {
  'sat': 'sat',
  'equ': 'equ',
}
parsef.f = {
  'txt': f => {
    var word = null
    var nf = ['flatA']
    var f1 = f[1]
    var flag = false

    for (var i = 0; i < f1.length; ++i) {
      var c = f1[i]

      if ('0' <= c && c <= '9') {
        if (word && word[0] == 'num') {
          word[1] = word[1] * 10 + parseInt(c)
        }
        else {
          if (word) {
            if (flag) {
              nf.push(['op', 'dot'])
            }
            nf.push(word)
            flag = true
            word = null
          }
          word = ['num', parseInt(c)]
        }
      }
      else if (c == '_' || ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
        if (word && word[0] == 'char') {
          word[1] += c
        }
        else {
          if (word) {
            if (flag) {
              nf.push(['op', 'dot'])
            }
            nf.push(word)
            flag = true
            word = null
          }
          word = ['char', c]
        }
      }
      else {
        if (word) {
          if (flag) {
            nf.push(['op', 'dot'])
          }
          nf.push(word)
          flag = true
          word = null
        }
        if (opar[c]) {
          if (flag) {
            nf.push(['op', 'dot'])
          }
          nf.push(['opar', opar[c]])
          flag = false
        }
        else if (cpar[c]) {
          nf.push(['cpar', c])
          flag = true
        }
        else if (c == '$') {
          if (flag) {
            nf.push(['op', 'dot'])
          }
          nf.push(['char', '$'])
          flag = true
        }
        else if (ops[c]){
          nf.push(['op', ops[c]])
          flag = false
        }
        else if (c == ' ' || c == '\n' || c == '\t') {
          // do nothing
        }
        else throw `BAD char '${c}' at idx ${i}`
      }
    }
    if (word) {
      if (flag) {
        nf.push(['op', 'dot'])
      }
      nf.push(word)
      // flag = true
    }
    return parsef(nf)
  },
  'flatA': f => {
    var top = ['flatB']
    var cpar = null
    var stack = []
    for (var i = 1; i < f.length; ++i) {
      var fi = f[i], fi0 = fi[0], fi1 = fi[1]
      if (fi0 == 'opar') {
        stack.push(top,cpar)
        cpar = fi1
        top.push(top = ['flatB'])
      }
      else if (fi0 == 'cpar') {
        if (fi1 == cpar) {
          cpar = stack.pop()
          top = stack.pop()
        }
        else {
          throw `BAD cpar for '${fi1}' at idx ${i}`
        }
      }
      else top.push(fi)
    }
    if (stack.length) {
      throw `NO cpar`
    }
    return parsef(top)
  },
  'flatB': f => {

    for (var i = 0; i < opas.length; ++i) {
      var sopas = opas[i]

      for (var j = f.length-1; j > 0; --j) {
        var fi = parsef(f[j]), fi0 = fi[0], fi1 = fi[1]

        if (fi0 == 'op' && sopas[fi1]) {
          var sub = [fi1]
          var a1 = parsef(f.slice(0,j))
          if (a1[0] == fi1) {
            sub = sub.concat(a1.slice(1))
          }
          else {
            sub.push(a1)
          }
          var a2 = parsef(['flatB'].concat(f.slice(j+1,f.length)))
          sub.push(a2)
          return sub
        }
      }
    }

    if (f.length == 1) {
      return ['null']
    }
    else if (f.length == 2) {
      return parsef(f[1])
    }
    else {
      log(f)
      throw `bad parse???`
    }
  },
}
function parsef(f) {
  if (parsef.f[f[0]]) {
    return parsef.f[f[0]](f)
  }
  else {
    return f
  }
}
function chartf(f, table, flag, d) {
  if (!d) {
    chartf.d = 0
  }
  if (++chartf.d > 1e4) {
    throw 'overflow'
  }
  for (var i = 1; i < f.length; ++i) {
    var fi = f[i], fi0 = fi[0], fi1 = fi[1]
    if (!table[fi1] && bs[fi0]) {
      table[fi1] = fi0 == 'num' ? 'defined' : flag
    }
    else {
      chartf(fi, table, 'undefined', true)
    }
  }
}
function scoref(f) {
  var f0 = f[0]
  var o = opr[f0]
  if (o == undefined) {
    return 0
  }
  else {
    var n = (f.length-2)*o
    for (var i = 1; i < f.length; ++i) {
      n += scoref(f[i])
    }
    return n
  }
}
function printf(f) {
  var f0 = f[0], f1 = f[1]
  if (bs[f0]) {
    return f1
  }
  if (f.length == 1) {
    return ''
  }

  var c = opc[f0], n = opn[f0]
  if (c) {
    var s = ''
    var flag = false
    for (var i = 1; i < f.length-1; ++i) {
      var fi = f[i]
      var p = printf(fi)
      var pn = opn[fi[0]]
      if (pn < n) {
        // log('les', fi[0], f0)
        p = `(${p})`
      }
      else {
        // log('gtr', fi[0], f0)
      }
      s += p + c
    }
    if (f.length > 1) {
      var fi = f[f.length-1]
      var p = printf(fi)
      var pn = opn[fi[0]]
      if (pn < n) {
        p = `(${p})`
      }
      s += p
    }
    return s
  }
}

function hashf(f,h) {
  var p = printf(f)
  var f0 = f[0]
  var hp = h[p]
  if (hp) {
    return
  }
  var s = scoref(f)
  h[p] = ['scr',s,f]
  if (bs[f0]) {
    return
  }
  for (var i = 1; i < f.length; ++i) {
    hashf(f[i], h)
  }
  return p
}

simplef.s = (f,h) => {

}
function simplef(f) {
  
}


solvef.c = {
  'add': true,
  'sub': true,
  'div': true,
  'mul': true,
  'dot': true,
  'pow': true,
  'log': true,
  'char': true,
  'num': true,
}
solvef.t = {
  'sat': {
    'add': (f,m) => {},
    'sub': (f,m) => {},
    'div': (f,m) => {},
    'mul': (f,m) => {},
    'dot': (f,m) => {},
    'pow': (f,m) => {},
    'log': (f,m) => {},
  },
  'equ': {
    'add': (f,m) => {},
    'sub': (f,m) => {},
    'div': (f,m) => {},
    'mul': (f,m) => {},
    'dot': (f,m) => {},
    'pow': (f,m) => {},
    'log': (f,m) => {},
  },
  'add': {
    'add': (f,m) => {},
    'sub': (f,m) => {},
    'div': (f,m) => {},
    'mul': (f,m) => {},
    'dot': (f,m) => {},
    'pow': (f,m) => {},
    'log': (f,m) => {},
  },
  'sub': {
    'add': (f,m) => {},
    'sub': (f,m) => {},
    'div': (f,m) => {},
    'mul': (f,m) => {},
    'dot': (f,m) => {},
    'pow': (f,m) => {},
    'log': (f,m) => {},
  },
  'div': {
    'add': (f,m) => {},
    'sub': (f,m) => {},
    'div': (f,m) => {},
    'mul': (f,m) => {},
    'dot': (f,m) => {},
    'pow': (f,m) => {},
    'log': (f,m) => {},
  },
  'mul': {
    'add': (f,m) => {},
    'sub': (f,m) => {},
    'div': (f,m) => {},
    'mul': (f,m) => {},
    'dot': (f,m) => {},
    'pow': (f,m) => {},
    'log': (f,m) => {},
  },
  'dot': {
    'add': (f,m) => {},
    'sub': (f,m) => {},
    'div': (f,m) => {},
    'mul': (f,m) => {},
    'dot': (f,m) => {},
    'pow': (f,m) => {},
    'log': (f,m) => {},
  },
  'pow': {
    'add': (f,m) => {},
    'sub': (f,m) => {},
    'div': (f,m) => {},
    'mul': (f,m) => {},
    'dot': (f,m) => {},
    'pow': (f,m) => {},
    'log': (f,m) => {},
  },
  'log': {
    'add': (f,m) => {},
    'sub': (f,m) => {},
    'div': (f,m) => {},
    'mul': (f,m) => {},
    'dot': (f,m) => {},
    'pow': (f,m) => {},
    'log': (f,m) => {},
  },
}
solvef.o = ['add','sub','div','mul','pow','log']
function solvef(f,h) {
  var p = hashf(f,h)
  var hp = h[p], hps = hp[1]
  var f0 = f[0]
  if (bs[f0]) {
    return
  }

  var ha = []
  FU.forEach(h, i => ha.push(i[2]))
  for (var i = 0; i < ha.length; ++i) {
    var hf = ha[i], hf0 = hf[0]
    if (solvef.c[hf0]) {
      solvef.o.forEach(o => {
        simplef([o,f,hf])
      })
    }
  }

  return 'err'
}


var rocket_science = `
  1 - 2 - 4 + 3 - 4,
  e, TWRe, TWRw, av, tank, g, isp, deltaV, throttle,
  dry = av + prop/tank + thrust/(TWRe g),
  TWRw = thrust / (wet g),
  TWRd = thrust throttle / (dry g),
  wet = prop + dry,
  deltaV = isp g * e @ (wet / dry),
`
var test = `
  a = b / c
`

// var f = parsef(['txt',rocket_science])
var f = parsef(['txt',test])

var chart = {}
var htable = {}
var score = scoref(f)
var print = printf(f)
// var hash = hashf(f, htable)
err('+ solvef')
var solve = solvef(f, htable)
err('- solvef')

chartf(f, chart, 'defined')
log('f', f)
log('table', chart)
log('score', score)
log('print', print)
log('htable', htable)
log('solve', solve)

err('END')
// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {

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
