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
    '@': true,
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

  // parseing
  {
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
        else if (!isint(word)) ans.push(['wrd',word,line_char])
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
      var p0 = parse[0]

      if (is_nat[p0]) {
        if (p0 == 'tok') throw `unexpected '${parse[1]}' at ${parse[2]}`
        list.push(['g',p0,parse[1],parse[2]])
        return
      }

      if (p0=='scp'||p0 == 'tup'||p0=='comp'||p0=='conop'||p0=='assign'||p0=='idx') {
        list.push(['s',p0])
        for (var i = 1; i < parse.length; ++i) listParse(parse[i],list)
        list.push(['e',p0])
      }
      else {
        list.push(['s','comp'])
        list.push(['g','wrd',p0])
        list.push(['s','tup'])
        for (var i = 1; i < parse.length; ++i) listParse(parse[i],list)
        list.push(['e','tup'])
        list.push(['e','comp'])
      }

      return list
    }
  }
  // list check
  {
    function isint(i) {
      return !isNaN(parseInt(i))
    }
    var alltyps = {
      '$void': ['void'],
      '$num': ['num'],
      '$bol': ['bol'],
      '$vec1': ['num'],
      '$vec2': ['vec',['num'],2],
      '$vec3': ['vec',['num'],3]
    }
    function isallnum(typ) {
      if (typ[0] == 'num') return true
      if (typ[0] == 'vec')
        return isallnum(typ[1])
      if (typ[0] == 'tup') {
        for (var i = 1; i < typ.length; ++i)
          if (!isallnum(typ[i])) return false
        return true
      }
      return false
    }
    function isallbol(typ) {
      if (typ[0] == 'bol') return true
      if (typ[0] == 'vec')
        return isallbol(typ[1])
      if (typ[0] == 'tup') {
        for (var i = 1; i < typ.length; ++i)
          if (!isallbol(typ[i])) return false
        return true
      }
      return false
    }
    function iscmplx(typ) {
      if (typ[0] == 'num') return true
      if (typ[0] == 'vec' && typ[1][0] == 'num' && typ[2] == 2) return true
      return false
    }
    var toktyps = {
      '$typ': typ => true,
      '$typA': typ => true,
      '$typB': typ => true,

      '$allnum': isallnum,
      '$allnumA': isallnum,
      '$allnumB': isallnum,

      '$allbol': isallbol,
      '$allbolA': isallbol,
      '$allbolB': isallbol,

      '$cmplx': iscmplx,
      '$cmplxA': iscmplx,
      '$cmplxB': iscmplx,
    }
    var gettoks = {
      typ: arg => arg[0] == 'nat' || arg[1],
      var: arg => (arg[0] == 'var' || arg[0] == 'def') && arg[2],
      val: arg => arg[0] == 'val' ?
        arg[2] : arg[0] == 'var' ? arg[3] || arg[2] : null,
    }
    function veccnvt(str,tok,val) {
      var ans = [str]
      for (var i = 1; i < val.length; ++i) ans.push([tok,val[i]])
      return ans
    }
    function veccnvtequ(str,tok,val,valA) {
      var ans = [str]
      for (var i = 1; i < val.length; ++i) ans.push([tok,val[i],valA[i]])
      return ans
    }
    function forall(tok,val) {
      if (val[0] != 'vec') return [tok,val]
      var ans = [tok]
      for (var i = 1; i < val.length) ans.push(forall(tok,val[i]))
      return ans
    }
    function forallequ(tok,val,valA) {
      if (val[0] != 'vec') return [tok,val,valB]
      var ans = [tok]
      for (var i = 1; i < val.length) ans.push(forall(tok,val[i],valA[i]))
      return ans
    }

    function hashcnvrt(arg) {
      if (alltyps[arg]) return alltyps[arg]
      if (arg.forEach) arg.forEach((a,i)=>arg[i] = hashcnvrt(a))
      else if (arg[0] == '#') return hashcnvrt(arg.slice(1).split(' '))
      return arg
    }

    var allnats = {
      void: '#typ $void',
      typ: '#typ $void',
      num: '#typ $num',
      bol: '#typ $bol',
      vec1: '#typ $num',
      vec2: '#typ $vec2',
      vec3: '#typ $vec3',
      true: ['val','$bol',['bol',true]],
      false: ['val','$bol',['bol',false]],
      return: ['nat',['ret','#@ $typ $val']],
      stat: ['nat',['stat','#@']],
      vec: ['nat',['vec',['@','#vec $typ $int']]],
      abs: ['nat',['absnum','#@ $num $val'],['absvec',['@','#vec $num $int','$val']]],
      not: ['nat',['not','#@ $allbol $val']],
      mod: ['nat',['mod','#@ $vec2 $val']],
      xor: ['nat',['xor',['@','#vec $allbol 2','$val']]],
      dot: ['nat',
        ['dotvecnum', ['@', '#vec $allnum 2', '$val']],
        ['dottupnum', ['@', '#tup $allnumA $allnumB', '$val']],
        ['dotvecbol', ['@', '#vec $allbol 2', '$val']],
        ['dottupbol', ['@', '#tup $allbolA $allbolB', '$val']]
      ],
      cross: ['nat',
        ['crossvec',['@','#vec $allnum 2','$val']],
        ['crosstup',['@','#tup $allnumA $allnumB','$val']]
      ],
      atan2: ['nat',['atan2',['@','#vec $cmplx 2','val']]],
      comp: ['nat',
        ['donat','#nat ..','#@'],
        ['dolam',['@','#lam $typA $typB','$val'],'#@ $typA $val'],
        ['newvec','#typ $typ','#@ $num $int'],
        ['newdef','#typ $typA','#var $typB $var'],
        ['lamtyp','#typ $typA','#typ $typB'],
        ['typcoerce','#@ $typA $val','#typ $typB'],
        ['voidlam','#typ $void','#@ $typ $val'],
        ['deflam','#def $typA $var', '#@ $typB $val'],
        ['parlam','#par $typA $vars', '#@ $typB $val'],
        ['setlam','#def $typA $var', ['@', '#lam $typB $typA', '$val']],
        ['cmpnum','#@ $allnumA $val', '#@ $allnumB $val'],
        ['cmpbol','#@ $allbolA $val', '#@ $allbolB $val']
      ],
      tup: ['nat',
        ['tupvoid'],
        ['tuppass','#@'],
        ['vectyp','#typ $typ', '#typ $typ', '..'],
        ['tuptyp','#typ $typA', '#typ $typB', '..'],
        ['vecpar','#def $typ $var', '#def $typ $var', '..'],
        ['tuppar','#def $typA $var', '#def $typB $var', '..'],
        ['vecval','#@ $typ $val', '#@ typ $val', '..'],
        ['tupval','#@ $typA $val', '#@ typB $val', '..']
      ],
      conop: ['nat',['conop','#@ $bol $val','#@ $typ $val','#@ $typ $val']],
      scp: ['nat',['scp', '..']],
      assign: ['nat',
        ['settyp',['var', '#typ $typA', '$var'], '#typ $typB'],
        ['setvar','#var $typ $var', '#@ $typ $val'],
        ['setdef','#def $typ $var', '#@ $typ $val']
      ],
      idx: ['nat',
        ['idxvectyp', ['typ', '#vec $typ $int'], '#val $num $int'],
        ['idxvecvar', ['var', '#vec $typ $int', '$var', '$val'], '#val $num $int'],
        ['idxvecval', ['val', '#vec $typ $int', '$val'], '#val $num $int'],
        ['idxtuptyp', ['typ', '#tup $typA $typB ..'], '#val $num $int'],
        ['idxtupvar', ['var', '#tup $typA $typB ..', '$var', '$val'], '#val $num $int'],
        ['idxtupval', ['val', '#tup $typA $typB ..', '$val'], '#val $num $int']
      ]
    }
    {
      FU.forEach(['pdec','pinc','dec','inc'],
        tok => allnats[tok] = ['nat',[tok, '#var $num $var $val']])
      FU.forEach(['neg','pos'], tok => allnats[tok] = ['nat',
        [tok+'num', '#@ $allnum $val'],
        [tok+'bol', '#@ $allbol $val']])
      FU.forEach(['pow','mul','div'], tok => allnats[tok] = ['nat',
        [tok+'vec', ['@',['vec','$cmplx',2],'$val']],
        [tok+'tup', ['@',['tup','$cmplxA','$cmplxB'],'$val']]])
      FU.forEach(['add','sub'], tok => allnats[tok] = ['nat',
        [tok+'num', ['@', '#vec $allnum 2', '$val']],
        [tok+'bol', ['@', '#vec $allbol 2', '$val']]])
      FU.forEach(['equ','neq'], tok => allnats[tok] =
        ['nat',[tok, ['@', '#vec $typ 2','$val']]])
      FU.forEach(['gtr','les','leq','geq'], tok => allnats[tok] = ['nat',[tok, '#@ $vec2 $val']])
      FU.forEach(['sin','cos','tan','csc','sec','cot','asin','acos','atan','acsc','asec','acot'],
        tok => allnats[tok] = ['nat', [tok, '#@ $cmplx $val']])
      for (var n in allnats) allnats[n] = hashcnvrt(allnats[n])
    }

    var allevals = {
      // var $wrd
      //   -> [var $void $var]
      'var': (state,arg) => ['var',['void'],['var',state.scp,arg]],
      // num $wrd
      //   -> [val $num $val]
      'num': (state,arg) => ['val',['num'],['num',arg]],
      // ret [@ $typ $val]
      //   -> [typ $void]
      'ret': (state,args) => {
        if (state.scp.ret) throw 'dup ret err'
        state.scp.ret = args[0]
        return ['typ',['void']]
      },
      // stat [@]
      //   vec [@ [vec $typ $int]]
      'stat': (state,args) => args[0],
      // absnum [@ $num $val]
      'absnum': (state,args) => {
        var val = gettoks.val(args[0])
        return ['val',['num'],val[0] == 'num' ?
          ['num',Math.abs(val[1])] : ['abs',val]]
      },
      // absvec [@ [vec $num $int] $val]
      'absvec': (state,args) => {
        var val = gettoks.val(args[0])
        if (val[0] == 'nums') {
          var sum = 0
          for (var i = 1; i < val.length; ++i) sum += val[i]*val[i]
          return ['val',['num'],['num']]
        }
        // val[0] == 'vec'
        var ans = ['sum']
        for (var i = 1; i < val.length; ++i) ans.push(['sqr',val[i]])
        return ['val',['num'],['sqrt',ans]]
      },
      // not [@ $allbol $val]
      'not': (state,args) => ['val',['bol'],forall('not',args[0])],
      // mod [@ $vec2 $val]
      'mod': (state,args) => {
        var val = gettoks.val(args[0])
        var valA = val[1]
        var valB = val[2]
        if (valA[0] == 'num' && valB[0] == 'num')
          return ['val',['num'],['num',FU.mod(valA[1],valB[1])]]
        return ['val',['num'],['mod',valA,valB]]
      },
      // xor [@ [vec $allbol 2] $val]
      //   -> [@ $allbol $val]
      'xor': (state,args) => {
        var val = gettoks.val(args[0])
        var valA = val[1]
        var valB = val[2]
        var typ = gettoks.typ(args[0])[1] // $allbol
        if (valA[0] == 'bol' && valB[0] == 'bol')

      },
      // crossvec [@ [vec $allnum 2] $val]
      //   -> [@ $allnum $val]
      'crossvec': (state,args) => {
        // TODO
        throw 'TODO'
      },
      // crosstup [@ [tup $allnumA $allnumB] $val]
      //   [@ $allnum $val]
      'crosstup': (state,args) => {
        // TODO
        throw 'TODO'
      },
      // donat [nat ..] [@]
      'donat': (state,args) => matchnat(state,args[0],[args[1]]),
      // dolam [@ [lam $typA $typB] $val] [@ $typA $val]
      //   -> [val $typB $val]
      'dolam': (state,args) => {


      }
      // newvec [typ $typ] [@ $num $int]
      //   -> [typ [vec $typ $int]]
      // newdef [typ $typA] [var $typB $var]
      //   -> [def $typA $var]
      // lamtyp [typ $typA] [typ $typB]
      //   -> [typ [lam $typA $typB]]
      // typcoerce [@ $typA $val] [typ $typB]
      //   -> [@ $typB $val]
      // voidlam [typ $void] [@ $typA $val]
      //   -> [val [lam $void $typA] $val]
      // deflam [def $typA $var] [@ $typB $val]
      //   -> [val [lam $typA $typB] $val]
      // parlam [par $typA $vars] [@ $typB $val]
      //   -> [val [lam $typA $typB] $val]
      // setlam [def $typA $var] [@ [lam $typB $typA] $val]
      //   -> [typ $void]
      // cmpnum [@ $allnumA $val] [@ $allnumB $val]
      //   -> [@ $allnum $val]
      // cmpbol [@ $allbolA $val] [@ $allbolB $val]
      //   -> [@ $allnum $val]
      // tupvoid
      //   -> [typ $void]
      // tuppass [@]
      //   -> [@]
      // vectyp [typ $typ] [typ $typ] ..
      //   -> [typ [vec $typ $int]]
      // tuptyp [typ $typA] [typ $typB] ..
      //   -> [typ [tup $typA $typB ..]]
      // vecdef [def $typ $var] [def $typ $var] ..
      //   -> [par [vec $typ $int] $vars]
      // tupdef [def $typA $var] [def $typB $var] ..
      //   -> [par [tup $typA $typB ..] $vars]
      // vecval [@ $typ $val] [@ typ $val] ..
      //   -> [val [vec $typ $int] $val]
      // tupval [@ $typA $val] [@ typB $val] ..
      //   -> [val [tup $typA $typB ..] $val]
      // conop [@ $bol $val] [@ $typ $val] [@ $typ $val]
      //   -> [val $typ $val]
      // scp ..
      //   -> [val $typ $val]
      // settyp [var [typ $typA] $var] [typ $typB]
      //   -> [typ $typB]
      // setvar [var $typ $var] [@ $typ $val]
      //   -> [@ $typ $val]
      // setdef [def $typ $var] [@ $typ $val]
      //   -> [typ $void]
      // idxvectyp [typ [vec $typ $int]] [val $num $int]
      //   -> [typ $typ]
      // idxvecvar [typ [tup $typA $typB ..]] [val $num $int]
      //   -> [typ $typ]
      // idxvecval [var [vec $typ $int] $var $val] [val $num $int]
      //   -> [var $typ $var $val]
      // idxtuptyp [var [tup $typA $typB ..] $var $val] [val $num $int]
      //   -> [var $typ $var $val]
      // idxtupvar [val [vec $typ $int] $val] [val $num $int]
      //   -> [val $typ $val]
      // idxtupval [val [tup $typA $typB ..] $val] [val $num $int]
      //   -> [val $typ $val]
      // pdec [var $num $var $val]
      //   -> [val $num $val]
      // pinc [var $num $var $val]
      //   -> [val $num $val]
      // dec [var $num $var $val]
      //   -> [val $num $val]
      // inc [var $num $var $val]
      //   -> [val $num $val]
      // negnum [@ $allnum $val]
      //   -> [@ $allnum $val]
      // negbol [@ $allbol $val]
      //   -> [@ $allbol $val]
      // posnum [@ $allnum $val]
      //   -> [@ $allnum $val]
      // posbol [@ $allbol $val]
      //   -> [@ $allbol $val]
      // powvec [@ [vec $cmplx 2] $val]
      //   -> [val $vec2 $val]
      // powtup [@ [tup $cmplxA $cmplxB] $val]
      //   -> [val $vec2 $val]
      // mulvec [@ [vec $cmplx 2] $val]
      //   -> [val $vec2 $val]
      // multup [@ [tup $cmplxA $cmplxB] $val]
      //   -> [val $vec2 $val]
      // divvec [@ [vec $cmplx 2] $val]
      //   -> [val $vec2 $val]
      // divtup [@ [tup $cmplxA $cmplxB] $val]
      //   -> [val $vec2 $val]
      // add [@ [vec $allnum 2] $val]
      // sub [@ [vec $allnum 2] $val]
      // dotvecnum [@ [vec $allnum 2] $val]
      // dottupnum [@ [tup $allnumA $allnumB] $val]
      // dotvecbol [@ [vec $allbol 2] $val]
      // dottupbol [@ [tup $allbolA $allbolB] $val]
      // equ [@ [vec $typ 2] $val]
      // neq [@ [vec $typ 2] $val]
      // gtr [@ $vec2 $val]
      // les [@ $vec2 $val]
      // leq [@ $vec2 $val]
      // geq [@ $vec2 $val]
      // sin [@ $cmplx $val]
      // cos [@ $cmplx $val]
      // tan [@ $cmplx $val]
      // csc [@ $cmplx $val]
      // sec [@ $cmplx $val]
      // cot [@ $cmplx $val]
      // asin [@ $cmplx $val]
      // acos [@ $cmplx $val]
      // atan [@ $cmplx $val]
      // acsc [@ $cmplx $val]
      // asec [@ $cmplx $val]
      // acot [@ $cmplx $val]
      // atan2 [@ [vec $cmplx 2] $val]
    }

    // matchnatsetup
    {
      function matchnatsub(state,sub,args) {
        log('matchnatsub',sub,args)
      }
    }

    function matchnat(state,nat,args) {
      for (var i = 1; i < nat.length; ++i) {
        if (matchnatsub(state,nat[i],args)) {
          return allevals[nat[i][0]](state,args)
        }
      }

      return hashcnvrt('#typ $void')
    }

    function starcal(tok,state) {
      if (tok == 'scp') {
        state.scp && state.scpS.push(state.scp)
        state.scp = {tbl:{},ret:null}
      }
      else if (tok == 'conop') {
        state.conS.push(state.con)
        state.con = state.args
      }
    }
    function wrdcal(tok,state) {
      if (allnats[tok]) return allnats[tok]
      if (state.scp.tbl[tok]) return state.scp.tbl[tok]
      for (var i = state.scpS.length-1; i >= 0; --i) {
        var tbltok = state.scpS[i].tbl[tok]
        if (tbltok) return tbltok
      }

      return state.scp.tbl[tok] = allevals['var'](state,tok)
    }
    function numcal(tok,state) {
      return allevals['num'](state,tok)
    }
    function endcal(tok,state) {
      var ret = matchnat(state,allnats[tok],state.args)
      if (tok == 'scp') state.scpS.length && (state.scp = state.scpS.pop())
      else if (tok == 'conop') state.con = state.conS.pop()
      return ret
    }

    function checkListTypes(list) {
      var state = {
        scpS: [],
        argS: [],
        conS: [],
        scp: null,
        args: [],
        con: null,
        vals: []
      }

      // log(list)

      for (var i in list) {
        var l = list[i]
        var l0 = l[0], l1 = l[1], l2 = l[2]
        if (l0 == 's') {
          state.args && state.argS.push(state.args)
          state.args = []
          starcal(l1,state)
        }
        else if (l0 == 'e') {
          var ret = endcal(l1,state)
          state.args = state.argS.pop()
          state.args.push(ret)
        }
        else if (l0 == 'g') {
          if (l1 == 'num') state.args.push(numcal(l2,state))
          if (l1 == 'wrd') state.args.push(wrdcal(l2,state))
        }
      }
      log('state',state)
      log('allnats',allnats)
    }
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
    parsePrefx(parse,1,{'--':'pdec','++':'pinc','!':'not'})
    parsePstfx(parse,1,{'--':'dec','++':'inc'})
    parsePrefx(parse,1,{'-':'neg','+':'pos'},true)
    for (var i in parse) parseComp(parse,i)
    parseMidfx_rtlf(parse,1,{'.':'idx'})
    parseMidfx_lfrt(parse,1,{'^':'pow'})
    parseMidfx_rtlf(parse,1,{'*':'mul','/':'div','%':'mod'})
    parseMidfx_rtlf(parse,1,{'+':'add','-':'sub','~':'xor'})
    parseMidfx_rtlf(parse,1,{'==':'equ','!=':'neq','>':'gtr','<':'les','<=':'leq','>=':'geq'})
    parseConOp(parse,1)
    parseMidfx_lfrt(parse,1,{'=':'assign'})

    log('parse',parse)

    var list = []
    listParse(parse,list)
    // list.forEach(l => log(l))
    checkListTypes(list)

    return function() {

    }
  }
}()

var temp = `
  (vec3 main)(vec3 a, (num 3) b) {
    vec1 c = b - a 4 + 3 4 // this is a // comment
    vec1 test = 120 /* my name is khan */
    vec1 t = ++(--3)-- ++(3--) ^ 3 + 34 ? 3 : 3
    vec3 k = [1,2,3]
    (vec2 3) m = [[1,2],[2,2],[3,2]]
    bol asdf = true
    asdf == 13 >= 3 < 10 > 3 <= 1 != 3

    return |c|
  }
`

var fun = PT.fcc(temp)
log(fun)
