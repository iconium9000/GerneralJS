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
      log(ans)
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
    function gettyp(ret) {
      return ret[1]
    }
    function equtyp(typA,typB) {
      if (!typA) return typB
      if (typA[0] != typB[0]) return false
      var t0 = typA[0]
      if (t0=='num'||t0=='bol') return true
      if (t0=='vec') return typA[2]==typB[2]&&equtyp(typA[1],typB[1])
      if (t0=='typ') return equtyp(typA[1],typB[1])
      if (t0=='lam') return equtyp(typA[1],typB[1]) && equtyp(typA[2],typB[2])
      if (t0=='nat') return false // TODO
      if (t0=='tup') {
        if (typA.length!=typB.length) return false
        for (var i = 1; i < typA.length; ++i) if (!equtyp(typA[i],typB[i])) return false
        return true
      }
      return false
    }

    var defnat = (state,args,typs,vals,vars) => {
      // TODO
      log(args,s)
    }

    var allnats = {
      void: '#typ $void',
      typ: '#typ $void',
      num: '#typ $num',
      bol: '#typ $bol',
      vec1: '#typ $num',
      vec2: '#typ $vec2',
      vec2: '#typ $vec3',
      return: ['nat',
        ['#return pass','#@ $typ $val']
      ],
      stat: ['nat',
        ['#stat pass','#@']
      ],
      vec: ['nat',
        ['#vec pass',['@','#vec $typ $int']]
      ],
      abs: ['nat',
        ['#abs pass','#@ $num $val'],
        ['#abs pass',['@','#vec $num $int','$val']]
      ],
      not: ['nat',
        ['','#@ $allbol $val']
      ],
      mod: ['nat',
        [defnat,'#@ $vec2 $val']
      ],
      xor: ['nat',
        [defnat,['@','#vec $allbol 2','$val']]
      ],
      dot: ['nat',
        [defnat, ['@', '#vec $allnum 2', '$val']],
        [defnat, ['@', '#tup $allnumA $allnumB', '$val']],
        [defnat, ['@', '#vec $allbol 2', '$val']],
        [defnat, ['@', '#tup $allbolA $allbolB', '$val']]
      ],
      cross: ['nat',
        [defnat,['@','#vec $allnum 2','$val']],
        [defnat,['@','#tup $allnumA $allnumB','$val']]
      ],
      comp: ['nat',
        [defnat,'#nat ..','#@'],
        [defnat,['@','#lam $typA $typB','$val'],'#@ $typA $val'],
        [defnat,'#typ $typ','#@ $num $int'],
        [defnat,'#typ $typA','#@ $typB $var'],
        [defnat,'#typ $typA','#typ $typB'],
        [defnat,'#@ $typA $val','#typ $typB'],
        [defnat,'#typ $void','#@ $typ $val'],
        [defnat,'#def $typA $var', '#@ $typB $val'],
        [defnat,'#par $typA $vars', '#@ $typB $val'],
        [defnat,'#def $typA $var', ['@', '#lam $typB $typA','$val']],
        [defnat,'#@ $allnumA $val', '#@ $allnumB $val'],
        [defnat,'#@ $allbolA $val', '#@ $allbolB $val']
      ],
      tup: ['nat',
        [defnat],
        [defnat,'#@'],
        [defnat,'#typ $typ', '#typ $typ', '..'],
        [defnat,'#typ $typA', '#typ $typB', '..'],
        [defnat,'#def $typ $var', '#def $typ $var', '..'],
        [defnat,'#def $typA $var', '#def $typB $var', '..'],
        [defnat,'#@ $typ $val', '#@ typ $val', '..'],
        [defnat,'#@ $typA $val', '#@ typB $val', '..']
      ],
      conop: ['nat',
        [defnat,'#@ $bol $val','#@ $typ $val','#@ $typ $val']
      ],
      scp: ['nat',
        [defnat,'..']
      ],
      assign: ['nat',
        [defnat, ['var', '#typ $typA', '$var'], '#typ $typB'],
        [defnat, '#var $typ $var', '#@ $typ $val'],
        [defnat, '#def $typ $var', '#@ $typ $val']
      ],
      idx: ['nat',
        [defnat, ['typ', '#vec $typ $int'], '#val $num $int'],
        [defnat, ['typ', '#tup $typA $typB ..'], '#val $num $int'],
        [defnat, ['var', '#vec $typ $int', '$var', '$val'], '#val $num $int'],
        [defnat, ['var', '#tup $typA $typB ..', '$var', '$val'], '#val $num $int'],
        [defnat, ['val', '#vec $typ $int', '$val'], '#val $num $int'],
        [defnat, ['val', '#tup $typA $typB ..', '$val'], '#val $num $int'],
      ]
    }
    {
      FU.forEach(['pdec','pinc','dec','inc'], tok => allnats[tok] = ['nat',
        [defnat, '#var $num $var $val']
      ])
      FU.forEach(['neg','pos'], tok => allnats[tok] = ['nat',
        [defnat, '#@ $allnum $val'],
        [defnat, '#@ $allbol $val']
      ])
      FU.forEach(['pow','mul','div'], tok => allnats[tok] = ['nat',
        [defnat, ['@',['vec','$cmplx',2],'$val']],
        [defnat, ['@',['tup','$cmplxA','$cmplxB'],'$val']],
      ])
      FU.forEach(['add','sub'], tok => allnats[tok] = ['nat',
      ])
      FU.forEach(['equ','neq'], tok => allnats[tok] = ['nat',
      ])
      FU.forEach(['gtr','les','leq','geq'], tok => allnats[tok] = ['nat',
      ])
    }

    function matchnat(state,nat,args) {
      log(nat)
    }


    function starcal(tok,state) {
      if (tok != 'scp') return
      state.scpS.push(state.scp)
      state.scp = {tbl:{},ret:null}
    }
    function wrdcal(tok,state) {
      return ['var',['void'],state.evnt(['var',tok])]
    }
    function numcal(tok,state) {
      return ['val',['num'],state.evnt(['num',tok])]
    }
    function endcal(tok,state) {
      return matchnat(state,allnats[tok],state.args)
    }

    function checkListTypes(list) {
      var state = {
        scpS: [],
        argS: [],
        scp: {tbl:{},ret:null},
        args: [],
        evnt: val => {
          log(val)
          return val
        }
      }

      log(list)

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
      log(state)
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

    log(parse)

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
    asdf.asdf.asdf
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
