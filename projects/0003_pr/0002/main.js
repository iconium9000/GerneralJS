log = console.log
err = console.error

//--------------------------------------------------------------
// funs
//--------------------------------------------------------------
var mem_val = {}
function mem_rd(loc) {
  return mem_val[loc]||'0000'
}
function to_int(loc) {
  var int = parseInt(loc,16)
  if (int<0x8000) return int
  return (int%0x10000)-0x10000
}
function to_abs(loc) {
  loc = to_int(loc)
  return loc < 0 ? 0xfffe - loc : loc
}
function to_loc(int) {
  int = int || 0
  if (int>0xffff) int = int % 0x10000
  if (int<-0x8000) int = int % 0x8000
  if (int< 0) int = 0xffff+int+1
  return ('0000'+int.toString(16)).slice(-4)
}


//--------------------------------------------------------------
// main bus
//--------------------------------------------------------------

var mem_stk = []
var mem_sat = {}

var apu_fun = {
  '0': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      b = to_int(r[b] || '0000')
      r[c] = to_loc(a|b)
    },
    ()=>[0]
  ],
  '1': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      b = to_int(r[b] || '0000')
      r[c] = to_loc(a^b)
    },
    ()=>[0]
  ],
  '2': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      b = to_int(r[b] || '0000')
      r[c] = to_loc(a&b)
    },
    ()=>[0]
  ],
  '3': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      b = to_int(r[b] || '0000')
      r[c] = to_loc(-(a|b)-1)
    },
    ()=>[0]
  ],
  '4': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      r[c] = to_loc(a >>> b)
    },
    ()=>[0]
  ],
  '5': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      r[c] = to_loc(a >> b)
    },
    ()=>[0]
  ],
  '6': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      r[c] = to_loc(a << b)
    },
    ()=>[0]
  ],
  '7': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      b = to_int(r[b] || '0000')
      r[c] = to_loc(a+b)
    },
    ()=>[0]
  ],
  '8': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      b = to_int(r[b] || '0000')
      r[c] = to_loc(a-b)
    },
    ()=>[0]
  ],
  '9': [
    (r,c,a,b) => {
      var t = r[c] || '0000'
      t = t[0] + t[1]
      var s = a.toString(16) + b.toString(16)
      r[c] = t + s
    },
    ()=>[0]
  ],
  'a': [
    (r,c,a,b) => {
      var t = r[c] || '0000'
      t = t[0] + t[1]
      var s = a.toString(16) + b.toString(16)
      r[c] = s + t
    },
    ()=>[0]
  ],
  'b': [
    (r,c,a,b) => {
      var t = to_int(r[c] || '0000')
      r[c] = to_loc(t + (a << 4) + b)
    },
    ()=>[0]
  ],
  'c': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      b = to_int(r[b] || '0000')
      r[c] = '000' + (a > b ? '0' : '1')
    },
    ()=>[0]
  ],
  'd': [
    (r,c,a,b) => {
      r[c] = r[b] == '0000' ? r[a] : r[c]
    },
    ()=>[0]
  ],
  'e': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      b = to_int(r[b] || '0000')
      return [2,'a0f0',to_loc(a+b)]
    },
    (r,c,a,b,v) => {
      r[c] = v
    }
  ],
  'f': [
    (r,c,a,b) => {
      a = to_int(r[a] || '0000')
      b = to_int(r[b] || '0000')
      err(r[c]||'0000')
      return [2,to_loc(a+b),r[c]||'0000']
    },
    ()=>[0]
  ],
}
var count = 0
var mem_fun = {
  '0000': [],
  'f0a0': [
    (r,v) => [2,'f0a0',r[0xf]=v],
    (r,v) => {
      r[0xf] = to_loc(1+to_int(r[0xf]))
      r[0x10] = v
      if (v=='0000') return [3]
      r[0] = '0000'
      var c = parseInt(v[1],16)
      var a = parseInt(v[2],16)
      var b = parseInt(v[3],16)
      // err(r[0xf])
      return apu_fun[v[0]][0](r,c,a,b)
    },
    (r,v) => {
      var i = r[0x10]
      r[0] = '0000'
      var c = parseInt(i[1])
      var a = parseInt(i[2])
      var b = parseInt(i[3])
      return apu_fun[v[0]][1](r,c,a,b,v)
    },
    (r,v) => [1,'f0a0',r[0xf]]
  ]
}

