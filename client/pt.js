// import FU

// π = Math.PI
log = console.log
err = console.error
srfy = JSON.stringify
log('init pt.js')

PI = Math.PI
PI2 = 2 * PI

pt = PT = {}

PT.shuffle = input => {
  for (var i = input.length-1; i >=0; i--) {

    var randomIndex = Math.floor(Math.random()*(i+1))
    var itemAtIndex = input[randomIndex]

    input[randomIndex] = input[i]
    input[i] = itemAtIndex
  }
  return input;
}

PT.vec = (a,b,s,l) => {
  var p = []
  if (!s) return []
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => p[i] = (a[i] || 0) + s * (b[i] || 0))
  return p
}
PT.vece = (a,b,s,l) => {
  if (!s) return a
  FU.forlen(l || (a.length > b.length ? a : b).length,
    i => a[i] = (a[i] || 0) + s * (b[i] || 0))
  return a
}
PT.vecx = (a,b,l1,l2) => {
  var p = []
  l1 = l1 || (a.length > b.length ? a : b).length
  for (var i = 0; i < l1; ++i)
    PT.vece(p,a[i],b[i],l2)
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
// returns random vector of length lf
PT.rand = l => {
  var p = []
  FU.forlen(l, i => p[i] = Math.random())
  return p
}

PT.mul2 = (a,b) => {
  var a0 = a[0]||0, a1 = a[1]||0
  var b0 = b[0]||0, b1 = b[1]||0
  return [a0*b0-a1*b1,a0*b1+a1*b0]
}
PT.length = (p,l) => Math.sqrt(PT.suma(PT.mul(p,p,l)))
PT.dist = (a,b) => PT.length(PT.sub(a,b))
PT.invert = p => [-p[1] || 0, p[0] || 0]
PT.tan2 = p => Math.atan2(p[1] || 0, p[0] || 0)
PT.invert2x2 = m => {
  var a = m[0][0], b = m[1][0], c = m[0][1], d = m[1][1]
  var det = a*d-b*c
  return [[d/det,-c/det],[-b/det,a/det]]
}

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

PT.dot = (a,b,l) => PT.suma(PT.mul(a,b,l),l)
PT.cat = function() {
  var a = []
  FU.forEach(arguments, i => a = a.concat(i))
  return a
}

PT.bound = (p,min,max,l) => {
  l = l || FU.max_length([p,min,max])
  for (var i = 0; i < l; ++i) {
    var x = p[i] || 0, a = min[i] || 0, b = max[i] || 0
    p[i] = x < a ? a : x > b ? b : x
  }
  return p
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
PT.circle = (a,r) => [r*Math.cos(a),r*Math.sin(a)]
PT.color = p => PT.suma(PT.mats(p, 1, c => {
  c = c > 1 ? 1 : c < 0 ? 0 : c
  c = Math.floor(c * 255).toString(16)
  c = ('0' + c).slice(-2)
  return c
}, 3), '#')
PT.crand = (p,r) => {
  var t = PI2 * Math.random()
  var u = Math.random() + Math.random()
  var r = r * (u > 1 ? 2 - u : u)
  return PT.sum(p,PT.circle(t,r))
}

/**
  @param loc: [x,y] location on canvas
  @param  size:  [width, height] size of imaga in pixels
  @param  f:   [x (0,1), y (0,1)] => hue (0,1)
*/
PT.porkchop = (g,loc,size,f) => {
  var imageData = new ImageData(size[0],size[1])
  var w = size[0], h = size[1]
  for (var i = 0; i < w; ++i) {
    for (var j = 0; j < h; ++j) {
      var idx = j * (w * 4) + i * 4
      var hue = f([i/w,j/h])
      hue = hue > 1 ? 1 : hue < 0 ? 0 : hue
      hue = hue * 5
      imageData.data[idx] = (Math.abs(hue - 3) - 1) * 0xff
      imageData.data[idx + 1] = (2 - Math.abs(hue - 2)) * 0xff
      imageData.data[idx + 2] = (2 - Math.abs(hue - 4)) * 0xff
      imageData.data[idx + 3] = 0xff
    }
  }
  g.putImageData(imageData, loc[0]||0, loc[1]||0)
}

PT_UNIQUE_KEYS = {}
PT.unique_key = l => PT.matlse(l,'',(n,s)=>s+FU.rand_char())

/**
  @theta rotates around the y axis from the x axis to the x axis
  @phi rotates around the normal of the plane defined by theta from
    the positive end y axis to the xz plane to the negative y axis
  @radius is the radius of the vector
*/

PT.cart_to_sphere = ([x,y,z]) => {
  x = x || 0; y = y || 0; z = z || 0
  var xz = PT.length([x,z])
  var theta = PT.tan2([z,x])
  var phi = PT.tan2([xz,y])
  var radius = PT.length([x,y,z])
  return [theta,phi,radius]
}
PT.sphere_to_cart = ([theta,phi,radius]) => {
  theta = theta || 0; phi = phi || 0; radius = radius || 0
  var sin_phi = Math.sin(phi)
  var x = radius * Math.cos(theta) * sin_phi
  var y = radius * Math.cos(phi)
  var z = radius * Math.sin(theta) * sin_phi
  return [x,y,z]
}

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
  g.stroke()
}
PT.fillRect = (g, a, b, c) => {
  if (c) g.fillStyle = c

  g.beginPath()
  g.rect(a[0] || 0, a[1] || 0, b[0] || 0, b[1] || 0)
  g.fill()
}
PT.lineint2 = (p11,p12,p21,p22) => {
  var k12 = PT.sub(p12,p11,2)
  var k21 = PT.sub(p21,p11,2)
  var k22 = PT.sub(p22,p11,2)
  var m = k21[0]*k22[1] - k22[0]*k21[1]
  var m1 = [k22[1]/m,-k21[1]/m]
  var m2 = [-k22[0]/m,k21[0]/m]
  var q = PT.sum(PT.muls(m1,k12[0],2),PT.muls(m2,k12[1],2),2)
  var q1 = q[0]
  var q2 = q[1]
  if (q1 + q2 <= 1 || q1 <= 0 || q2 <= 0) return null

  var q3 = q2/q1
  var c1 = (q3*q1 - q2 + 1) / (q3 + 1)
  var c2 = 1 - c1

  var h = PT.sum(p11,PT.vecx([k21,k22],[c1,c2],2,2))
  return h
}
PT.radint2 = (p1,p2,c,r) => {
  var k1 = PT.sub(p1,c,2)
  var k2 = PT.sub(p2,c,2)
  var k3 = PT.sub(k1,k2,2)
  var k11 = k1[0]
  var k12 = k1[1]
  var k21 = k2[0]
  var k22 = k2[1]
  var k31 = k3[0]
  var k32 = k3[1]

  var qa = k32*k32 + k31*k31
  var qb = 2*(k22*k32 + k21*k31)
  var qc = k22*k22 + k21*k21 - r*r
  var qd = qb*qb - 4*qa*qc
  if (qd < 0) return null

  var q = (Math.sqrt(qd) - qb) / 2 / qa
  return q > 1 || 0 > q ? null : PT.sum(c,PT.vec(k2,k3,q,2))
}
PT.hitbox = (p1,v1,p2,v2) =>
   (p1[0] < p2[0] + v2[0]) &&
   (p1[0] + v1[0] > p2[0]) &&
   (p1[1] < p2[1] + v2[1]) &&
   (p1[1] + v1[1] > p2[1])



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

// PT.fcc = txt => {
//   var word = ''
//   var stack = []
//   var tup = []
//   var prev_c = '\0'
//   var table = {}
//
//   var idx_op = PT.fcc.ops['idx']
//   var mul_op = PT.fcc.ops['*']
//
//   var push_word = () => {
//     word && tup.push(word)
//     word = ''
//   }
//   var push = t_tup => {
//     stack.push(tup)
//     tup = t_tup
//   }
//   var get_op = w => {
//     if (table[w]) return table[w]
//     else if (PT.fcc.ops[w]) return table[w] = ['op',w,PT.fcc.ops[w]]
//     else return null
//   }
//   var check_idx = w => {
//     if (!w.length) return false
//     if (get_op(w)) return true
//     var l = w.length - 1
//     var d = w[l]
//     if ('0' <= d && d <= '9') {
//       var substr = w.substr(0,l)
//       if (check_idx(substr)) {
//         table[w] = [['op','idx',idx_op],table[substr],parseInt(d)]
//         return true
//       }
//     }
//     return false
//   }
//   var get_idx = w => {
//     var f = parseFloat(w)
//     if (!isNaN(f)) return table[w] = ['float',f]
//     if (check_idx(w)) return table[w]
//     else return table[w] = ['var','void',w]
//   }
//   var do_op = f => {
//     var op = f[0]
//     if (op[0] == 'op') op[2](f.slice(1))
//     else if (f[0] == 'txt') return f
//     else return mul_op(f)
//   }
//   var pop = (pfx,flag) => {
//     push_word()
//     if (tup[0] != pfx) {
//       if (tup[0] == 'tab') {
//         pop('tab',false)
//         pop(pfx,flag)
//       }
//       else if (flag) throw [`bad pfx ${tup[0]} (! ${pfx})`,stack]
//       return
//     }
//
//     for (var i in tup) {
//       var w = tup[i]
//       if (typeof w == 'string') {
//         tup[i] = table[w] || get_idx(w)
//       }
//     }
//     tup = do_op(tup)
//
//     if (stack.length) {
//       t_tup = tup
//       tup = stack.pop()
//       tup.push(t_tup)
//     }
//   }
//
//   for (var i in txt) {
//     var c = txt[i]
//
//     if (c == '(') push(['par'])
//     else if (c == '[') push(['vec'])
//     else if (c == '{') push(['scp'])
//     else if ((c == ' ' || c == '\t') && (prev_c == ' ' || prev_c == '\t')
//       && tup[0] != 'tab') push(['tab'])
//     else if (c == ' ' || c == '\t') push_word()
//     else if (c == '\n') pop('tab',false)
//     else if (c == ')') pop('par',true)
//     else if (c == ']') pop('vec',true)
//     else if (c == '}') pop('scp',true)
//     else word += c
//     prev_c = c
//   }
//   pop('main',true)
//   log(tup,table)
// }
// PT.fcc.ops = {
//   '+': f => {
//     // log('+',f)
//     return f
//   },
//   '-': f => {
//     // log('-',f)
//     return f
//   },
//   '/': f => {
//     // log('/',f)
//     return f
//   },
//   '*': f => {
//     // log('*',f)
//     return f
//   },
//   'idx': f => {
//     return f
//     // log('idx',f)
//   },
//   'if': f => {
//     return f
//     // log('if',f)
//   },
//   'tab': f => {
//     return f
//     // log('tab',f)
//   },
//   'par': f => do_op(f),
//   'sqr': f => {
//     log('sqr',f)
//     return f
//   },
//   'sqrt':f => {
//     return f
//     // log('sqrt',f)
//   },
//   'vec': f => {
//     return f
//     // log('vec',f)
//   },
//   'scp': f => {
//     return f
//     // log('scp',f)
//   },
//   'main': f => {
//     return f
//     // log('main',f)
//   },
//   'ret': f => {
//     return f
//     // log('ret',f)
//   },
//   '<': f => {
//     return f
//     // log('<',f)
//   },
//   '=': f => {
//     return f
//     // log('=',f)
//   },
//   'null': f => {
//     return f
//     // log('null',f)
//   },
// }

// PT.fcc(`main [(vec2 p0) (vec2 p1) (vec2 c) (vec1 r)] {
//   (vec2 k0) (- p0 c)
//   (vec2 k1) (- p1 c)
//   (vec2 k2) (- p0 p1)
//
//   (vec2 qa) (+ (sqr k21) (sqr k20))
//   (vec2 qb) (2 (+ (k11 k21) (k21 k20)))
//   (vec2 qc) (+ (sqr k11) (- (sqr k10) (sqr w)))
//   (vec2 qd) (- (sqr qb) (4 qa qc))
//
//   if (< qd 0) (ret null)
//
//   (vec1 q) (/
//     - (sqrt qd) qb
//     2 qa
//   )
//
//   ret (+ (q k2) k1 c)
// }`)
