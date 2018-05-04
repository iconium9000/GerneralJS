  log = console.log
err = console.error

var mem_val = {}

var mem_ret = 'ffff'
var mem_fun = {
  '0000': [[5,'0000','0000']],
  'f0af': [
    [4,'f0f0','f0af'],
    [4,'000f','f0af'],
    [4,'f0a0','f0f0']
  ],
  'f0a0': [
    [3,'f0bb','bf01'],[0],[0],
    [7,(l,v)=>[3,'f0b'+v[0],v]],[0],[0],
    [4,'f0f0','000f'],[0],
    [4,'f0a0','f0f0']
  ],
  'f0b0': [
    [7,(l,v)=>v=='0000'?[9]:
      [8,(a,b)=>a|b,'000'+v[1],'000'+v[2],'000'+v[3]]],
  ],
  'f0b1': [
    [7,(l,v)=>[8,(a,b)=>a^b,'000'+v[1],'000'+v[2],'000'+v[3]]],
  ],
  'f0b2': [
    [7,(l,v)=>[8,(a,b)=>a&b,'000'+v[1],'000'+v[2],'000'+v[3]]],
  ],
  'f0b3': [
    [7,(l,v)=>[8,(a,b)=>-(a|b)-1,'000'+v[1],'000'+v[2],'000'+v[3]]],
  ],
  'f0b4': [
    [7,(l,v)=>[5,'f0e0','00'+v[2]+v[3]]],
    [7,(l,v)=>[8,(a,b)=>a>>>b,'000'+v[1],'000'+v[2],'f0e0']],
  ],
  'f0b5': [
    [7,(l,v)=>[5,'f0e0','00'+v[2]+v[3]]],
    [7,(l,v)=>[8,(a,b)=>a>>b,'000'+v[1],'000'+v[2],'f0e0']],
  ],
  'f0b6': [
    [7,(l,v)=>[5,'f0e0','00'+v[2]+v[3]]],
    [7,(l,v)=>[8,(a,b)=>a<<b,'000'+v[1],'000'+v[2],'f0e0']],
  ],
  'f0b7': [
    [7,(l,v)=>[8,(a,b)=>a+b,'000'+v[1],'000'+v[2],'000'+v[3]]],
  ],
  'f0b8': [
    [7,(l,v)=>[8,(a,b)=>a-b,'000'+v[1],'000'+v[2],'000'+v[3]]],
  ],
  'f0b9': [
    [7,(l,v)=>[5,'f0e0','00'+v[2]+v[3]]],
    [7,(l,v)=>[8,(a,b)=>a|b,'000'+v[1],'000'+v[1],'f0e0']],
  ],
  'f0ba': [
    [7,(l,v)=>[5,'f0e0',v[2]+v[3]+'00']],
    [7,(l,v)=>[8,(a,b)=>a|b,'000'+v[1],'000'+v[1],'f0e0']],
  ],
  'f0bb': [
    [7,(l,v)=>[3,'f0e0','00'+v[2]+v[3]]],
    [7,(l,v)=>[8,(a,b)=>a+b,'000'+v[1],'000'+v[1],'f0e0']],
  ],
  'f0bc': [
    [7,(l,v)=>[8,(a,b)=>a>b?0:1,'000'+v[1],'000'+v[2],'000'+v[3]]],
  ],
  'f0bd': [
    [7,(l,v)=>[8,(a,b,c)=>b==0?a:c,'000'+v[1],'000'+v[2],'000'+v[3]]],
  ],
  'f0be': [
    [7,(l,v)=>{
      var b = to_int(mem_rd('000'+v[3]))
      var a = mem_rd('000'+v[2])
      return [b==0?3:4,'f0f0',a]
    }]
  ],
  'f0bf': [
    [7,(l,v)=>{
      var c = mem_rd(mem_rd('000'+v[1]))
      var b = to_int(mem_rd('000'+v[3]))
      if (b==0) c = mem_rd(c)
      return [4,c,'000'+v[2]]
    }]
  ]
}
for (var i=0xf0f0;i<0xf100;++i)
  mem_fun[to_loc(i)] = [[7,(l,v)=>[6,l,v]]]

var mem_nsat = {}
var mem_sat = {}

function to_reg(loc,idx) {
  return '000'+loc[idx]
}
function mem_rd(loc) {
  return mem_val[loc]||'0000'
}
function get_reg(loc,idx) {
  return mem_rd(to_reg(loc,idx))
}
function to_int(loc) {
  var int = parseInt(loc,16)
  if (int<0x8000) return int
  return (int%0x10000)-0x10000
}
function to_loc(int) {
  if (int>0xffff) int = int % 0x10000
  if (int<-0x8000) int = int % 0x8000
  if (int< 0) int = 0xffff+int+1
  return ('0000'+int.toString(16)).slice(-4)
}

