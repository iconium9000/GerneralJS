log = console.log

PROJECT_NAME = 'Project Redstone'
log('init game.js', PROJECT_NAME)

var CEL_SIZE = 25
var PLR_PT = []
var CNTR_PT = []

var msij_to_clij = function() {
  var fun = PT.vcc('vvvs',(m,p,c,z) => Math.round((m-c)/z+p), 2)
  return msij => fun(msij,PLR_PT,CNTR_PT,CEL_SIZE)
}()
var clij_to_msij = function() {
  var fun = PT.vcc('vvvs',(m,p,c,z) => (m-p) * z + c, 2)
  return clij => fun(clij,PLR_PT,CNTR_PT,CEL_SIZE)
}()
var clij_to_srij = clij => `${clij[0]},${clij[1]}`
var srij_to_clij = function() {
  var fun = PT.vcc('v', parseFloat, 2)
  return srij => fun(srij.split(','))
}()

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  case 'parse':
    var s = PT.mata(msg.slice(1,msg.length),``,(i,s) => s + ' ' + i)
    log(`'${s}'`)
    try {
      eval(`log(${s})`)
    }
    catch (e) {
      log(e)
    }
    break
  default:
    log('GAME_MSG','default',key, sndr, rcvr, msg)
  }
}
GAME_SRVR_INIT = () => {
  log('init game srvr')
}
GAME_CLNT_INIT = () => {
  log('init game clnt')


}

OBJ_IDS = 0
OBJS = {}
function newID(type) {
  var id = ++OBJ_IDS
  OBJS[id] = type
  return id
}

PRT = {}
TYPS = {}
SEL = 1
NUL = 0
TYPS[TYP = -1] = 'Typ'
TYPS[_FN = newID(TYP)] = '_fn'
TYPS[_AL = newID(TYP)] = '_al'
TYPS[_LK = newID(TYP)] = '_lk'
TYPS[FUN = newID(_FN)] = 'Fun'
TYPS[FAL = newID(_AL)] = 'Fal'
TYPS[PFN = newID(_FN)] = 'Pfn'
TYPS[PAL = newID(_AL)] = 'Pal'
TYPS[PLK = newID(TYP)] = 'Plk'
TYPS[VFN = newID(_FN)] = 'Vfn'
TYPS[VAL = newID(_AL)] = 'Val'
TYPS[CFN = newID(TYP)] = 'Cfn'
TYPS[CEL = newID(TYP)] = 'Cel'
TYPS[CLK = newID(TYP)] = 'Clk'
PRT[FUN] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],NAL[i],FNS[i],ALS[i],LKS[i])
PRT[PFN] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],NAL[i],FNS[i],ALS[i])
PRT[VFN] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],FNS[i],ALS[i])
PRT[FAL] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],NAL[i],AL_SCP[i],
  AL_SRC[i],IN[i],OT[i],ON[i],LKS[i],INS[i],OTS[i])
PRT[PAL] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],AL_SCP[i],
  AL_SRC[i],IN[i],OT[i],ON[i],LKS[i],INS[i],OTS[i])
PRT[VAL] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],IN[i],OT[i],ON[i],AL_SCP[i],AL_SRC[i])
PRT[PLK] = (i,t) => log(i,TYPS[t],SCP[i],IN[i],OT[i],LKS[i])

function prtOBJ(i) {
  var t = OBJS[i]
  var prt = PRT[t]
  if (prt) prt(i,t)
  else log(i,TYPS[t])
}
function printOBJS() {
  for (var i in OBJS) {
    prtOBJ(i)
  }
}

SCP = {}
SRC = {}
FNS = {}
NAL = {}
ALS = {}
LKS = {}

CFS = {}
CLS = {}

AL_SCP = {}
AL_SRC = {}

INS = {}
OTS = {}
IN = {}
OT = {}
ON = {}