function tick() {
  try {
    var mem_act = {}
    while (mem_stk.length) {
      var call = mem_stk.pop()
      var loc = mem_stk.pop()
      var fun = mem_fun[loc]
      // log('call',call)

      if (call[0]!=3 && fun) {
        var sat = mem_sat[loc]
        if (!sat) sat = mem_sat[loc] = [0,[]]
        if (sat[0]<fun.length&&!mem_act[loc])
          mem_act[loc] = mem_rd(loc)
      }
      if (call[0]==1||call[0]==2) {
        mem_act[call[1]] = call[0]==2 ? mem_rd(call[2]) :call[2]
      }
    }

    for (var loc in mem_act) {
      var val = mem_act[loc]
      var fun = mem_fun[loc]
      // log('act',loc,val,fun)

      if (!fun) {
        mem_val[loc] = val
        continue
      }
      else if (!fun.length) continue

      var sat = mem_sat[loc]
      if (!sat) sat = mem_sat[loc] = [0,[]]

      if (sat[0]>=fun.length) sat[0] %= fun.length

      fun = fun[sat[0]++]

      var call = fun(sat[1],val) || [0]
      mem_stk.push(loc,call)

      // log('fin',mem_stk)
    }
  }
  catch(e) {
    err(e)
    return e
  }
}

function boot(loc) {
  boot.sanity = 0
  boot.m_sanity = 0x100
  mem_stk.push('f0a0',[1,'f0a0',loc])
  boot.loop = setInterval(tick)
}

function stop() {
  clearInterval(boot.loop)
  err('ERR SANITY')
  log(mem_sat['f0a0'][1])
}

//--------------------------------------------------------------
// set prog
//--------------------------------------------------------------


var inst_rep = 'or xor and nor srl sra sll \
add sub orlo orhi addi gtr ifz rd wt'.split(' ')
var regs_rep = 'z t0 t1 t2 s0 s1 s2 \
s3 r0 r1 a0 a1 at sp ra pc'.split(' ')
var prog_rep = {}
for (var i=0;i<0x10;++i)
  prog_rep[inst_rep[i]] = prog_rep[regs_rep[i]] = i.toString(16)
var macros = {
  'nop': r => [l => '0001'],
  'pause': r => [l => '0000'],
  'mov': r => [l => '0'+r[1]+'0'+r[2]],
  'la': r => [
    l => {
      l = l(r[2])
      return l && ('a'+r[1]+l[0]+l[1])
    },
    l => {
      l = l(r[2])
      return l && ('9'+r[1]+l[2]+l[3])
    }
  ],
  'str': r => {
    var ret = []
    var f = i => {
      ret.push(l=>i==4?'0c00':'bc01')
      ret.push(l=>r[1]+r[i]+r[2]+'c')
    }
    for (var i=4;i<r.length;++i) f(i)
    return ret
  },
  'li': r => [
    l => 'a'+r[1]+r[2][0]+r[2][1],
    l => '9'+r[1]+r[2][2]+r[2][3]
  ],
  '#deflbl': (r,i,l,s) => {
    var ls = l[r[0]] || (l[r[0]] = [])
    var loc = i[0] = r[1] || i[0]
    ls.push(loc)
    if (!s) return []
    s += '\0'
    var r = []
    var i = 0
    var f = (a,b) => l => a+b
    while (i < s.length) {
      var a = to_loc(s.charCodeAt(i++)).slice(2)
      var b = to_loc(s.charCodeAt(i++)).slice(2)
      r.push(f(b,a))
    }

    return r
  },
  '#nomacro': r => [l => {
    var ret = ''
    for (var i in r) ret += r[i]
    return ret
  }],
}

