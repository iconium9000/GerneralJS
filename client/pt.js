// import FU

// π = Math.PI
log = console.log
srfy = JSON.stringify
log('init pt.js')

pt = PT = {}

PT.vec = (a,b,s,l) => {
  var p = []
  s = s || 0
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => p[i] = (a[i] || 0) + s * (b[i] || 0))
  return p
}

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

PT.length = (p,l) => Math.sqrt(PT.suma(PT.mul(p,p,l)))
PT.dist = (a,b) => PT.length(PT.sub(a,b))
PT.invert = p => [-p[1] || 0, p[0] || 0]
PT.tan2 = p => Math.atan2(p[1] || 0, p[0] || 0)

PT.cross = (a,b) => {
  var u2v3 = (a[1] * b[2]) || 0
  var u3v2 = (a[2] * b[1]) || 0
  var u3v1 = (a[2] * b[0]) || 0
  var u1v3 = (a[0] * b[2]) || 0
  var u1v2 = (a[0] * b[1]) || 0
  var u2v1 = (a[1] * b[0]) || 0
  return [u2v3-u3v2,u3v1-u1v3,u1v2-u2v1]
}
PT.cross2 = (a,b) => {
  var a0 = a[0] || 0
  var a1 = a[1] || 0
  var b0 = b[0] || 0
  var b1 = b[1] || 0
  return a1 * b0 - a0 * b1
}
PT.unit = (p,l) => PT.divs(p,PT.length(p,l))

PT.lineCross = (a0,a1,b0,b1) => {
  var a0_b0 = PT.sub(a0,b0)
  var b1_b0 = PT.sub(b1,b0)
  var a1_b0 = PT.sub(a1,b0)
  var a1_a0 = PT.sub(a1,a0)
  var b1_a0 = PT.sub(b1,a0)
  var ab = PT.cross2(a0_b0,b1_b0) * PT.cross2(a1_b0,b1_b0)
  var ba = PT.cross2(a1_a0,a0_b0) * PT.cross2(b1_a0,a1_a0)
  return ab < 0 && ba < 0
}
PT.lineDist = (p,a,b) => {
  var ba = PT.sub(b,a)
  var ba_len = PT.length(ba)
  var ba_sqr = ba_len * ba_len

  var pa = PT.sub(p,a)
  var pa_len = PT.length(pa)
  if (ba_len == 0) return pa_len

  var pb_len = PT.dist(p,b)

  var dot = PT.dot(ba,pa)
  if (dot < 0) return pa_len
  if (dot > ba_sqr) return pb_len

  var cross_pb = PT.cross(pa,ba)
  if (cross_pb == 0)
    return pa_len < pb_len ? pa_len : pb_len

  return Math.abs(PT.dot(pa, PT.unit(PT.cross(ba,cross_pb))))
}

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
PT.circle = a => [Math.cos(a),Math.sin(a)]
PT.color = p => PT.suma(PT.mats(p, 1, c => {
  c = c > 1 ? 1 : c < 0 ? 0 : c
  c = Math.floor(c * 255).toString(16)
  c = ('0' + c).slice(-2)
  return c
}, 4), '#')

PT_UNIQUE_KEYS = {}
PT.unique_key = l => PT.matlse(l,'',(n,s)=>s+FU.rand_char())

PT.drawLine = (g,a,b,c) => {
  if (c) g.strokeStyle = c

  g.beginPath()
  g.moveTo(a[0] || 0, a[1] || 0)
  g.lineTo(b[0] || 0, b[1] || 0)
  g.stroke()
}
PT.drawCircle = (g, p, r, c) => {
  if (!r) return
  if (c) g.strokeStyle = c

  g.beginPath()
  g.arc(p[0] || 0, p[1] || 0, r, 0, 2 * Math.PI)
  g.stroke()
}
PT.fillCircle = (g, p, r, c) => {
  if (!r) return
  if (c) g.fillStyle = c

  g.beginPath()
  g.arc(p[0] || 0, p[1] || 0, r, 0, 2 * Math.PI)
  g.fill()
}
PT.drawSquare = (g, p, r, c) => {
  if (c) g.strokeStyle = c

  g.beginPath()
  g.rect((p[0] || 0) - r, (p[1] || 0) - r, 2*r, 2*r)
  g.stroke()
}
PT.fillSquare = (g, p, r, c) => {
  if (c) g.fillStyle = c

  g.beginPath()
  g.rect((p[0] || 0) - r, (p[1] || 0) - r, 2*r, 2*r)
  g.fill()
}
PT.drawRect = (g, a, b, c) => {
  if (c) g.strokeStyle = c

  g.beginPath()
  g.rect(a[0] || 0, a[1] || 0, b[0] || 0, b[1] || 0)
  g.draw()
}
PT.fillRect = (g, a, b, c) => {
  if (c) g.fillStyle = c

  g.beginPath()
  g.rect(a[0] || 0, a[1] || 0, b[0] || 0, b[1] || 0)
  g.fill()
}


