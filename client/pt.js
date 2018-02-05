// import FU

log = console.log
srfy = JSON.stringify
log('init pt.js')

pt = PT = {}

// c = mat a b
PT.sum = (a,b,l) => {
  var p = []
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => p[i] = (a[i] || 0) + (b[i] || 0))
  return p
  }
PT.sub = (a,b,l) => {
  var p = []
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => p[i] = (a[i] || 0) - (b[i] || 0))
  return p
}
PT.mul = (a,b,l) => {
  var p = []
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => p[i] = (a[i] || 0) * (b[i] || 0))
  return p
}
PT.div = (a,b,l) => {
  var p = []
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => p[i] = (a[i] || 0) / (b[i] || 0))
  return p
}
PT.mat = (a,b,f,l) => {
  var p = []
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => p[i] = f(a[i] || 0, b[i] || 0, i))
  return p
}

// a = mat a b i
PT.sume = (a,b,l) => {
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => a[i] = (a[i] || 0) + (b[i] || 0))
  return a
}
PT.sube = (a,b,l) => {
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => a[i] = (a[i] || 0) - (b[i] || 0))
  return a
}
PT.mule = (a,b,l) => {
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => a[i] = (a[i] || 0) * (b[i] || 0))
  return a
}
PT.dive = (a,b,l) => {
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => a[i] = (a[i] || 0) / (b[i] || 0))
  return a
}
PT.mate = (a,b,f,l) => {
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => a[i] = f(a[i] || 0, b[i] || 0, i))
  return a
}

// c = mat a s i
PT.sums = (a,s,l) => {
  var p = []
  FU.forlen(l || a.length, i => p[i] = (a[i] || 0) + s)
  return p
}
PT.subs = (a,s,l) => {
  var p = []
  FU.forlen(l || a.length, i => p[i] = (a[i] || 0) - s)
  return p
}
PT.muls = (a,s,l) => {
  var p = []
  FU.forlen(l || a.length, i => p[i] = (a[i] || 0) * s)
  return p
}
PT.divs = (a,s,l) => {
  var p = []
  FU.forlen(l || a.length, i => p[i] = (a[i] || 0) / s)
  return p
}
PT.mats = (a,s,f,l) => {
  var p = []
  FU.forlen(l || a.length, i => p[i] = f(a[i] || 0, s, i))
  return p
}

// a = mat a s
PT.sumse = (a,s,l) => {
  FU.forlen(l || a.length, i => a[i] = (a[i] || 0) + s)
  return a
}
PT.subse = (a,s,l) => {
  FU.forlen(l || a.length, i => a[i] = (a[i] || 0) - s)
  log(a,s)
  return a
}
PT.mulse = (a,s,l) => {
  FU.forlen(l || a.length, i => a[i] = (a[i] || 0) * s)
  return a
}
PT.divse = (a,s,l) => {
  FU.forlen(l || a.length, i => a[i] = (a[i] || 0) / s)
  return a
}
PT.matse = (a,s,f,l) => {
  FU.forlen(l || a.length, i => a[i] = f(a[i] || 0, s, i))
  return a
}

// s = (for i a (s = mat s i))
PT.suma = (a,s,l) => {
  s = s || 0
  FU.forlen(l || a.length, i => s += a[i] || 0)
  return s
}
PT.suba = (a,s,l) => {
  s = s || 0
  FU.forlen(l || a.length, i => s -= a[i] || 0)
  return s
}
PT.mula = (a,s,l) => {
  s = s || 0
  FU.forlen(l || a.length, i => s *= a[i] || 0)
  return s
}
PT.diva = (a,s,l) => {
  s = s || 0
  FU.forlen(l || a.length, i => s /= a[i] || 0)
  return s
}
PT.mata = (a,s,f,l) => {
  FU.forlen(l || a.length, i => s = f(a[i],s,i))
  return s
}


PT.matl = (l,f) => {
  var a = []
  FU.forlen(l, i => a[i] = f(i,l))
  return a
}
PT.matls = (l,s,f) => {
  var a = []
  FU.forlen(l, i => a[i] = f(i,s,l))
  return a
}
PT.matlse = (l,s,f) => {
  FU.forlen(l, i => s = f(i,s,l))
  return s
}

// removes trailing zeros
PT.short = p => {
  var l = -1
  FU.forlen(p.length, i => p[i] && (l = i))
  p.splice(l+1,p.length-l)
  return p
}
// returns a copy of p
PT.copy = (p,l) => {
  l = l || p.length
  var n = []
  FU.forlen(l, i => n[i] = (p[i] || 0))
  return n
}
// sets a to b
PT.apply = (a, b) => {
  a.splice(0,a.length)
  FU.forlen(b.length, i => a[i] = b[i])
  return a
}
// sets the valus of a to b
PT.set = (a, b, l) => {
  l = l || b.length
  a.splice(0,a.length)
  FU.forlen(l, i => a[i] = (b[i] || 0))
  return a
}
// returns 0 vector
PT.zero = () => []
// returns true if a & b are equal
PT.equal = (a,b) => {
  return !FU.trueif((a.length > b.length ? a : b).length,
    i => a[i] != b[i] && !a[i] != !b[i])
}
// returns random vector of length l
PT.rand = l => {
  var p = []
  FU.forlen(l, i => p[i] = Math.random())
  return p
}