/*
  Fun, Pfn, Vfn
  scp[fx] = fx
  src[fx] = fx
  fns[fx] = {fx: fx, fx_fy: fx_fy, ...}
  nal[fx] = fx.nal
  als[fx] = [fx_al, ...]
  lks[fx] = {fx_fyz_ck: 1, ...}
  cfs[fx] = {fx_fy_cf: 1, ...}
  cls[fx] = {fx_fy_cl.srij: fx_fy_cl, ...}

  Pfn, Vfn
  scp[fx_fy] = fx
  src[fx_fy] = fy
  fns[fx_fy] = {fy: fx_fy, fy_fz: _fy_fz, ...}
  nal[fx_fy] = fy.nal
  als[fx_fy] = [fx_fy_al, ...]

  Vfn
  scp[_fx_fy] = _fx
  src[_fx_fy] = fy
  fns[_fx_fy] = {fx: _fx_fy, fy_fz: _fy_fz, ...}
  als[_fx_fy] = [_fx_fy_al, ...]

  Fal, Pal, Val
  scp[fx_al] = fx
  src[fx_al] = fx
  nal[fx_al] = idx(fx_al)
  al_scp[fx_al] = fx_al
  al_src[fx_al] = fx_al
  lks[fx_al] = {fx_fxy_lk: 1, ...}
  ins[fx_al] = {fx_fy_al: fx_fxy_lk, ...}
  ots[fx_al] = {fx_fy_al: fx_fxy_lk, ...}
  in[fx_al] = bool
  ot[fx_al] = bool

  Pal, Val
  scp[fx_fy_al] = fx
  src[fx_fy_al] = fx_fy
  al_scp[fx_fy_al] = fx_al
  al_src[fx_fy_al] = fx_fy_al
  lks[fx_fy_al] = {fx_fyz_lk: 1, ...}
  ins[fx_fy_al] = {fx_fz_al: fx_fyz_lk, ...}
  ots[fx_fy_al] = {fx_fz_al: fx_fyz_lk, ...}
  in[fx_fy_al] = bool
  ot[fx_fy_al] = bool

  Val
  scp[_fx_fy_al] = _fx
  src[_fx_fy_al] = _fx_fy
  al_scp[_fx_fy_al] = fx_al
  al_src[_fx_fy_al] = fx_fy_al
  in[_fx_fy_al] = bool
  ot[_fx_fy_al] = bool

  Cfn
  scp[fx_fy_cf] = fx
  src[fx_fy_cf] = fy
  fns[fx_fy_cf] = [fx_fy, ...]
  nal[fx_fy_cf] = [fy.nal, fx_fy_cf.nal.j]
  als[fx_fy_cf] = [[fx_fy_al, ...], ...]

  Cel
  scp[fx_fy_cl] = fx
  src[fx_fy_cl] = fx_fy_cf
  nal[fx_fy_cl] = fx_fy_cl.nal.ij
  als[fx_fy_cl] = [[[fx_fy_al, ...], ...], ...]

  Plk
  scp[fx_fyz_lk] = fx
  lks[fx_fyz_lk] = {fx_fyz_ck: 1, ...}
  in[fx_fyz_lk] = fx_fy_al
  ot[fx_fyz_lk] = fx_fz_al

  Clk
  scp[fx_fyz_ck] = fx
  lks[fx_fyz_ck] = {fx_fyz_lk: 1, ...}
  in[fx_fyz_ck] = fx_fy_cl
  ot[fx_fyz_ck] = fx_fz_cl
*/

function newFun(nal) {
  var fx = newID(FUN)
  SCP[fx] = fx
  SRC[fx] = fx
  FNS[fx] = {}
  NAL[fx] = nal
  ALS[fx] = []
  LKS[fx] = {}

  CFS[fx] = {}
  CLS[fx] = {}

  FNS[fx][fx] = fx

  for (var i = 0; i < nal; ++i) {
    var fx_al = newID(FAL)
    ALS[fx][i] = fx_al
    SCP[fx_al] = fx
    SRC[fx_al] = fx
    NAL[fx_al] = i
    AL_SCP[fx_al] = fx_al
    AL_SRC[fx_al] = fx_al
    LKS[fx_al] = {}
    INS[fx_al] = {}
    OTS[fx_al] = {}
    IN[fx_al] = false
    OT[fx_al] = false
    ON[fx_al] = false
  }

  return fx
}
function newPfn(fx,fy) {
  if (fx == fy) return fx
  var fx_fy = newID(PFN)
  var nal = NAL[fy]
  SCP[fx_fy] = fx
  SRC[fx_fy] = fy
  FNS[fx_fy] = {}
  NAL[fx_fy] = nal
  ALS[fx_fy] = []

  FNS[fx][fx_fy] = fx_fy
  FNS[fx_fy][fy] = fx_fy

  for (var i = 0; i < nal; ++i) {
    var fx_fy_al = newID(PAL)
    var fy_al = ALS[fy][i]

    ALS[fx_fy][i] = fx_fy_al
    SCP[fx_fy_al] = fx
    SRC[fx_fy_al] = fx_fy
    NAL[fx_fy_al] = i
    AL_SCP[fx_fy_al] = fy_al
    AL_SRC[fx_fy_al] = fx_fy_al
    LKS[fx_fy_al] = {}
    INS[fx_fy_al] = {}
    OTS[fx_fy_al] = {}
    IN[fx_fy_al] = false
    OT[fx_fy_al] = false
    ON[fx_fy_al] = false
  }

  return fx_fy
}
function newVfn(_fx,fx_fy) {
  var _fx_fy = FNS[_fx][fx_fy]
  if (_fx_fy) return _fx_fy

  var fx = SRC[_fx]
  if (fx != SCP[fx_fy]) return NUL
  var fy = SRC[fx_fy]

  _fx_fy = newID(VFN)
  SCP[_fx_fy] = _fx
  SRC[_fx_fy] = fy
  FNS[_fx_fy] = {}
  ALS[_fx_fy] = []

  FNS[_fx][fx_fy] = _fx_fy
  FNS[_fx_fy][fy] = _fx_fy

  var nal = NAL[fy]
  for (var i = 0; i < nal; ++i) {
    var _fx_fy_al = newID(VAL)
    var fy_al = ALS[fy][i]
    var fx_fy_al = ALS[fx_fy][i]

    ALS[_fx_fy][i] = _fx_fy_al
    SCP[_fx_fy_al] = _fx
    SRC[_fx_fy_al] = _fx_fy
    AL_SCP[_fx_fy_al] = fy_al
    AL_SRC[_fx_fy_al] = fx_fy_al
    IN[_fx_fy_al] = false
    OT[_fx_fy_al] = false
    ON[_fx_fy_al] = false
  }

  return _fx_fy
}
function newLnk(fx_fy_al,fx_fz_al) {
  var fx_fyz_lk = OTS[fx_fy_al][fx_fz_al]
  if (fx_fyz_lk) return fx_fyz_lk

  var fx = SCP[fx_fy_al]
  if (fx != SCP[fx_fz_al]) return NUL

  fx_fyz_lk = newID(PLK)
  SCP[fx_fyz_lk] = fx
  LKS[fx_fyz_lk] = {}
  IN[fx_fyz_lk] = fx_fy_al
  OT[fx_fyz_lk] = fx_fz_al

  INS[fx_fz_al][fx_fy_al] = fx_fyz_lk
  OTS[fx_fy_al][fx_fz_al] = fx_fyz_lk
  LKS[fx_fy_al][fx_fyz_lk] = SEL
  LKS[fx_fz_al][fx_fyz_lk] = SEL

  return fx_fyz_lk
}