/*
vector method compiler
s: sting of argument types
  'v': vector
  's': scaler
  examples:
    'vvvs'
    'vvss'
    'vs'
    'v'
f: function that rcvs
returns: a function that rcvs the arguments of type specified by s
  note: the argument list is terminated by an required length argument
    that defines the length of the returned value
  examples:
    vcc('vssv', f) -> (v1,s1,s2,v2,l) => {}
*/
PT.vcc = (s,f,l) => {
  if (!f) return ()=>[]
  else if (!s) {
    if (l == 1) return () => [f.apply(0,[])]
    else if (l > 1) return () => {
      var ans = []
      for (var i = 0; i < l; ++i)
        ans[i] = f.apply(i,[])
      return ans
    }
    else return len => {
      var ans = []
      for (var i = 0; i < len; ++i)
        ans[i] = f.apply(i,[])
      return ans
    }
  }
  else if (s.length == 1) {
    if (s == 'v') {
      if (l == 1) return v => [f.apply(0,v)]
      else if (l > 1) return v => {
        var ans = []
        for (var i = 0; i < l; ++i)
          ans[i] = f.apply(i,[v[i] || 0])
        return ans
      }
      else return (v,len) => {
        var ans = []
        for (var i = 0; i < len; ++i)
          ans[i] = f.apply(i,[v[i] || 0])
        return ans
      }
    }
    else if (l == 1) return s => [f.apply(l,[s || 0])]
    else if (l > 1) return s => {
      var ans = []
      s = s || 0
      for (var i = 0; i < l; ++i)
        ans[i] = f.apply(i,[s])
      return ans
    }
    else return (s,len) => {
      var ans = []
      s = s || 0
      for (var i = 0; i < len; ++i)
        ans[i] = f.apply(i,[s])
      return ans
    }
  }
  else if (l == 1) return function() {
    var arg = []
    for (var j = 0; j < s.length; ++j)
      arg[j] = arguments[j] ?
        s[j] == 'v' ?
          arguments[j][0] || 0 :
          arguments[j] : 0
    return [f.apply(0,arg)]
  }
  else if (l > 1) return function() {
    var ans = [], arg = []
    for (var i = 0; i < l; ++i) {
      for (var j = 0; j < s.length; ++j)
        arg[j] = arguments[j] ?
          s[j] == 'v' ?
            arguments[j][i] || 0 :
            arguments[j] : 0
      ans[i] = f.apply(i,arg)
    }
    return ans
  }
  else return function() {
    var len = arguments[s.length]
    var ans = [], arg = []
    for (var i = 0; i < len; ++i) {
      for (var j = 0; j < s.length; ++j)
        arg[j] = arguments[j] ?
          s[j] == 'v' ?
            arguments[j][i] || 0 :
            arguments[j] : 0
      ans[i] = f.apply(i,arg)
    }
    return ans
  }
}

/*

types: vec1, vec2, vec3, vec\X, mat3_3, mat4_4, mat\X_\Y, str, bol


*/

