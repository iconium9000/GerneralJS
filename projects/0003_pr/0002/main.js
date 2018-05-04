log = console.log
err = console.error

var mem_val = {}
var prog = `9105 9203 8312 0000`.split(' ')
for(var i=0;i<prog.length;++i)
  mem_val[to_loc(i+0x4000)]=prog[i]

var mem_ret = 'ffff'
var mem_fun = {
  '0000': [[5,'0000','0000']],
  'f0af': [
    [4,'000f','f0af'],
    [4,'f0f0','000f'],
    [4,'f0a0','f0f0']
  ],
  'f0a0': [
    [3,'f0bb','bf01'],[1],
    [7,(l,v)=>[3,'f0b'+v[0],v]],[1],
    [4,'f0f0','000f'],
    [4,'f0a0','f0f0']
  ],
  'f0bb': [
    [7,(l,v)=>[3,'f0e0','00'+v[2]+v[3]]],
    [7,(l,v)=>[8,(a,b)=>a+b,'000'+v[1],'000'+v[2],'f0e0']],
    [2,'f0a0']
  ],
}
for (var i=0xf0f0;i<0xf100;++i)
  mem_fun[to_loc(i)] = [[7,(l,v)=>[6,l,v]]]

var mem_sat = {

}

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
  var int = parseInt('0x'+loc)
  if (int<0x8000) return int
  return int-0x10000
}
function to_loc(int) {
  if (int>0xffff) int = int % 0x10000
  if (int<-0x8000) int = int % 0x8000
  if (int< 0) int = 0xffff+int+1
  return ('0000'+int.toString(16)).slice(-4)
}

function call(loc,val) {
  log('call',loc,val)
  mem_val[loc] = val
  mem_sat[loc] = 0
}
function call_sat(loc) {

  var sat = mem_sat[loc] || 0
  var fun = mem_fun[loc] && mem_fun[loc][sat]
  log('call_sat',loc,sat,fun)
  if (fun) call_fun(loc,fun)
  else delete mem_sat[loc]
}
function call_fun(loc,fun) {
  log('call_fun',loc,fun)
  var sat = mem_sat[loc]
  var rot = fun[0]
  if (rot!=1&&rot!=7) ++mem_sat[loc]
  if (rot==2) {
    var val = fun[1]
    if (mem_sat[val]) ++mem_sat[val]
    else mem_sat[val] = 1
  }
  else if (rot==3) call(fun[1],fun[2])
  else if (rot==4) call(fun[1],mem_rd(fun[2]))
  else if (rot==5) call(fun[1],fun[2])
  else if (rot==6) call(fun[1],mem_rd(fun[2]))
  else if (rot==7) call_fun(loc,fun[1](loc,mem_rd(loc)))
  else if (rot==8) {
    var ra = to_int(mem_rd(fun[3]))
    var rb = to_int(mem_rd(fun[4]))
    call(fun[2],to_loc(fun[1](ra,rb)))
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
      for (var i in mem_sat) call_sat(i) || ++c
      if (!c) throw `no_sat`
    }
  } catch (e) {
    return e
  }
}

call('f0af','4000')
err(boot())

log(`mem_fun`,mem_fun)
log(`mem_val`,mem_val)
log(`mem_sat`,mem_sat)
