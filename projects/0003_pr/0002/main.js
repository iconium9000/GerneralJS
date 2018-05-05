log = console.log
err = console.error

//--------------------------------------------------------------
// main bus
//--------------------------------------------------------------

var mem_val = {}
var mem_sat = {}
var mem_act = {}
var mem_nop = (r,v) => null
var mem_stk = []
var mem_fun = {
  '0000': [],
  'f0b0': [
    (r,v) => [2,'f0b0','000'+v[3],r[0]='000'+v[1],r[1]='000'+v[2]],
    (r,v) => [2,'f0b0',r[1],r[2]=v],
    (r,v) => [1,r[0],to_loc(to_int(v)|to_int(r[2]))]
  ],
  'f0b1': [
    (r,v) => [2,'f0b1','000'+v[3],r[0]='000'+v[1],r[1]='000'+v[2]],
    (r,v) => [2,'f0b1',r[1],r[2]=v],
    (r,v) => [1,r[0],to_loc(to_int(v)^to_int(r[2]))]
  ],
  'f0b2': [
    (r,v) => [2,'f0b2','000'+v[3],r[0]='000'+v[1],r[1]='000'+v[2]],
    (r,v) => [2,'f0b2',r[1],r[2]=v],
    (r,v) => [1,r[0],to_loc(to_int(v)&to_int(r[2]))]
  ],
  'f0b3': [
    (r,v) => [2,'f0b3','000'+v[3],r[0]='000'+v[1],r[1]='000'+v[2]],
    (r,v) => [2,'f0b3',r[1],r[2]=v],
    (r,v) => [1,r[0],to_loc(-(to_int(v)|to_int(r[2]))-1)]
  ],
  'f0b4': [
    (r,v) => [2,'f0b4','000'+v[2],r[0]='000'+v[1],r[1]='000'+v[3]],
    (r,v) => [1,r[0],to_loc(to_int(v)>>>to_int(r[1]))]
  ],
  'f0b5': [
    (r,v) => [2,'f0b5','000'+v[2],r[0]='000'+v[1],r[1]='000'+v[3]],
    (r,v) => [1,r[0],to_loc(to_int(v)>>to_int(r[1]))]
  ],
  'f0b6': [
    (r,v) => [2,'f0b6','000'+v[2],r[0]='000'+v[1],r[1]='000'+v[3]],
    (r,v) => [1,r[0],to_loc(to_int(v)<<to_int(r[1]))]
  ],
  'f0b7': [
    (r,v) => [2,'f0b7','000'+v[3],r[0]='000'+v[1],r[1]='000'+v[2]],
    (r,v) => [2,'f0b7',r[1],r[2]=v],
    (r,v) => [1,r[0],to_loc(to_int(v)+to_int(r[2]))]
  ],
  'f0b8': [
    (r,v) => [2,'f0b8','000'+v[3],r[0]='000'+v[1],r[1]='000'+v[2]],
    (r,v) => [2,'f0b8',r[1],r[2]=v],
    (r,v) => [1,r[0],to_loc(to_int(v)-to_int(r[2]))]
  ],
  'f0b9': [
    (r,v) => [2,'f0b9',r[0]='000'+v[1],r[1]='00'+v[2]+v[3]],
    (r,v) => [1,r[0],to_loc(v[0]+v[1]+r[1][2]+r[1][3])]
  ],
  'f0ba': [
    (r,v) => [2,'f0ba',r[0]='000'+v[1],r[1]=v[2]+v[3]+'00'],
    (r,v) => [1,r[0],to_loc(r[1][0]+r[1][1]+v[2]+v[3])]
  ],
  'f0bb': [
    (r,v) => [2,'f0bb',r[0] = '000'+v[1], r[1] = '00'+v[2]+v[3]],
    (r,v) => [1,r[0],to_loc(to_int(v)+to_int(r[1]))]
  ],
  'f0bc': [
    (r,v) => [2,'f0bc','000'+v[3],r[0]='000'+v[1],r[1]='000'+v[2]],
    (r,v) => [2,'f0bc',r[1], r[2]=v],
    (r,v) => [1,r[0],to_loc(to_int(v)>to_int(r[2])?0:1)]
  ],
  'f0bd': [
    (r,v) => [2,'f0bd','000'+v[3],r[0]='000'+v[1],r[1]='000'+v[2]],
    (r,v) => v=='0000'?[2,r[0],r[1]]:[0]
  ],
  'f0be': [
    (r,v) => [2,'f0be','000'+v[3], r[0]='000'+v[1],r[1]='000'+v[2]],
    (r,v) => [2,'f0be',r[1],r[2]=v],
    (r,v) => [2,r[0],to_loc(to_int(v)+to_int(r[2]))]
  ],
  'f0bf': [
    (r,v) => [2,'f0bf','000'+v[3], r[0]='000'+v[1],r[1]='000'+v[2]],
    (r,v) => [2,'f0bf',r[1],r[2]=v],
    (r,v) => [2,to_loc(to_int(v)+to_int(r[2])),r[0]]
  ],
  'f0a0': [
    (r,v) => v=='0000'?[3,'f0a0']:[1,'f0bb','bf01',r[0]=v,r[1]='f0b'+v[0]],
    mem_nop, mem_nop,
    (r,v) => [1,r[1],r[0]],
    mem_nop, mem_nop, mem_nop,
    (r,v) => [2,'f0a0','000f'],
    (r,v) => [2,'f0a0',v],
  ],
  'f0af': [
    (r,v) => [1,'000f',r[0]=v],
    (r,v) => [2,'f0a0',r[0]],
    // (r,v) => [0]
  ],
}