PT.fcc = function() {
  var del_tok = {
    ' ': true,
    '\t': true
  }
  var tokens = {
    ' ': true,
    '(': true,
    ')': true,
    '+': true,
    '-': true,
    '*': true,
    '%': true,
    '!': true,
    '^': true,
    '{': true,
    '}': true,
    ';': true,
    '?': true,
    ':': true,
    '[': true,
    ']': true,
    '++': true,
    '--': true,
    '//': true,
    '/*': true,
    '*/': true,
    '\n': true,
    '\t': true,
    '$': true,
    '#': true,
    '&': true,
    '#': true,
    '=': true,
    '==': true,
    '!=': true,
    '<': true,
    '>': true,
    '>=': true,
    '<=': true,
    '~': true,
    ',': true,
    '&&': true,
    '||': true,
    '|': true,
    '.':true,
  }
  var is_scp = {
    'scp':true,
    'tup':true,
    'vec':true,
    'abs':true,
    'stat':true,
  }
  var is_val = {
    'fun': true,
    'num': true,
    'wrd': true,
    'scp': true,
    'vec': true,
    'tup': true,
    'abs': true
  }
  var is_dlm = {
    '\n': true,
    ',': true,
    ';': true,
  }
  var is_nat = {
    'num':true,
    'tok':true,
    'wrd':true
  }

  function parseString(string) {
    var word = ''
    var ans = ['scp']

    var line = 0
    var char = 0

    var push = () => {
      var line_char = `${line}:${char}`
      if (word.length == 0) return
      else if (del_tok[word]) return
      else if (tokens[word]) ans.push(['tok',word,line_char])
      else if (isNaN(parseFloat(word))) ans.push(['wrd',word,line_char])
      else ans.push(['num',parseFloat(word),line_char])
      if (word == '\n') {
        ++line
        char = 0
      }
      word = ''
    }

    for (var c in string) {
      c = string[c]
      if (tokens[word+c]) {
        word += c
      }
      else if (tokens[word] || tokens[c]) {
        push()
        word = c
      }
      else word += c

      ++char
    }

    push()
    return ans
  }

  function matchTok(p,t) {
    return (typeof p) == 'object' && p[0] == 'tok' && p[1] == t
  }
  function replace(parse, i, s, e, r, reqe, lar) {
    lar = lar?1:0
    i = parseInt(i)

    var p = parse[i]
    if (typeof p != 'object') return
    if (p[0] != 'tok'){
      for (var j in p) replace(p,j,s,e,r,reqe,lar)
      return
    }
    if (p[1] != s) return

    for (var j = i+1; j < parse.length; ++j) {
      if (s != e && !lar) replace(parse,j,s,e,r,reqe)
      if (matchTok(parse[j],e)) {
        if (r) {
          var rep = [r].concat(parse.slice(i+1,j))
          parse.splice(i,j-i+1-lar,rep)
        }
        else parse.splice(i,j-i+1-lar)
        return
      }
    }

    if (reqe) throw `expected '${e}' after ${p[2]}`
  }
  function parseStat(parse) {
    if (typeof parse != 'object' || is_nat[parse[0]]) return

    var prev = 0
    for (var i = 1; i < parse.length; ++i) {
      var p = parse[i]
      parseStat(p)
      if (typeof p != 'object' || p[0] != 'tok' || !is_dlm[p[1]]) continue

      var rep = ['stat'].concat(parse.slice(prev+1,i))
      if (rep.length>1){
        parse.splice(prev+1,i-prev,rep)
        i = ++prev
      }
      else {
        parse.splice(prev+1,i-prev)
        i = prev
      }
    }

    var i = parse.length
    var rep = ['stat'].concat(parse.slice(prev+1,i))
    if (rep.length>1) {
      parse.splice(prev+1,i-prev,rep)
    }
    else {
      parse.splice(prev+1,i-prev)
    }
  }
  function parseComp(parse,i) {
    i = parseInt(i)

    var p = parse[i]
    if (typeof p != 'object' || p[0] == 'tok') return
    for (var j in p) parseComp(p,j)
    if (p[0] == 'stat') return

    parseComp(parse,i+1)
    var b = parse[i+1]
    if (typeof b != 'object' || b[0] == 'tok' || b[0] == 'stat') return
    parse.splice(i,2,['comp'].concat(parse.slice(i,i+2)))
  }
  function parsePrefx(parse,i,toks,chk) {
    if (i > parse.length-1) return
    parsePrefx(parse,i+1,toks,chk)
    var p = parse[i]
    if (typeof p != 'object') return

    if (!is_nat[p[0]]) parsePrefx(p,1,toks,chk)
    var tok = toks[p[1]]
    if (p[0] != 'tok' || !tok) return

    var n = parse[i+1]
    var m = parse[i-1]
    if (!n || n[0] == 'tok' || (chk&&typeof m == 'object'&&m[0]!='tok')) return

    parse.splice(i,2,[tok,n])
  }
  function parsePstfx(parse,i,toks) {
    if (i > parse.length-1) return

    try {
      var p = parse[i]
      if (typeof p != 'object') return

      if (!is_nat[p[0]]) parsePstfx(p,1,toks)
      var tok = toks[p[1]]
      if (p[0] != 'tok' || !tok) return

      var n = parse[i-1]
      if (!n || typeof n != 'object' || n[0] == 'tok') return

      parse.splice(--i,2,[tok,n])
    }
    finally {
      parsePstfx(parse,i+1,toks)
    }
  }
  function parseMidfx_lfrt(parse,i,toks) {
    if (i > parse.length-1) return
    parseMidfx_lfrt(parse,i+1,toks)
    var p = parse[i]
    if (typeof p != 'object') return

    if (!is_nat[p[0]]) parseMidfx_lfrt(p,1,toks)
    var tok = toks[p[1]]
    if (p[0] != 'tok' || !tok) return

    var a = parse[i-1]
    if (!a || typeof a != 'object' || a[0] == 'tok') return
    var b = parse[i+1]
    if (!b || typeof b != 'object' || b[0] == 'tok') return

    parse.splice(--i,3,[tok,a,b])
  }
  function parseMidfx_rtlf(parse,i,toks) {
    if (i > parse.length-1) return

    try {
      var p = parse[i]
      if (typeof p != 'object') return

      if (!is_nat[p[0]]) parseMidfx_rtlf(p,1,toks)
      var tok = toks[p[1]]
      if (p[0] != 'tok' || !tok) return

      var a = parse[i-1]
      if (!a || typeof a != 'object' || a[0] == 'tok') return
      var b = parse[i+1]
      if (!b || typeof b != 'object' || b[0] == 'tok') return

      parse.splice(--i,3,[tok,a,b])
    }
    finally {
      parseMidfx_rtlf(parse,i+1,toks)
    }
  }
  function parseConOp(parse,i) {
    if (i > parse.length-1) return
    parseConOp(parse,i+1)
    var p = parse[i]
    if (typeof p != 'object') return

    if (!is_nat[p[0]]) parseConOp(p,1)
    if (p[0] != 'tok' || p[1] != '?') return

    var a = parse[i-1]
    if (!a || typeof a != 'object' || a[0] == 'tok') return
    var b = parse[i+1]
    if (!b || typeof b != 'object' || b[0] == 'tok') return
    var c = parse[i+2]
    if (!c || typeof c != 'object' || c[0] != 'tok' || c[1] != ':') return
    var d = parse[i+3]
    if (!d || typeof d != 'object' || d[0] == 'tok') return

    parse.splice(--i,5,['conop',a,b,d])
  }

  function listParse(parse,list) {
    if (typeof parse != 'object') return

    if (is_nat[parse[0]]) {
      list.push(['g',parse[0],parse[1],parse[2]])
      return
    }

    list.push(['s',parse[0]])
    for (var i = 1; i < parse.length; ++i) listParse(parse[i],list)
    list.push(['e',parse[0]])

    return list
  }
  function tokCheck(list) {
    for (var i in list) {
      var l = list[i]
      if (l[0] == 'g' && l[1] == 'tok') throw `unexpected '${l[2]}' at ${l[3]}`
    }
  }

  function newtype(a,b,c,d) {
    switch (a) {
    case 'null':
      if (b == 'val') {

      }
      else {

      }
      return
    case 'num':

      return
    case 'nat':
      switch(b) {
      case 'return':return
      case 'abs':return
      case 'dot':return
      case 'cross':return
      case 'bol':return
      case 'true':return
      case 'false':return
      case 'vec':
        log('newtype','vec',c,d)
        return
      }

    break
    }

    throw `invalid type ${a} ${b} ${c} ${d}`
  }
  function istyp(t) {

  }
  function isdef(t) {

  }
  function islam(t) {
    
  }

  var nulltype = newtype('null')
  var nattypes = {
    abs: newtype('nat','abs'),
    dot: newtype('nat','dot'),
    cross: newtype('nat','cross'),
    return: newtype('nat','return'),
    bol: newtype('nat','bol'),
    true: newtype('nat','true'),
    false: newtype('nat','false'),
    vec1: newtype('nat','vec','num',[1]),
    vec2: newtype('nat','vec','num',[2]),
    vec3: newtype('nat','vec','num',[3]),
  }
  function nattype(tok) {
    if (nattypes[tok]) return nattypes[tok]
    var pre = tok.slice(0,3)
    var pst = tok.slice(3)
    if (pre == 'vec') {
      var pst = parseInt(pst)
      if (isNaN(pst) || pst <= 0) throw `${tok} is invalid type`
      return newtype('nat','vec','num',[pst])
    }
    else if (pre == 'mat') {
      pst = pst.split('_')
      for (var i in pst) {
        var tmp = parseInt(pst[i])
        if (isNaN(tmp) || tmp <= 0) throw `${tok} is invalid type`
        pst[i] = tmp
      }
      return newtype('nat','vec','num',pst)
    }
  }

  function lamtype(a,b,state) {
    log('lamtype',a,b)
    return ['lamtype',a,b]
  }
  // vec, tup, stat, abs
  function arytype(args,tok) {
    log('arytype',args,tok)
    return ['arytype',args,tok]
  }

  function idxtype(a,b) {
    log('idxtype',a,b)
    return ['idxtype',a,b]
  }
  function conoptype(a,b,c) {
    log('conoptype',a,b,c)
    return ['conoptype',a,b,c]
  }
  function assigntype(a,b) {
    log('assigntype',a,b)
    return ['assigntype',a,b]
  }
  // not, xor
  function booltype(a,tok) {
    log('booltype',a,tok)
    return ['booltype',a,tok]
  }
  // pdec, pinc, dec, inc, neg, pos
  function singtype(a,tok) {
    log('singtype',a,tok)
    return ['singtype',a,tok]
  }
  // equ, neq, gtr, les, leq, geq
  function cmprtype(a,b,tok) {
    log('cmprtype',a,b,tok)
    return ['cmprtype',a,b,tok]
  }
  // pow, mul, div, mod, add, sub
  function mathtype(a,b,tok) {
    log('mathtype',a,b,tok)
    return ['mathtype',a,b,tok]
  }

  function getWrd(wrd,state) {
    var type = nattype(wrd)
    if (type) return type
    else if (state.scp.tbl[wrd]) return state.scp.tbl[wrd]

    for (var i in state.scpS) {
      var scp = state.scpS[i]
      if (scp.tbl[wrd]) return scp.tbl[wrd]
    }
    return state.scp.tbl[wrd] = newtype('null','val',wrd)
  }

  var preType = {
    'scp': state => {
      state.scp && state.scpS.push(state.scp)
      state.scp = {
        tbl: {},
        ret: null
      }
    }
  }
  var pstType = {
    scp: state => {
      var ret = state.scp.ret || nulltype
      var scp = state.scpS.pop()
      if (scp) state.scp
      return ret
    },
    tup: state => arytype(state.args,'tup'),
    vec: state => arytype(state.args,'vec'),
    stat: state => arytype(state.args,'stat'),
    abs: state => arytype(state.args,'abs'),
    comp: state => lamtype(state.args[0],state.args[1],state),
    not: state => booltype(state.args[0],'not'),
    xor: state => booltype(state.args[0],'xor'),
    pdec: state => singtype(state.args[0],'pdec'),
    pinc: state => singtype(state.args[0],'pinc'),
    dec: state => singtype(state.args[0],'dec'),
    inc: state => singtype(state.args[0],'inc'),
    neg: state => singtype(state.args[0],'neg'),
    pos: state => singtype(state.args[0],'pos'),
    idx: state => idxtype(state.args[0],state.args[1]),
    pow: state => mathtype(state.args[0],state.args[1],'pow'),
    mul: state => mathtype(state.args[0],state.args[1],'mul'),
    div: state => mathtype(state.args[0],state.args[1],'div'),
    mod: state => mathtype(state.args[0],state.args[1],'mod'),
    add: state => mathtype(state.args[0],state.args[1],'add'),
    sub: state => mathtype(state.args[0],state.args[1],'sub'),
    equ: state => cmprtype(state.args[0],state.args[1],'equ'),
    neq: state => cmprtype(state.args[0],state.args[1],'neq'),
    gtr: state => cmprtype(state.args[0],state.args[1],'gtr'),
    les: state => cmprtype(state.args[0],state.args[1],'les'),
    leq: state => cmprtype(state.args[0],state.args[1],'leq'),
    geq: state => cmprtype(state.args[0],state.args[1],'geq'),
    conop: state => conoptype(state.args[0],state.args[1],state.args[2]),
    assign: state => assigntype(state.args[0],state.args[1])
  }

  function checkListTypes(list) {
    var state = {
      scpS: [],
      argS: [],
      args: []
    }

    try {
      for (var l in list) {
        l = list[l]
        var l0 = l[0]
        var l1 = l[1]
        if (l0 == 's') {
          if (preType[l1]) preType[l1](state)
          state.argS.push(state.args)
          state.args = []
        }
        else if (l0 == 'e') {
          var ret = pstType[l1](state)
          state.args = state.argS.pop()
          state.args.push(ret)
        }
        else if (l1 == 'wrd') {
          state.args.push(getWrd(l[2],state))
        }
        else if (l1 == 'num') {
          state.args.push(newtype('num','val',l[2]))
        }
        else throw `unexpected type '${l1}' at ${l[3]}`
      }
    }
    catch (e) {
      console.error(state)
      throw e
    }

    log('main',state)
  }

  return function(string) {

    // syntax pass
    var parse = parseString(string + '\n')
    for (var i in parse) replace(parse,i,'//','\n',null,true,true)
    for (var i in parse) replace(parse,i,'/*','*/',null,true)
    for (var i in parse) replace(parse,i,'(',')','tup',true)
    for (var i in parse) replace(parse,i,'[',']','vec',true)
    for (var i in parse) replace(parse,i,'{','}','scp',true)
    for (var i in parse) replace(parse,i,'|','|','abs',true)
    parseStat(parse)
    parsePrefx(parse,1,{'--':'pdec','++':'pinc','!':'not','~':'xor'})
    parsePstfx(parse,1,{'--':'dec','++':'inc'})
    parsePrefx(parse,1,{'-':'neg','+':'pos'},true)
    for (var i in parse) parseComp(parse,i)
    parseMidfx_rtlf(parse,1,{'.':'idx'})
    parseMidfx_lfrt(parse,1,{'^':'pow'})
    parseMidfx_rtlf(parse,1,{'*':'mul','/':'div','%':'mod'})
    parseMidfx_rtlf(parse,1,{'+':'add','-':'sub'})
    parseMidfx_rtlf(parse,1,{'==':'equ','!=':'neq','>':'gtr','<':'les','<=':'leq','>=':'geq'})
    parseConOp(parse,1)
    parseMidfx_lfrt(parse,1,{'=':'assign'})

    log(parse)

    var list = []
    listParse(parse,list)
    tokCheck(list)
    // list.forEach(l => log(l))
    checkListTypes(list)

    return function() {

    }
  }
}()

var temp = `
  vec3 main(vec3 a, vec3 b) {
    vec1 c = b - a 4 + 3 4 // this is a // comment
    vec1 test = 120 /* my name is khan */
    vec1 t = ++(--3)-- ++(3--) ^ 3 + 34 ? 3 : 3
    vec4 k = [1,2,3,4]
    mat1_3 m = [[1],[2],[3]]
    bol asdf = true
    asdf == 13 >= 3 < 10 > 3 <= 1 != 3

    return |c|
  }
`

var fun = PT.fcc(temp)
log(fun)
