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
  var temp = ()=>{}
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
    '"': true,
    "`": true,
    "'": true,
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
  }
  var is_scp = {
    '{}':true,
    '()':true,
    '[]':true,
    'abs':true,
    'stat':true,
  }
  var is_val = {
    'fun': true,
    'str': true,
    'num': true,
    'wrd': true,
    '{}': true,
    '[]': true,
    '()': true,
    'abs': true
  }
  var is_dlm = {
    '\n': true,
    ',': true,
    ';': true,
  }

  var tok_ops = {

  }

  function match(s,ary) {
    for (var i in ary) if (s == ary[i]) return true
    return false
  }
  function parseString(string) {
    var word = ''
    var ans = ['{}']

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
  function replace(parse, s, e, r, reqe, del) {
    var stack = []
    var ans = []
    var p = null
    for (var i in parse) {
      p = parse[i]
      var p1 = p[1]

      if (i == 0) ans.push(p)
      else if (is_scp[p[0]]) ans.push(replace(p,s,e,r,reqe))
      else if (p1 == s && !(s == e && stack.length)) {
        stack.push(ans)
        ans = [r]
      }
      else if (p1 == e) {
        var temp = stack.pop()
        if (temp) {
          del || temp.push(ans)
          ans = temp
        }
        else if (reqe) throw `unexpected '${e}' at ${p[2]}`
        else ans.push(p)
      }
      else ans.push(p)
    }

    if (stack.length) throw `expected '${e}' after ${p[2]}`

    return ans
  }
  function parseStat(parse) {
    var p0 = parse[0]
    if (p0 == '()' || p0 == '[]' || p0 == '{}') {
      var ans = [p0]

      var stat = ['stat']
      for (var i = 1; i < parse.length; ++i) {
        var p = parseStat(parse[i])

        if (is_dlm[p[1]]) {
          stat.length>1 && ans.push(stat)
          stat = ['stat']
        }
        else stat.push(p)
      }

      stat.length>1 && ans.push(stat)

      if (ans.length == 2) {
        ans = ans[1]
        ans[0] = p0
      }
      return ans
    }
    return parse
  }
  function parseVal(parse) {
    if (!is_scp[parse[0]]) return parse

    var ans = []
    var next = parseVal(parse[parse.length-1])
    for (var i = parse.length-2; i >= 0; --i) {
      var prev = parseVal(parse[i])
      if (is_val[next[0]] && is_val[prev[0]]) {
        next = ['fun', prev, next]
      }
      else {
        ans.splice(0,0,next)
        next = prev
      }
    }
    ans.splice(0,0,next)
    return ans
  }
  function parsePrefx(parse,toks) {
    var p0 = parse[0]
    if (p0 == 'fun') {
      for (var i = 1; i < parse.length; ++i)
        parse[i] = parsePrefx(parse[i],toks)
    }
    else if (is_scp[p0]) {
      var ans = []
      var next = parsePrefx(parse[parse.length-1],toks)
      for (var i = parse.length-2;i>=0;--i) {
        var prev = parsePrefx(parse[i],toks)
        var tok = toks[prev[1]]
        if (tok && is_val[next[0]] && (tok==1 || i <= 1 || !is_val[parse[i-1][0]])) {
          next = ['fun',['prefx',prev[1]],next]
        }
        else {
          ans.splice(0,0,next)
          next = prev
        }
      }
      ans.splice(0,0,next)
      return ans
    }
    return parse
  }
  function parsePstfx(parse,toks) {
    var p0 = parse[0]
    var len = parse.length
    if (p0 == 'fun') {
      for (var i = 1; i < len; ++i)
        parse[i] = parsePstfx(parse[i],toks)
    }
    else if (is_scp[p0]) {
      var ans = []
      var prev = parsePstfx(parse[0],toks)
      for (var i = 1; i < len; ++i) {
        var next = parsePstfx(parse[i],toks)
        var tok = toks[next[1]]
        if (tok && is_val[prev[0]] && (tok==1 || i > len-2 || !is_val[parse[i+1][0]])) {
          prev = ['fun',['pstfx',next[1]], prev]
        }
        else {
          ans.push(prev)
          prev = next
        }
      }
      ans.push(prev)
      return ans
    }
    return parse
  }
  function parseMidfx_LfRt(parse,toks) {
    if (!parse) return null

    var p0 = parse[0]
    var len = parse.length

    if (is_scp[p0] || p0 == 'fun')
      for (var i = 1; i < len; ++i)
        parse[i] = parseMidfx_LfRt(parse[i],toks)

    if (is_scp[p0]) {

      var ans = []
      var lexA = parse[0]
      var lexB = parse[1]

      for (var i = 2; i < len; ++i) {
        var lexC = parse[i]

        if (toks[lexB[1]] && lexA && is_val[lexA[0]] && is_val[lexC[0]]) {
          lexB = ['fun',['midfx',lexB[1]],lexA,lexC]
          lexA = null
        }
        else {
          lexA && ans.push(lexA)

          lexA = lexB;
          lexB = lexC;
        }
      }

      lexA && ans.push(lexA)
      lexB && ans.push(lexB)
      return ans
    }
    return parse
  }
  function parseMidfx_RtLf(parse,toks) {
    if (!parse) return null

    var p0 = parse[0]
    var len = parse.length

    if (is_scp[p0] || p0 == 'fun')
    for (var i = 1; i < len; ++i)
      parse[i] = parseMidfx_RtLf(parse[i],toks)

    if (is_scp[p0]) {

      var ans = []
      var lexC = parse[len-1]
      var lexB = parse[len-2]

      for (var i = len-3; i >= 0; --i) {
        var lexA = parse[i]

        if (toks[lexB[1]] && lexC && is_val[lexA[0]] && is_val[lexC[0]]) {
          lexB = ['fun',['midfx',lexB[1]],lexA,lexC]
          lexC = null
        }
        else {
          lexC && ans.splice(0,0,lexC)

          lexC = lexB;
          lexB = lexA;
        }
      }

      lexC && ans.splice(0,0,lexC)
      lexB && ans.splice(0,0,lexB)
      return ans
    }
    return parse
  }
  function parseConOp_helper(parse,i) {
    var tokA = parse[i+1]

    if (i > parse.length-2 || tokA[0] != 'tok' || tokA[1] != '?') return

    var err = `unexpected '?' at ${tokA[2]}`

    if (i > parse.length-4) throw err

    var valA = parse[i]
    if (!is_val[valA[0]]) throw err

    parseConOp_helper(parse,i+2)
    var valB = parse[i+2]
    if (!is_val[valB[0]]) throw err

    var tokB = parse[i+3]
    if (tokB[0] != 'tok' || tokB[1] != ':') throw `expected ':' after ${tokA[2]}`

    parseConOp_helper(parse,i+4)
    var valC = parse[i+4]
    if (!is_val[valC[0]]) throw err

    parse.splice(i,5,['fun',['conop','?'],valA,valB,valC])
  }
  function parseConOp(parse) {
    if (!parse) return null

    var p0 = parse[0]
    var len = parse.length

    if (is_scp[p0] || p0 == 'fun')
      for (var i = 1; i < len; ++i)
        parse[i] = parseConOp(parse[i])

    if (is_scp[p0])
      for (var i = 0; i < parse.length; ++i)
        parseConOp_helper(parse,i)
    return parse
  }
  function parseRmvStat(parse) {
    var p0 = parse[0]

    if (p0 == 'stat') {
      if (parse.length != 2) throw `stat syntax error, unhandled character`
      else return parse[1]
    }
    else if (is_scp[p0] || p0 == 'fun') {
      for (var i = 1; i < parse.length; ++i)
        parse[i] = parseRmvStat(parse[i])
    }

    return parse
  }
  function parseFinal(parse,scp,src) {
    var p0 = parse[0]
    var p1 = parse[1]
    var p2 = parse[2]
    // log(parse)
    var val = {}
    val.scp = scp
    val.src = src
    val.type = p0
    val.is_scp = false
    if (p0 == '{}') {
      for (var i = 1; i < parse.length; ++i) parse[i]
    }
    else if (p0 == 'abs') {
      val.args = []
      val.type = 'fun'
      val.val = 'abs'
      for (var i = 1; i < parse.length; ++i) val.args.push(parseFinal(parse[i],val,val))
    }
    else if (is_scp[p0]) {
      val.stats = []
      for (var i = 1; i < parse.length; ++i) val.stats.push(parseFinal(parse[i],scp,val))
    }
    else if (p0 == 'fun') {
      val.args = []

      var p10 = p1[0]
      var p11 = p1[1]
      var start = 1
      val.val = 'act'

      if (p10 == 'midfx' || p10 == 'prefx' || p10 == 'pstfx' || p10 == 'conop') {
        val.val = p10 + p11
        start = 2
      }

      for (var i = start; i < parse.length; ++i) val.args.push(parseFinal(parse[i],scp,val))
    }
    else if (p0 == 'num' || p0 == 'str' || p0 == 'wrd') {
      val.val = p1
      val.loc = p2
    }
    else throw `invalid identifier '${p0}'`

    return val
  }

  function symbleTable(parse,table) {
    var p0 = parse[0]
    if (!is_scp[p0] && p0 != 'fun') return

    for (var i = 1; i < parse.length; ++i) {
      var p = parse[i]
      if (p[0] == 'wrd') {
        var t = table[p[1]]
        if (!t) t = table[p[1]] = []

        t.push([parse,i,p])
      }
      else symbleTable(p,table)
    }
  }

  return function(string) {

    // syntax pass
    var parse = parseString(string + '\n')
    {
      parse = replace(parse, "'","'", 'str')
      parse = replace(parse, '"','"', 'str')
      parse = replace(parse, '`','`', 'str')
      parse = replace(parse, '//', '\n', 'com',false,true)
      parse = replace(parse, '/*', '*/', 'com',false,true)
      parse = replace(parse, '(',')', '()', true)
      parse = replace(parse, '[',']', '[]', true)
      parse = replace(parse, '{','}', '{}', true)
      parse = replace(parse, '|', '|', 'abs', true)
      parse = parseStat(parse)
      parse = parsePrefx(parse,{'-':2,'+':2,'++':1,'--':1,'!':1,'~':1})
      parse = parsePstfx(parse,{'++':1,'--':1})
      parse = parseVal(parse)
      parse = parseMidfx_RtLf(parse,{'^':1})
      parse = parseMidfx_LfRt(parse,{'*':1,'/':1,'%':1})
      parse = parseMidfx_LfRt(parse,{'+':1,'-':1})
      parse = parseMidfx_LfRt(parse,{'&&':1,'||':1})
      parse = parseMidfx_LfRt(parse,{'==':1,'>':1,'<':1,'>=':1,'<=':1,'!=':1})
      parse = parseConOp(parse)
      parse = parseMidfx_RtLf(parse,{'=':1})
      parse = parseRmvStat(parse)

      log(parseFinal(parse))
    }
    log(parse)

    // lexical pass
    {
      var table = {}
      symbleTable(parse,table)
      log(table)
    }


    return function() {

    }
  }
}()


var fun = PT.fcc(`
  vec3 main(vec3 a, vec3 b) {
    vec3 c = b - a 4 + 3 4
    var t = ++(--3)-- ++(3--) ^ ~3 + !34 ? 3 : 3
    halpab == 13 >= 3 < 10 > 3 <= 1 != 3

    return |c|
  }
`)
log(fun)
