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

/**
  @language

  S := P | S = P
  P := D ( P ) P | P ( P ) | ( P ) P
  D := A | D / A
  A := M | A + M | A - M
  M :=
*/

var funs = {
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
    return parser(nf)
  },
  'flatA': f => {
    var top = ['flatB']
    var cpar = null
    var stack = []
    for (var i = 1; i < f.length; ++i) {
      var sf = f[i], sf0 = sf[0], sf1 = sf[1]
      if (sf0 == 'opar') {
        stack.push(top,cpar)
        cpar = sf1
        top.push(top = ['flatB'])
      }
      else if (sf0 == 'cpar') {
        if (sf1 == cpar) {
          cpar = stack.pop()
          top = stack.pop()
        }
        else {
          throw `BAD cpar for '${sf1}' at idx ${i}`
        }
      }
      else top.push(sf)
    }
    if (stack.length) {
      throw `NO cpar`
    }
    return parser(top)
  },
  'flatB': f => {

    for (var i = 0; i < opas.length; ++i) {
      var sopas = opas[i]

      for (var j = f.length-1; j > 0; --j) {
        var sf = parser(f[j]), sf0 = sf[0], sf1 = sf[1]

        if (sf0 == 'op' && sopas[sf1]) {
          var sub = [sf1]
          var a1 = parser(f.slice(0,j))
          if (a1[0] == sf1) {
            sub = sub.concat(a1.slice(1))
          }
          else {
            sub.push(a1)
          }
          var a2 = parser(['flatB'].concat(f.slice(j+1,f.length)))
          sub.push(a2)
          return sub
        }
      }
    }

    if (f.length == 1) {
      return ['null']
    }
    else if (f.length == 2) {
      return parser(f[1])
    }
    else {
      log(f)
      throw `bad parse???`
    }
  },
}
function parser(f) {
  if (funs[f[0]]) return funs[f[0]](f)
  else return f
}
log(parser(['txt',`
  e, TWRe, TWRw, av, tank, g, isp, throttle,
  dry = av + prop/tank + thrust/(TWRe g),
  TWRw = thrust / (wet g),
  TWRd = thrust throttle / (dry g),
  wet = prop + dry,
  deltaV = isp g * e @ (wet / dry),
`]))



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