function getIn(_fx,fx_fy_al) {
  for (var fx_fz_al in INS[fx_fy_al]) {
    var fx_fz = SRC[fx_fz_al]
    var _fx_fz = FNS[_fx][fx_fz]

    if (_fx_fz) {
      var nal = NAL[fx_fz_al]
      var _fx_fz_al = ALS[_fx_fz][nal]
      if (OT[_fx_fz_al]) return true
    }
  }
  return false
}
function setOt(_fx,fx_fy_al,vals) {
  for (var fx_fz_al in OTS[fx_fy_al]) {
    var fx_fz = SRC[fx_fz_al]
    var _fx_fz = newVfn(_fx,fx_fz)

    var nal = NAL[fx_fz_al]
    var _fx_fz_al = ALS[_fx_fz][nal]
    vals[_fx_fz_al] = SEL
  }
}
function doComp(vals) {
  for (var _fx_fy_al in vals) {
    var _fx = SCP[_fx_fy_al]
    var fx_fy_al = AL_SRC[_fx_fy_al]

    var _fx_fy = SRC[_fx_fy_al]
    var fy_al = AL_SCP[_fx_fy_al]

    IN[_fx_fy_al] = ON[_fx_fy_al] || getIn(_fx_fy,fy_al) ||
      (_fx != _fx_fy && getIn(_fx,fx_fy_al))
  }

  var new_vals = {}
  for (var _fx_fy_al in vals) {
    if (OT[_fx_fy_al] != IN[_fx_fy_al]) {
      OT[_fx_fy_al] = IN[_fx_fy_al]

      var _fx = SCP[_fx_fy_al]
      var fx_fy_al = AL_SRC[_fx_fy_al]

      var _fx_fy = SRC[_fx_fy_al]
      var fy_al = AL_SCP[_fx_fy_al]

      setOt(_fx_fy,fy_al,new_vals)
      if (_fx != _fx_fy) setOt(_fx,fx_fy_al,new_vals)
    }
  }
  return new_vals
}

var fx = newFun(2)
var fy = newFun(3)
var fz = newFun(4)
var fx_fy = newPfn(fx,fy)
var fx_fz = newPfn(fx,fz)
var fy_fz = newPfn(fy,fz)

var fx_al = ALS[fx][1]
var fx_fy_al = ALS[fx_fy][2]
var fy_al = ALS[fy][2]
var fy_fz_al = ALS[fy_fz][3]
var fx_fxy_lk = newLnk(fx_al,fx_fy_al)
var fy_fyz_lk = newLnk(fy_al,fy_fz_al)

ON[fx_al] = true
// printOBJS()
var vals = {}
vals[fx_al] = 1
vals = doComp(vals)
log(vals)
vals = doComp(vals)
log(vals)
vals = doComp(vals)
log(vals)
// printOBJS()


TICKS = 0
GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  if (TICKS++ < 10) {
    g.fillStyle = 'white'
    g.fillText('Loading...',20,20)

    return
  }

  CNTR_PT = PT.divs(USR_IO_DSPLY.wh,2)

  var mws = USR_IO_MWS

  g.fillStyle = 'white'
  pt.fillCircle(g, mws, 10)
  pt.fillSquare(g, clij_to_msij(msij_to_clij(mws)), 10)
  g.fillText(clij_to_srij(msij_to_clij(mws)), 20, 20)
}
