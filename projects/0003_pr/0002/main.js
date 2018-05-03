log = console.log
err = console.error

var mem_val = {}
var prog = `9105 9203 8312 0000`.split(' ')
for(var i=0;i<prog.length;++i)
  mem_val[to_loc(i+0x4000)]=prog[i]

var mem_usat = [0,'0000']
var mem_inst = '0000'
var mem_ufun = null

var mem_fun = {
  'f0a0': [
    [0,'f0bb','bf01'],
    [2,(l,v)=>[0,'f0b'+v[0],v]],
    [1,'f0f0','000f'],
    [1,'f0a0','f0e0']
  ],
  'f0bb': [
    [2,(l,v)=>[0,'f0e0','00'+v[2]+v[3]]],
    [2,(l,v)=>[3,(a,b)=>a+b,'000'+v[1],'000'+v[1],'f0e0']]
  ],
  'f0af': [
    [1,'000f','f0af'],
    [1,'f0f0','000f'],
    [1,'f0a0','f0e0']
  ],
}
for (var i=0xf0f0;i<0xf100;++i)
  mem_fun[to_loc(i)]=[[2,(l,v)=>[1,'f0e'+l[3],v]]]

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
  mem_usat = [0,mem_inst]
  if (mem_fun[loc]) mem_sat[loc] = mem_usat
  mem_val[loc] = val
  mem_inst = loc
  mem_ufun = null
}
var sanity = 0
function boot() {
  while (true) {
    if (sanity++>0x100) return `sanity`

    var sat = mem_sat[mem_inst] || mem_usat
    if (!mem_ufun && mem_fun[mem_inst]) mem_ufun = mem_fun[mem_inst][sat[0]++]
    log(sanity,mem_inst,mem_rd(mem_inst),sat,mem_ufun)
    var fun = mem_ufun
    // if (!fun) err(sat[1])
    if (!fun) mem_inst = sat[1]
    else if (fun[0]==0) call(fun[1],fun[2])
    else if (fun[0]==1) call(fun[1],mem_rd(fun[2]))
    else if (fun[0]==2) mem_ufun = fun[1](mem_inst,mem_rd(mem_inst))
    else if (fun[0]==3) {
      var ra = to_int(mem_rd(fun[3]))
      var rb = to_int(mem_rd(fun[4]))
      mem_ufun = [0,fun[2],to_loc(fun[1](ra,rb))]
    }
    else break
  }
}

call('f0af','4000')
err(boot())
log(`mem_inst`,mem_inst)
log(`mem_val`,mem_val)
log(`mem_sat`,mem_sat)
log(`mem_usat`,mem_usat)
