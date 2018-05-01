log = console.log
err = console.error

var mem_val = {}
var mem_loc = {
  '@0000':'$zero','@0001':'$temp1','@0002':'$temp2','@0003':'$temp3',
  '@0004':'$var0','@0005':'$var1','@0006':'$var2','@0007':'$var3',
  '@0008':'$ret0','@0009':'$ret1','@000A':'$arg0','@000B':'$arg1',
  '@000C':'$sp','@000D':'$ra','@000E':'$pc','@000F':'$ni',
  '@ff00': '$float',
  '@fd00': '$disk',
  '@fc00': '$alu',
  '@4000': '$start'
}
var insts = ['or','xor','and','nor','nand',]
var mem_vloc = {}
{
  for (var i in mem_loc) {
    var loc = get_loc(i)
    var val = mem_loc[i]
    delete mem_loc[i]
    mem_loc[loc] = val
  }
  for (var i in mem_loc) mem_vloc[mem_loc[i]] = i
}

var mem_fun = {
  '$zero': val => 'zero',
  '$alu': val => {
    var loc = get_loc(val)
    err('err',val,loc)
    return '$zero'
  }
}
function get_loc(val) {
  if (val[0]=='@') {
    var ret = '@'
    for (var i=1;i<5;++i) {
      var l = val[i] || '0'
      var c = l.charCodeAt(0)
      if (57>=c&&c>=48) ret += l
      else if (102>=c&&c>=97) ret += l
      else if (70>=c&&c>=65) ret += String.fromCharCode(c+32)
      else ret += '0'
    }
    return ret
  }
  if (val[0]=='#') {
    val = val.slice(1).split(' ')
  }
  if (val[0]=='$'&&mem_vloc[val]) return mem_vloc[val]
  throw `bad val '${val}'`
}
function get_val(loc) {
  err('get_val',loc)
  return mem_loc[loc] || loc
}
function mem_rd(loc) {
  return mem_val[get_loc(loc)] || '$zero'
}
function mem_wt(loc,val) {
  loc = get_loc(loc)
  val = get_loc(val)
  val = get_val(val)
  loc = get_val(loc)
  var fun = mem_fun[loc]
  return mem_val[loc] = fun ? get_val(get_loc(fun(val))) : val
}

mem_wt('$alu','$start')
log(mem_val)