PT.length = p => Math.sqrt(PT.suma(PT.mul(p,p)))

PT.unit = p => PT.divs(p,PT.length(p))

PT.dot = (a,b) => PT.suma(PT.mul(a,b))
PT.cat = function() {
  var a = []
  FU.forEach(arguments, i => a = a.concat(i))
  return a
}

PT.find = (p,f,l) => {
  l = l || p.length
  for (var i = 0; i < l; ++i) if (f(p[i] || 0, i, p, l)) return i
  return l
}
PT.sliceif = (p,f) => {
  for (var i = 0; i < p.length; ++i)
    if (f(p[i] || 0, i, p))
      p = p.slice(i--,1)
  return p
}
PT.spliceif = (p,f) => {
  for (var i = 0; i < p.length; ++i)
    if (f(p[i] || 0, i, p))
      p.splice(i--,1)
  return p
}
PT.color = p => PT.suma(PT.mats(p, 1, c => {
  c = c > 1 ? 1 : c < 0 ? 0 : c
  c = Math.floor(c * 255).toString(16)
  c = ('0' + c).slice(-2)
  return c
}, 4), '#')

PT_UNIQUE_KEYS = {}
PT.unique_key = l => PT.matlse(l,'',(n,s)=>s+FU.rand_char())

PT.drawLine = (g,a,b) => {
  g.beginPath()
  g.moveTo(a[0] || 0, a[1] || 0)
  g.lineTo(b[0] || 0, b[1] || 0)
  g.stroke()
}
PT.drawCircle = (g, p, r) => {
  if (!r) return
  g.beginPath()
  g.arc(p[0] || 0, p[1] || 0, r, 0, 2 * Math.PI)
  g.stroke()
}
PT.fillCircle = (g, p, r) => {
  if (!r) return
  g.beginPath()
  g.arc(p[0] || 0, p[1] || 0, r, 0, 2 * Math.PI)
  g.fill()
}
PT.drawSquare = (g, p, r) => {
  g.beginPath()
  g.rect((p[0] || 0) - r, (p[1] || 0) - r, 2*r, 2*r)
  g.stroke()
}
PT.fillSquare = (g, p, r) => {
  g.beginPath()
  g.rect((p[0] || 0) - r, (p[1] || 0) - r, 2*r, 2*r)
  g.fill()
}
PT.drawRect = (g, a, b) => {
  g.beginPath()
  g.rect(a[0] || 0, a[1] || 0, b[0] || 0, b[1] || 0)
  g.draw()
}
PT.fillRect = (g, a, b) => {
  g.beginPath()
  g.rect(a[0] || 0, a[1] || 0, b[0] || 0, b[1] || 0)
  g.fill()
}


PT.fun = txt => {
  var lines = PT.fun.parse(txt)
  var symbol_table = {}
  PT.fun.get_symbol_table(lines,symbol_table)
  log(lines)
  log(symbol_table)

  PT.fun.set_functions(lines)
}
PT.fun.natives = {
  '*': a => {

  },
  '+': a => {

  },
  '-': a => {

  },
  '/': a => {

  },
  '=': a => {

  },
  '>': a => {

  },
  '<': a => {

  },
  '>=': a => {

  },
  '<=': a => {

  },
  '==': a => {

  },
  'mat': a => {

  },
  'bool': a => {

  },
  'def': a => {

  },
  'fun': a => {

  },
  'vec': a => {

  },
  'scal': a => {

  },
  'if': a => {

  },
  'len': a => {

  },
  'dot': a => {

  },
  'sqrt': a => {

  },
  'pow': a => {

  },
  'root': a => {

  },
  'let': a => {

  },
  'return': a => {

  },
  'cat': a => {

  },
  'size': a => {

  },
}

