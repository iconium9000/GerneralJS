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
  var is_nat = {
    'str':true,
    'num':true,
    'tok':true,
    'wrd':true
  }

  var tok_ops = {

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

  function matchTok(p,t) {
    return (typeof p) == 'object' && p[0] == 'tok' && p[1] == t
  }
  function replace(parse, i, s, e, r, reqe, lar) {
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
          parse.splice(i,j-i+1,rep)
        }
        else parse.splice(i,j-i+1)
        return
      }
    }

    if (reqe) throw `expected '${e}' after ${p[2]}`
  }
  function parseStat(parse) {
    var prev = 0
    for (var i = 1; i < parse.length; ++i) {
      var p = parse[i]
      if (typeof p != 'object') continue
      if (!is_nat[p[0]]) {
        parseStat(p)
        continue
      }
      var p1 = p[1]
      if (p1 != '\n' && p1 != ',' && p1 != ';') continue

      var rep = ['stat'].concat(parse.slice(prev+1,i))
      if (rep.length>1)parse.splice(prev+1,i-prev,rep)
      else parse.splice(prev+1,i-prev)

      i = prev+1
      if (rep.length>1) ++prev
    }
    var i = parse.length
    var rep = ['stat'].concat(parse.slice(prev+1,i))

    if (rep.length>1)parse.splice(prev+1,i-prev,rep)
    else parse.splice(prev+1,i-prev)
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
  function parsePrefx(parse,i,toks) {
    i = parseInt(i)
    log(i)
    if (i > parse.length-2) return
    parsePrefx(parse,i+1,toks)

    var a = parse[i]
    if (typeof a != 'object') return
    if (a[0])

    if (a[0] != 'tok' || !toks[a[1]]) return
    var b = parse[i+1]
    if (typeof b != 'object' || b[0] == 'tok' || b[0] == 'stat') return

    parse.splice(i,2,['prefx'+a[1]].concat(parse.slice(i,i+2)))
  }

  return function(string) {

    // syntax pass
    var parse = parseString(string + '\n')
    for (var i in parse) replace(parse,i,'"','"','str',true)
    for (var i in parse) replace(parse,i,"'","'",'str',true)
    for (var i in parse) replace(parse,i,'`','`','str',true)
    for (var i in parse) replace(parse,i,'//','\n',null,true,true)
    for (var i in parse) replace(parse,i,'/*','*/',null,true)
    for (var i in parse) replace(parse,i,'(',')','()',true)
    for (var i in parse) replace(parse,i,'[',']','[]',true)
    for (var i in parse) replace(parse,i,'{','}','{}',true)
    for (var i in parse) replace(parse,i,'|','|','abs',true)
    parseStat(parse)
    parsePrefx(parse,0,{'-':2,'+':2,'--':1,'++':1,'!':1,'~':1})
    for (var i in parse) parseComp(parse,i)

    log(parse)

    return function() {

    }
  }
}()

var temp = `
  vec3 main(vec3 a, vec3 b) {
    str s = 'asdf'
    vec3 c = b - a 4 + 3 4 // this is a // comment
    var test = 120 /* my name is khan */
    var t = ++(--3)-- ++(3--) ^ ~3 + !34 ? 3 : 3
    halpab == 13 >= 3 < 10 > 3 <= 1 != 3

    return |c|
  }
`

var fun = PT.fcc(temp)
log(fun)