function call(loc,val) {
  log('_call',loc,val)
  mem_val[loc] = val
  mem_nsat[loc] = 0
}
function call_sat(loc) {
  var sat = mem_sat[loc]
  var fun = mem_fun[loc] && mem_fun[loc][sat]
  log('sat',loc,mem_val[loc],sat,fun)
  if (fun) call_fun(loc,fun)
}
function call_fun(loc,fun) {
  log('_fun',loc,fun)
  var sat = mem_sat[loc]
  var rot = fun[0]
  mem_nsat[loc] = mem_sat[loc]
  if (rot!=1&&rot!=7) ++mem_nsat[loc]
  if (rot==2) {
    var val = fun[1]
    mem_nsat[val] = (mem_sat[val]||0)+1
  }
  else if (rot==3) call(fun[1],fun[2])
  else if (rot==4) call(fun[1],mem_rd(fun[2]))
  else if (rot==5) mem_val[fun[1]] = fun[2]
  else if (rot==6) mem_val[fun[1]] = mem_rd(fun[2])
  else if (rot==7) call_fun(loc,fun[1](loc,mem_rd(loc)))
  else if (rot==8) {
    var ra = to_int(mem_rd(fun[3]))
    var rb = to_int(mem_rd(fun[4]))
    var rc = to_int(mem_rd(fun[2]))
    call(fun[2],to_loc(fun[1](ra,rb,rc)))
  }
  else if (rot==9) throw loc
}
var sanity = 0
function boot() {
  try {
    while (true) {
      if (sanity++>0x100) throw `sanity`
      var c = 0
      err('boot')
      mem_sat = mem_nsat
      mem_nsat = {}
      for (var i in mem_sat) call_sat(i) || ++c
      if (!c) throw `no_sat`
    }
  } catch (e) {
    return e
  }
}

var inst_rep = 'or xor and nor srl sra sll \
add sub orlo orhi addi gtr ifz rd wt'.split(' ')
var regs_rep = 'z t0 t1 t2 s0 s1 s2 \
s3 r0 r1 a0 a1 a2 sp ra pc'.split(' ')
var prog_rep = {}
for (var i=0;i<0x10;++i)
  prog_rep[inst_rep[i]] = prog_rep[regs_rep[i]] = i.toString(16)
var macros = {
  'mov': r => [l => '0'+r[1]+'0'+r[2]],
  'la': r => [
    l => '0'+r[1]+'00',
    l => l[r[2]] && ('a'+r[1]+l[r[2]][0]+l[r[2]][1]),
    l => l[r[2]] && ('9'+r[1]+l[r[2]][2]+l[r[2]][3]),
  ],
  '#deflbl': r => [],
  '#nomacro': r => [l => {
    var ret = ''
    for (var i in r) ret += r[i]
    return ret
  }],
}
function premacro(macro,line) {
  err(line)
}

function setprog(txt,loc) {
  err(prog_rep)
  loc = to_int(loc)

  txt = txt.replace(/:/g,'\n').split('\n')
  var simp = []
  var lbls = {}
  for (var t in txt) {
    t = txt[t].split('#')[0].split(' ')
    var r = []
    t.forEach(i=>i && r.push(prog_rep[i]||i))
    if (r.length) {
      var m = macros[r[0]]
      if (r.length==1&&!m) {
        m = macros['#deflbl']
        if (lbls[r[0]]) throw `already defined label '${r[0]}'`
        lbls[r[0]] = to_loc(simp.length+loc)
      }
      if (!m) m = macros['#nomacro']
      simp = simp.concat(m(r))
    }
  }
  var ans = []
  for (var i in simp) {
    var tmp = simp[i](lbls)
    var tst = to_loc(to_int(tmp))
    if (tst!=tmp) throw `bad input '${tmp}' (${tst})`
    ans.push(tmp)
  }
  for (var i=0;i<ans.length;++i)
    mem_val[to_loc(i+loc)] = ans[i]
  err(lbls)
}

var prog = `
  mov   t0 t2
  la    t0 this
  orlo  t0 01       # a = 1
  this:
  orlo  t1 02       # b = 2
  sub   t2 t0 t1    # c = a-b
`

setprog(prog,'4000')
call('f0af','4000')
err('boot ret',boot())

log(`mem_fun`,mem_fun)
log(`mem_val`,mem_val)
log(`mem_sat`,mem_sat)
log('sanity',sanity)