function setprog(txt,loc) {
  // log(prog_rep)
  loc = to_int(loc)

  txt = txt.replace(/:/g,'\n').split('\n')
  var simp = {}
  var lbls = {}
  for (var t in txt) {
    t = txt[t]
    var str_idx = t.indexOf('@')+1
    var str = str_idx && t.slice(str_idx)
    t = str_idx ? t.slice(0,str_idx-1) : t
    t = t.split('#')[0].split(' ')
    var r = []
    t.forEach(i=>i && r.push(prog_rep[i]||i))
    if (r.length) {
      var m = macros[r[0]]
      if (r.length<=2&&!m) m = macros['#deflbl']
      if (!m) m = macros['#nomacro']
      var idx = [to_loc(loc)]
      var r = m(r,idx,lbls,str)
      loc = to_int(idx[0])
      for (var i in r) simp[to_loc(loc++)] = r[i]
    }
  }
  // log(simp)
  for (var loc in simp) {
    var int = to_abs(loc)

    var f = r => {
      var min = Infinity
      var ls = null
      var l = lbls[r]
      for (var i in l) {
        i = l[i]
        var d = Math.abs(to_abs(i)-int)
        // log(d,i)
        if (d<min) {
          min = d
          ls = i
        }
      }
      // err(r,min,ls)
      return ls
    }
    var tmp = simp[loc](f)
    var tst = to_loc(to_int(tmp))
    if (tst!=tmp) throw `bad input '${tmp}' (${tst},${loc})`
    mem_val[loc] = tmp
  }
}

var prog = `
p_loc     f0c0
p_int     f0c1
p_char    f0c2

text      8000 @My name is Khan!
half      8100 @Some more text
stack     a000
main      4000
  la      sp stack
  la      a0 text
  la      at print_str
  mov     ra pc
  addi    ra 02
  mov     pc at

  la      t0 p_char
  li      t1 000a
  wt      t1 t0 0

  la      a0 half
  la      at print_str

  mov     ra pc
  addi    ra 02
  mov     pc at

  la      t0 p_char
  li      t1 000a
  wt      t1 t0 0

  li      a0 0005
  la      at fib
  mov     ra pc
  addi    ra 02
  mov     pc at

  la      t0 p_int
  wt      r0 t0 0

end
  li      t0 1234
  pause

print_str c000    # address at a0, return to ra
  str     wt sp at t0 t1 s0 s1 s2 ra
  mov     s2 sp
  addi    sp 06

  or      at 00
  la      s0 p_char
  la      s1 end
  mov     ra pc

loop
  rd      t0 a0 at
  addi    at 01
  srl     t1 t0 8
  sll     t0 t0 8
  srl     t0 t0 8
  ifz     pc s1 t0
  wt      t0 s0 0
  ifz     pc s1 t1
  wt      t1 s0 0
  mov     pc ra
end
  mov     sp s2
  str     rd sp at t0 t1 s0 s1 s2 ra
  mov     pc ra

fib       7000
  str     wt sp at t0 s0 s1 s2 a0 ra
  mov     s0 sp
  addi    sp 06

  li      r0 0001
  add     t0 r0 r0
  gtr     t0 t0 a0
  la      s1 end
  ifz     pc s1 t0

  la      s2 fib
  sub     a0 a0 t0
  mov     ra pc
  addi    ra 02
  mov     pc s2

  mov     s1 r0
  sub     a0 a0 t0

  mov     ra pc
  addi    ra 02
  mov     pc s2
  add     r0 r0 s1

end
  mov     sp s0
  str     rd sp at t0 s0 s1 s2 a0 ra
  mov     pc ra
`
setprog(prog,'4000')

//--------------------------------------------------------------
//main
//--------------------------------------------------------------

boot('4000')

// log(`mem_fun`,mem_fun)
log(`mem_val`,mem_val)
// log(`mem_sat`,mem_sat)
// log(`mem_act`,mem_act)
// log(`mem_sat`,mem_stk)
// log('sanity',sanity)