PT.fun.parse = txt => {
  var lines = []

  var new_line = txt.split('\n')

  var prev = 0
  var line_stack = []

  var place = 0

  var stack = []
  var words = []

  var comment
  var word = ''

  var char_to_word = c => word += c
  var word_to_words = () => {
    var temp = word.split('//')
    if (comment = comment || temp.length > 1) word = temp[0]
    word && words.push(word)
    word = ''
  }
  var parse_words = words => {
    var commas = PT.mata(words,0,(w,s) => s + (w == ','))
    if (commas) {
      var temp_words = []
      var temp_line = ['vec']
      if (words[0] == 'vec') words.splice(0,1)

      FU.forEach(words, w => {
        if (w == ',') {
          temp_words = parse_words(temp_words)
          temp_words.length && temp_line.push(temp_words)
          temp_words = []
        }
        else temp_words.push(w)
      })
      temp_words.length && temp_line.push(temp_words)
      return temp_line
    } else {
      var temp_words = []
      FU.forEach(words, w => {
        var n = parseFloat(w)
        temp_words.push(isNaN(n) ? w : n)
      })
      return temp_words
    }
  }
  var words_to_stack = () => {
    stack.push(parse_words(words))
    words = []
  }
  var stack_to_words = () => {
    words = parse_words(words)
    var temp = stack.pop()
    if (temp) {
      temp.push(words)
      words = temp
    }
  }
  var lines_to_line_stack = () => {
    line_stack.push(lines)
    lines = []
  }
  var line_stack_to_lines = () => {
    var temp_lines = line_stack.pop()
    var temp_words = temp_lines.pop()
    if (lines.length > 1) lines = PT.cat('vec', lines)
    if (temp_words) {
      temp_words.push(lines.length == 1 ? lines[0] : lines)
      // temp_words.push(lines)
      temp_lines.push(temp_words)
    }
    else {
      // temp_words.push(lines)
      temp_lines.push(lines.length == 1 ? lines[0] : lines)
    }
    lines = temp_lines
  }
  var words_to_lines = () => lines.push(words)

  FU.forEach(new_line, line => {
    line = line.split(' ')
    var count = PT.find(line, l => l.length)/2
    line = PT.spliceif(line, l => !l.length)

    comment = false

    stack = []
    words = []
    FU.forEach(line, l => {
      word = ''
      FU.forEach(l, c => {
        if (comment) return
        else if (c == '(') {
          word_to_words()
          words_to_stack()
        }
        else if (c == '[' || c == '{') {
          word_to_words()
          words_to_stack()
          char_to_word('vec')
          word_to_words()
        }
        else if (c == ')' || c == ']' || c == '}') {
          word_to_words()
          stack_to_words()
        }
        else if (c == ',') {
          word_to_words()
          char_to_word(c)
          word_to_words()
        }
        else char_to_word(c)
      })
      word_to_words()
    })

    while (stack.length) words = stack.pop()

    if (words.length) {
      var dif = count-prev

      // if (dif > 0) FU.forlen(dif, lines_to_line_stack)
      if (dif > 0) FU.forlen(1, lines_to_line_stack)
      else if (dif) FU.forlen(-dif, line_stack_to_lines)
      words_to_lines()

      prev = count
    }
  })
  while (line_stack.length) line_stack_to_lines()
  return PT.cat('vec',lines)
}
PT.fun.get_symbol_table = (lines,symbol_table) =>
  FU.forlen(lines.length, i => {
    var l = lines[i]
    if (typeof l == 'string' || typeof l == 'number') {
      symbol_table[l] = lines[i] = symbol_table[l] ||
        { lex:true, n:l, u:[], f:PT.fun.natives[l] }
      symbol_table[l].u.push([lines,i])
    }
    else {
      PT.fun.get_symbol_table(l,symbol_table)
      l.scope = lines
    }
  })
PT.fun.set_functions = lines => {


}

main1 = (a1,a2,a3) => {
  var p1 = resolve(a1)
  var p2 = resolve(a2)
  var p3 = resolve(a3)

  var u = []

  u1 = f1(p2, p1)
  u2 = f2(u1)
  u1 = f3(u1, u2)

  return express(u1)
}
main2 = a1 => {
  var p1 = resolve(a1)

  if (f1(p1)) {
    return true
  }
  else {
    return false
  }
}
main3 = (a1,a2) => {
  var p1 = resolve(a1)
  var p2 = resolve(a2)

  var t1

  if (f1(p1)) {
    return express(p2)
  }
  else {
    p2 = false
  }
  p1 = f2(a)
  return express(p1)
}
main4 = () => {
  var u1

  u1 = [1,2,3,4]
  u1 = [4,2,3,4]
}
main5 = (a1,a2,a3,a4) => {
  var p1 = resolve(a1)
  var p2 = resolve(a2)
  var p3 = resolve(a3)
  var p4 = resolve(a4)

  var u1

  u1 = f1(p1, p2)
  return f2(u1, p4, p3)
}
main6 = (a1,a2,a3,a4) => {
  var p1 = resolve(a1)
  var p2 = resolve(a2)
  var p3 = resolve(a3)
  var p4 = resolve(a4)

  if (f1(p4)) {
    return f2(p1,p3)
  }
  else {
    return f2(p2,p3)
  }
}

PT_FUN_TXT =

// `1
//   111 112 113
//   121 122 123
//     1241 1242
//   131 132 133
//     1341 1342
// 2
//   211 212 213
//   221 222 223
// `
`
def main [a b c f]
  let u (- b a)
  let l (len u)
  = u (/ u l)
  return u
def main a
  if (> (len a) 1)
    return true
    return false
def main [a b]
  if (> (len a) 1)
    return b
    = b false
  = a (* a 4)
  return a
def main []
  = a [1 2 3 4]
  = a [+ 1 3, 2, 3, 4]

// PT.divs(PT.sum(wh, PT.muls(PT.cat(p,r), scale, 3)), 2)
def main [p r wh scale]
  let t (cat (size p 2) (scal r))
  return (/ (+ (* t scale) wh) 2)
def main [ma mb v f]
  if f
    return (ma v)
    return (mb v)
`