function mem_rd(loc) {
  return mem_val[loc]||'0000'
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

var sanity = 0
function boot() {
  try {
    while (true) {
      if (sanity++>0x100) throw `sanity`
      if (!mem_stk.length) throw 'no stk'
      err('boot')

      while (mem_stk.length) {
        var call = mem_stk.pop()
        var loc = mem_stk.pop()
        var sat = mem_sat[loc]
        log('call',loc,call,sat&&sat[0],sat&&sat[1])
        var fun = mem_fun[loc]
        var rot = call[0]

        if (fun && rot!=3 && (!sat || sat[0]<fun.length)) {
          mem_act[loc] = mem_act[loc] || mem_rd(loc)
        }
        if(rot==1) mem_act[call[1]] = call[2]
        else if(rot==2) mem_act[call[1]] = mem_rd(call[2])
      }

      for (var loc in mem_act) {
        var val = mem_act[loc]
        var fun = mem_fun[loc]

        if (fun) {
          var sat = mem_sat[loc] || (mem_sat[loc] = [0,[mem_rd(loc)]])
          if (sat[0]>=fun.length) sat[0] = 0
          fun = fun[sat[0]++]
          if (fun) mem_stk.push(loc,fun(sat[1],val)||[0])
          mem_val[loc] = sat[1][0]
        }
        else mem_val[loc] = val
        delete mem_act[loc]
      }
    }
  } catch (e) {
    return e
  }
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
  'idx': (r,i) => (i[0] = r) && [],
  'nop': r => [l => '0001'],
  'pause': r => [l => '0000'],
  'mov': r => [l => '0'+r[1]+'0'+r[2]],
  'la': r => [
    l => l[r[2]] && ('a'+r[1]+l[r[2]][0]+l[r[2]][1]),
    l => l[r[2]] && ('9'+r[1]+l[r[2]][2]+l[r[2]][3]),
  ],
  'li': r => [
    l => 'a'+r[1]+r[2][0]+r[2][1],
    l => '9'+r[1]+r[2][2]+r[2][3]
  ],
  '#deflbl': r => [],
  '#nomacro': r => [l => {
    var ret = ''
    for (var i in r) ret += r[i]
    return ret
  }],
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
  for (var i in simp) {
    var idx = []
    var tmp = simp[i](lbls)
    if (idx[0]) loc = to_int(idx[0])
    var tst = to_loc(to_int(tmp))
    if (tst!=tmp) throw `bad input '${tmp}' (${tst})`
    mem_val[to_loc(loc++)] = tmp
  }
  err(lbls)
}

var prog = `
  idx     4000
main:
  orlo    t0 03
  orlo    t1 06
  li      s0 f0b0
  sub     t2 t0 t1
  nop
  pause

  idx     5000

prog:
  la      r0 prog

`
setprog(prog,'4000')

//--------------------------------------------------------------
//main
//--------------------------------------------------------------

mem_stk.push('f0af',[1,'f0af','4000'])
err('boot ret',boot())

log(`mem_fun`,mem_fun)
log(`mem_val`,mem_val)
log(`mem_sat`,mem_sat)
log(`mem_act`,mem_act)
log(`mem_sat`,mem_stk)
log('sanity',sanity)
