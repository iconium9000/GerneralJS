log = console.log

PROJECT_NAME = 'Project Redstone'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

var CEL_SIZE = 25
var PLR_PT = []
var CNTR_PT = []

ARROW_SIZE = 3
ARROW_TIME = 20
ELAPSED_TIME = 0
CEL_WDTH = 10

var SAVE_FILE = PROJ_PATH + 'gameSave.txt'

var msij_to_clij = function() {
  var fun = PT.vcc('vvvs',(m,p,c,z) => Math.round((m-c)/z+p), 2)
  return msij => fun(msij,PLR_PT,CNTR_PT,CEL_SIZE)
}()
var clij_to_msij = function() {
  var fun = PT.vcc('vvvs',(m,p,c,z) => (m-p) * z + c, 2)
  return clij => fun(clij,PLR_PT,CNTR_PT,CEL_SIZE)
}()
var clij_to_srij = clij => `${clij[0] || 0},${clij[1] || 0}`
var srij_to_clij = function() {
  var fun = PT.vcc('v', parseFloat, 2)
  return srij => fun(srij.split(','))
}()
function drawArrowLine(g, pointA, pointB, radA, radB) {
  if (pointA != pointB) {
    pt.drawLine(g, pointB, pointA)

    var vect = pt.sub(pointB, pointA)
    var length = pt.length(vect)
    var arrow = ARROW_TIME * length //Math.ceil(length / 20) * 20
    var scale = (ELAPSED_TIME % arrow) / arrow
    arrow = scale * length

    if (arrow > length - radB) pt.drawCircle(g, pointB, radB + 2)
    else if (radA > arrow) pt.drawCircle(g, pointA, radA + 2)

    pt.fillCircle(g, pt.sum(pointA,pt.muls(vect, scale)), ARROW_SIZE)
  }
}

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
  case 'rqst_update':
    var gameSave = JSON.parse(FS.readFileSync(SAVE_FILE))
    HOST_MSG('update',[sndr],gameSave)
    break
  case 'save':
    try {
      FS.writeFileSync(SAVE_FILE,msg)
      HOST_MSG('alert',[sndr],'Saved!')
    }
    catch (e) {
      console.error(e)
      HOST_MSG('alert',[sndr],'ERROR: Save Failed')
    }
    break
  case 'update':
    getRead(msg)
    alert('updated')
    break
  case 'alert':
    alert(msg)
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

  HOST_MSG('rqst_update',[0])
}

function newID(type) {
  var id = ++OBJ_IDS
  OBJS[id] = type
  return id
}
function prtOBJ(i) {
  var t = OBJS[i]
  var prt = PRT[t]
  if (prt) prt(i,t)
  else log(i,TYPS[t])
}
function prtOBJS() {
  for (var i in OBJS) {
    prtOBJ(i)
  }
}

function clearAll() {
  OBJ_IDS = 0
  OBJS = {}

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
  PRT[FUN] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],NAL[i],FNS[i],ALS[i],LKS[i],CLS[i])
  PRT[PFN] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],NAL[i],FNS[i],ALS[i])
  PRT[VFN] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],FNS[i],ALS[i])
  PRT[FAL] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],NAL[i],AL_SCP[i],
    AL_SRC[i],IN[i],OT[i],ON[i],LKS[i],INS[i],OTS[i])
  PRT[PAL] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],AL_SCP[i],
    AL_SRC[i],IN[i],OT[i],ON[i],LKS[i],INS[i],OTS[i])
  PRT[VAL] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],IN[i],OT[i],ON[i],AL_SCP[i],AL_SRC[i])
  PRT[PLK] = (i,t) => log(i,TYPS[t],SCP[i],IN[i],OT[i],LKS[i])
  PRT[CLK] = (i,t) => log(i,TYPS[t],SCP[i],IN[i],OT[i],LKS[i])
  PRT[CFN] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],TXT[i],LOC[i],NAL[i],FNS[i],ALS[i],CLS[i])
  PRT[CEL] = (i,t) => log(i,TYPS[t],SCP[i],SRC[i],TXT[i],LOC[i],NAL[i],ALS[i],LKS[i],INS[i],OTS[i],CLS[i])

  FXS = {}
  _FX = null
  VALS = {}
  PREV_NAME = 'f(x)'
  PREV_NAL = 1
  PREV_IDX = '='
  SEL_CL = NUL
  DN_CL = NUL

  SCP = {}
  SRC = {}
  FNS = {}
  NAL = {}
  ALS = {}
  LKS = {}

  CFS = {}
  CLS = {}
  TXT = {}
  LOC = {}

  AL_SCP = {}
  AL_SRC = {}

  INS = {}
  OTS = {}
  IN = {}
  OT = {}
  ON = {}
}

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

  Cfn, Cel
  scp[fx_fy_cf] = fx
  src[fx_fy_cf] = fy
  nal[fx_fy_cf] = [fy_nal,_cf_nal]
  fns[fx_fy_cf] = [fx_fy, ...]
  als[fx_fy_cf] = [[{fx_fy_al: 1}, ...], ...]
  cls[fx_fy_cf] = {fx_fz_cl: 1, ...}
  lks[fx_fy_cf] = {fx_fyz_ck: 1, ...}
  ins[fx_fy_cf] = {fx_fz_cl: fx_fyz_ck, ...}
  ots[fx_fy_cf] = {fx_fz_cl: fx_fyz_ck, ...}

  Cel
  scp[fx_fy_cl] = fx
  src[fx_fy_cl] = fx_fy_c_
  nal[fx_fy_cl] = [_nalI, _nalJ]
  fns[fx_fy_cf] = {fx_fy: 1, ...}
  als[fx_fy_cl] = [[{fx_fy_al: 1, ...}, ...], ...]
  cls[fx_fy_cl] = {fx_fz_cl: 1, ...}
  lks[fx_fy_cl] = {fx_fyz_ck: 1, ...}
  ins[fx_fy_cl] = {fx_fz_cl: fx_fyz_ck, ...}
  ots[fx_fy_cl] = {fx_fz_cl: fx_fyz_ck, ...}

  Plk
  scp[fx_fyz_lk] = fx
  lks[fx_fyz_lk] = {fx_fyz_ck: 1, ...}
  in[fx_fyz_lk] = fx_fy_al
  ot[fx_fyz_lk] = fx_fz_al

  Clk
  scp[fx_fyz_ck] = fx
  lks[fx_fyz_ck] = [fx_fyz_lk, ...]
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
  if (fx_fy_al == fx_fz_al) return NUL

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
function newCfn(fx,fy,nalJ,clij,txt) {
  var srij = clij_to_srij(clij)
  var fx_fy_cl = CLS[fx][srij]
  if (fx_fy_cl) return fx_fy_cl

  var fy_nal = NAL[fy]

  var fx_fy_cf = newID(CFN)

  CLS[fx][srij] = fx_fy_cf

  SCP[fx_fy_cf] = fx
  SRC[fx_fy_cf] = fy
  NAL[fx_fy_cf] = [fy_nal, nalJ]
  FNS[fx_fy_cf] = []
  ALS[fx_fy_cf] = []
  TXT[fx_fy_cf] = txt
  LOC[fx_fy_cf] = srij
  LOC[srij] = clij

  CLS[fx_fy_cf] = {}
  LKS[fx_fy_cf] = {}
  INS[fx_fy_cf] = {}
  OTS[fx_fy_cf] = {}

  for (var j = 0; j < nalJ; ++j) {
    var fx_fy = newPfn(fx,fy)
    FNS[fx_fy_cf][j] = fx_fy

    for (var i = 0; i < fy_nal; ++i) {
      var k = j * fy_nal + i
      var fx_fy_al = ALS[fx_fy][i]
      var _als = ALS[fx_fy_cf][k] = {}
      _als[fx_fy_al] = SEL
    }
  }

  return fx_fy_cf
}
function newCel(fx_fy_cf,nalij,msk,clij,txt) {
  var fx = SCP[fx_fy_cf]
  var srij = clij_to_srij(clij)
  var fx_fy_cl = CLS[fx][srij]
  if (fx_fy_cl) return fx_fy_cl

  var fx_fy_cl = newID(CEL)

  var nalI = nalij[0]
  var nalJ = nalij[1]

  CLS[fx][srij] = fx_fy_cl
  CLS[fx_fy_cf][fx_fy_cl] = SEL

  SCP[fx_fy_cl] = fx
  SRC[fx_fy_cl] = fx_fy_cf
  NAL[fx_fy_cl] = nalij
  FNS[fx_fy_cl] = {}
  ALS[fx_fy_cl] = []
  TXT[fx_fy_cl] = txt
  LOC[fx_fy_cl] = srij
  LOC[srij] = clij

  CLS[fx_fy_cl] = {}
  LKS[fx_fy_cl] = {}
  INS[fx_fy_cl] = {}
  OTS[fx_fy_cl] = {}

  for (var j = 0; j < nalJ; ++j) {
    for (var i = 0; i < nalI; ++i) {
      var k = j * nalI + i
      var _als = ALS[fx_fy_cl][k] = {}
      for (var mal in msk[k]) {
        var cals = ALS[fx_fy_cf][mal]
        for (var _al in cals) {
          var fx_fy = SRC[_al]
          _als[_al] = SEL
          FNS[fx_fy_cl][fx_fy] = SEL
        }
      }
    }
  }

  return fx_fy_cl
}
function newClk(fx_fy_cl,fx_fz_cl) {
  var fx_fyz_ck = OTS[fx_fy_cl][fx_fz_cl]
  if (fx_fyz_ck) return fx_fyz_ck
  if (fx_fy_cl == fx_fz_cl) return NUL

  var fx = SCP[fx_fy_cl]
  if (fx != SCP[fx_fz_cl]) return NUL
  var _fy__nal = NAL[fx_fy_cl]
  var _fz__nal = NAL[fx_fz_cl]

  if (_fy__nal[0] != _fz__nal[0]) return NUL
  if (_fy__nal[1] != _fz__nal[1]) return NUL

  fx_fyz_ck = newID(CLK)
  SCP[fx_fyz_ck] = fx
  var _lks = LKS[fx_fyz_ck] = {}
  IN[fx_fyz_ck] = fx_fy_cl
  OT[fx_fyz_ck] = fx_fz_cl

  LKS[fx_fy_cl][fx_fyz_ck] = SEL
  LKS[fx_fz_cl][fx_fyz_ck] = SEL
  OTS[fx_fy_cl][fx_fz_cl] = fx_fyz_ck
  INS[fx_fz_cl][fx_fy_cl] = fx_fyz_ck

  var nal = _fy__nal[0] * _fy__nal[1]
  for (var i = 0; i < nal; ++i) {
    var _fy__als = ALS[fx_fy_cl][i]
    var _fz__als = ALS[fx_fz_cl][i]

    for (var _fy__al in _fy__als) {
      for (var _fz__al in _fz__als) {
        var _fyz_lk = newLnk(_fy__al,_fz__al)
        if (_fyz_lk) {
          LKS[_fyz_lk][fx_fyz_ck] = SEL
          LKS[fx_fyz_ck][_fyz_lk] = SEL
        }
      }
    }
  }

  return fx_fyz_ck
}

function rmvLnk(fx_fyz_lk) {
  if (!FU.isEmpty(LKS[fx_fyz_lk])) return

  var fx_fy_al = IN[fx_fyz_lk]
  var fx_fz_al = OT[fx_fyz_lk]

  delete LKS[fx_fy_al][fx_fyz_lk]
  delete LKS[fx_fz_al][fx_fyz_lk]
  delete OTS[fx_fy_al][fx_fz_al]
  delete INS[fx_fz_al][fx_fy_al]
}
function rmvClk(fx_fyz_ck) {
  var fx_fy_cl = IN[fx_fyz_ck]
  var fx_fz_cl = OT[fx_fyz_ck]

  delete LKS[fx_fy_cl][fx_fyz_ck]
  delete LKS[fx_fz_cl][fx_fyz_ck]
  delete OTS[fx_fy_cl][fx_fz_cl]
  delete INS[fx_fz_cl][fx_fy_cl]

  for (var _fyz_lk in LKS[fx_fyz_ck]) {
    delete LKS[_fyz_lk][fx_fyz_ck]
    rmvLnk(_fyz_lk)
  }
}
function rmvCel(fx_fy_cl) {
  var _cl_prnt = SRC[fx_fy_cl]
  delete CLS[_cl_prnt][fx_fy_cl]

  for (var _cl_chld in CLS[fx_fy_cl])
    rmvCel(_cl_chld)

  for (var _ck in LKS[fx_fy_cl])
    rmvClk(_ck)

  var srij = LOC[fx_fy_cl]
  var fx = SCP[fx_fy_cl]
  if (CLS[fx][srij] == fx_fy_cl)
    delete CLS[fx][srij]
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
function getTrn(fx_al,_fx) {
  if (fx_al == TRN_AL0){
    var _al1 = ALS[_fx][1]
    var _al2 = ALS[_fx][2]
    return OT[_al1] && !OT[_al2]
  }
  else return false
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
function setTrn(fx_al,_fx,vals) {
  if (fx_al == TRN_AL1 || fx_al == TRN_AL2) {
    var _al = ALS[_fx][0]
    vals[_al] = SEL
  }
  else return false
}
function doComp(vals) {
  for (var _fx_fy_al in vals) {
    var _fx = SCP[_fx_fy_al]
    var fx_fy_al = AL_SRC[_fx_fy_al]

    var _fx_fy = SRC[_fx_fy_al]
    var fy_al = AL_SCP[_fx_fy_al]

    IN[_fx_fy_al] = ON[_fx_fy_al] ||
      getTrn(fy_al, _fx_fy) ||
      getIn(_fx_fy,fy_al) ||
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

      setTrn(fy_al,_fx_fy,new_vals)
      setOt(_fx_fy,fy_al,new_vals)
      if (_fx != _fx_fy) setOt(_fx,fx_fy_al,new_vals)
    }
  }
  return new_vals
}

// are any als in _cl active (OT[_al] == true)
function isOn(_fx,fx_fy_cl) {
  var _als = ALS[fx_fy_cl]
  for (var i in _als) {
    for (var _al in _als[i]) {
      var fx_fy = SRC[_al]
      var _fx_fy = FNS[_fx][fx_fy]
      if (_fx_fy) {
        var _nal = NAL[_al]
        var _fx_fy_al = ALS[_fx_fy][_nal]
        if (OT[_fx_fy_al]) return true
      }
    }
  }
  return false
}
function calOn(_fx,_cl,nal) {
  for (var _al in ALS[_cl][nal]) {
    var fx_fy = SRC[_al]
    var _fx_fy = FNS[_fx][fx_fy]
    if (_fx_fy) {
      var _nal = NAL[_al]
      var _fx_fy_al = ALS[_fx_fy][_nal]
      if (OT[_fx_fy_al]) return true
    }
  }
  return false
}
// are all als in _cl on (ON[_al] == true)
function allOn(_fx,fx_fy_cl) {
  var _als = ALS[fx_fy_cl]
  for (var i in _als) {
    for (var _al in _als[i]) {
      var fx_fy = SRC[_al]
      var _fx_fy = FNS[_fx][fx_fy]
      if (_fx_fy) {
        var _nal = NAL[_al]
        var _fx_fy_al = ALS[_fx_fy][_nal]
        if (!ON[_fx_fy_al]) return false
      }
      else return false
    }
  }
  return true
}
function setOn(_fx,fx_fy_cl,_vals) {
  var _als = ALS[fx_fy_cl]
  for (var i in _als) {
    for (var _al in _als[i]) {
      var fx_fy = SRC[_al]
      var _fx_fy = newVfn(_fx,fx_fy)
      var _nal = NAL[_al]
      var _fx_fy_al = ALS[_fx_fy][_nal]
      ON[_fx_fy_al] = true
      _vals[_fx_fy_al] = SEL
    }
  }
}
function setOf(_fx,fx_fy_cl,_vals) {
  var _als = ALS[fx_fy_cl]
  for (var i in _als) {
    for (var _al in _als[i]) {
      var fx_fy = SRC[_al]
      var _fx_fy = FNS[_fx][fx_fy]
      if (_fx_fy) {
        var _nal = NAL[_al]
        var _fx_fy_al = ALS[_fx_fy][_nal]
        ON[_fx_fy_al] = false
        _vals[_fx_fy_al] = SEL
      }
    }
  }
}

function clearSel() {
  SEL_CL = NUL
  DN_CL = NUL
}
function getMsk(_cl,_txt) {
  var nalij = NAL[_cl]
  var nali = nalij[0]
  var nalj = nalij[1]
  var nalk = nali * nalj

  if (!_txt) return
  else if (_txt == '=') {
    var _msk = []
    for (var k = 0; k < nalk; ++k) {
      _msk[k] = {}
      _msk[k][k] = SEL
    }
    return [nalij, _msk]
  }
  else if (_txt == 'T') {
    var _msk = []
    for (var j = 0; j < nalj; ++j) {
      for (var i = 0; i < nali; ++i) {
        var ij = j * nali + i
        var ji = i * nalj + j
        _msk[ji] = {}
        _msk[ji][ij] = SEL
      }
    }
    return [[nalj,nali],_msk]
  }
  else if (_txt == 'F') {
    var _msk = []
    for (var k = 0; k < nalk; ++k) {
      _msk[k] = {}
      _msk[k][k] = SEL
    }
    return [[nalk,1], _msk]
  }
  else if (_txt == 'FI') {
    var _msk = []
    for (var j = 0; j < nalj; ++j) {
      _msk[j] = {}
      for (var i = 0; i < nali; ++i) {
        _msk[j][j * nali + i] = SEL
      }
    }
    return [[1,nalj],_msk]
  }
  else if (_txt == 'FJ') {
    var _msk = []

    for (var i = 0; i < nali; ++i) {
      _msk[i] = {}
      for (var j = 0; j < nalj; ++j) {
        _msk[i][j * nali + i] = SEL
      }
    }
    return [[nali,1],_msk]
  }
  else if (_txt == 'R') {
    var _msk = []
    for (var k = 0; k < nalk; ++k) {
      _msk[k] = {}
      _msk[k][nalk - k - 1] = SEL
    }
    return [nalij,_msk]
  }
  else if (_txt == 'RI') {
    var _msk = []
    for (var j = 0; j < nalj; ++j) {
      for (var i = 0; i < nali; ++i) {
        var k = j * nali + i
        var ks = j * nali + nali - i - 1
        _msk[k] = {}
        _msk[k][ks] = SEL
      }
    }
    return [nalij,_msk]
  }
  else if (_txt == 'RJ') {
    var _msk = []
    for (var j = 0; j < nalj; ++j) {
      for (var i = 0; i < nali; ++i) {
        var k = j * nali + i
        var ks = (nalj - j - 1) * nali + i
        _msk[k] = {}
        _msk[k][ks] = SEL
      }
    }
    return [nalij,_msk]
  }
  else if (_txt.slice(0,2) == 'SI') {
    var nal = parseInt(_txt.slice(3))
    if (nal > 0) {
      var _msk = []
      for (var j = 0; j < nalj; ++j) {
        for (var i = 0; i < nali; ++i) {
          var k = j * nali + i
          for (var s = 0; s < nal; ++s) {
            var ks = k * nal + s
            _msk[ks] = {}
            _msk[ks][k] = {}
          }
        }
      }
      return [[nali * nal, nalj], _msk]
    }
    return
  }
  else if (_txt.slice(0,2) == 'SJ') {
    var nal = parseInt(_txt.slice(3))
    if (nal > 0) {
      var _msk = []
      for (var j = 0; j < nalj; ++j) {
        for (var s = 0; s < nal; ++s) {
          var js = j * nal + s
          for (var i = 0; i < nali; ++i) {
            var k = j * nali + i
            var ks = js * nali + i
            _msk[ks] = {}
            _msk[ks][k] = SEL
          }
        }
      }
      return [[nali, nalj * nal], _msk]
    }
    return
  }
  else if (_txt.slice(0,2) == 'LI') {
    var l = parseInt(_txt.slice(3))
    if (l > 0 && nali % l == 0) {
      var _msk = []
      var m = Math.floor(nali / l)
      var j = nalj
      for (var _j = 0; _j < j; ++_j) {
        for (var _m = 0; _m < m; ++_m) {
          for (var _l = 0; _l < l; ++_l) {
            var k = _l + _m * l + _j * m * l
            var lk = _m + _l * m + _j * m * l
            _msk[k] = {}
            _msk[k][lk] = SEL
          }
        }
      }
      return [[l,m*j],_msk]
    }
    return
  }
  else if (_txt.slice(0,2) == 'LJ') {
    var l = parseInt(_txt.slice(3))


    var j = nalj
    if (l > 0 && j % l == 0) {
      var i = nali
      var m = Math.floor(j / l)
      var _msk = []
      for (var _i = 0; _i < i; ++_i) {
        for (var _l = 0; _l < l; ++_l) {
          for (var _m = 0; _m < m; ++_m) {
            var k = _m + _i * m + _l * m * i
            var lk = _i + _m * i + _l * m * i
            _msk[k] = {}
            _msk[k][lk] = SEL
          }
        }
      }
      return [[m*i,l],_msk]
    }
    return
  }

  var split = _txt.split(',')
  if (split.length == 1) {
    split = _txt.split(':')
    if (split.length == 1) {
      var idx = parseInt(_txt)
      if (0 <= idx && idx < nalk) {
        var _msk = [{}]
        _msk[0][idx] = SEL
        return [[1,1],_msk]
      }
    }
    else if (split.length >= 2) {
      var idx1 = split[0] == '' ? 0 : parseInt(split[0])
      var idx2 = split[1] == '' ? nalk-1 : parseInt(split[1])
      if (0 <= idx1 && idx1 < nalk && 0 <= idx2 && idx2 < nalk) {
        var _msk = []
        if (idx1 <= idx2) {
          for (var k = idx1, i = 0; k <= idx2; ++k, ++i) {
            _msk[i] = {}
            _msk[i][k] = {}
          }
          return [[idx2 - idx1 + 1, 1], _msk]
        }
        else {
          for (var k = idx2, i = 0; k >= idx1; --k, ++i) {
            _msk[i] = {}
            _msk[i][k] = {}
          }
          return [[idx2 - idx1 + 1, 1], _msk]
        }
      }
    }
  }
  else if (split.length >= 2) {
    var idxi = split[0].split(':')
    var idxj = split[1].split(':')
    var idxil = idxi.length
    var idxjl = idxj.length
    var idxi1 = idxi[0] == '' ? 0 : parseInt(idxi[0])
    var idxi2 = idxil == 1 ? idxi1 : idxi[1] == '' ? nali-1 : parseInt(idxi[1])
    var idxj1 = idxj[0] == '' ? 0 : parseInt(idxj[0])
    var idxj2 = idxjl == 1 ? idxj1 : idxj[1] == '' ? nalj-1 : parseInt(idxj[1])

    if (0 <= idxi1 && 0 <= idxi2 && 0 <= idxj1 && 0 <= idxj2 &&
    idxi1 < nali && idxi2 < nali && idxj1 < nalj && idxj2 < nalj) {
      var _nali = Math.abs(idxi1 - idxi2) + 1
      var _nalj = Math.abs(idxj1 - idxj2) + 1
      var _msk = []

      for (var _j = 0; _j < _nalj; ++_j) {
        for (var _i = 0; _i < _nali; ++_i) {
          var _k = _j * _nali + _i
          _msk[_k] = {}
          var i = idxi1 + (idxi1 < idxi2 ? _i : -_i)
          var j = idxj1 + (idxj1 < idxj2 ? _j : -_j)
          var k = j * nali + i
          _msk[_k][k] = SEL
        }
      }

      return [[_nali, _nalj], _msk]
    }
  }
}

function saveAll() {

  var flag = {}

  var scp = {}
  var src = {}
  var nal = {}
  var txt = {}
  var loc = {}
  var ots = {}

  var save = id => {
    if (flag[id]) return
    var typ = OBJS[id]
    flag[id] = true

    switch (typ) {
    case FUN:
      nal[id] = NAL[id]
      txt[id] = TXT[id]
      FU.forEach(CLS[id],save)
      break
    case CFN:
      if (NAL[id][1] > 1)
        nal[id] = NAL[id][1]
    case CEL:
      var fx = SCP[id]
      var fy = SRC[id]
      save(fx)
      save(fy)
      scp[id] = fx
      src[id] = fy
      txt[id] = TXT[id]
      loc[id] = LOC[id]
      if (!FU.isEmpty(OTS[id])) {
        ots[id] = []
        for (var cl in OTS[id]) ots[id].push(cl)
      }
      break
    }
  }

  FU.forEach(FXS,save)

  var o = {fxs:FXS, scp:scp, src:src, nal:nal, txt:txt, loc:loc, ots:ots}
  return JSON.stringify(o,null,' ')
}

function setup(fxs,scp,src,nal,txt,loc,ots) {
  clearAll()

  var new_id = {}
  var read = id => {
    if (new_id[id]) return new_id[id]

    var _scp = scp[id]
    var _src = src[id]
    var _txt = txt[id]

    if (_scp) {
      var new_fx = read(_scp)
      var srij = loc[id]
      var clij = srij_to_clij(srij)
      var new_cl

      if (scp[_src]) {
        var new_cf = read(_src)
        var nalij_msk = getMsk(new_cf,_txt)
        var _nalij = nalij_msk[0]
        var _msk = nalij_msk[1]
        new_cl = newCel(new_cf,_nalij,_msk,clij,_txt)
      }
      else {
        var new_fy = read(_src)
        var _nal = nal[id] || 1
        new_cl = newCfn(new_fx,new_fy,_nal,clij,_txt)
      }
      return new_id[id] = new_cl
    }
    else {
      var _nal = nal[id] || 1
      var new_fx = newFun(_nal)
      TXT[new_fx] = _txt
      return new_id[id] = new_fx
    }
  }
  for (var cl in loc) read(cl)
  for (var _cl in ots) {
    for (var i in ots[_cl])
      newClk(read(_cl),read(ots[_cl][i]))
  }
  for (var txt in fxs) {
    var old_fx = fxs[txt]
    var new_fx = read(old_fx)
    FXS[txt] = new_fx
  }
}
function getRead(o) {
  if (o) {
    try {
      setup(o.fxs, o.scp, o.src, o.nal, o.txt, o.loc, o.ots)
      TRN = FXS['+']
      TRN_AL0 = ALS[TRN][0]
      TRN_AL1 = ALS[TRN][1]
      TRN_AL2 = ALS[TRN][2]
      return
    } catch (e) {
      console.error(e)
    }
  }

  clearAll()
  TRN = newFun(3)
  TXT[TRN] = '+'
  FXS['+'] = TRN
  TRN_AL0 = ALS[TRN][0]
  TRN_AL1 = ALS[TRN][1]
  TRN_AL2 = ALS[TRN][2]

  _FX = newFun(3)
  TXT[_FX] = 'and'
  FXS['and'] = _FX
  SEL_CL = newCfn(_FX,_FX,1,[0,0],'and')
}

TICKS = 0

getRead()
var busBottomRight = PT.vcc('vvvss',(w,_i,i,s,o)=> w - o + s * (_i - i),2)// + s * (_i - i))

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  if (TICKS++ < 10) {
    g.fillStyle = 'white'
    g.fillText('Loading...',20,20)

    return
  }

  CNTR_PT = PT.divs(USR_IO_DSPLY.wh,2)
  ELAPSED_TIME = USR_IO_EVNTS.nw
  var kydn = USR_IO_KYS.hsDn
  var WH = USR_IO_DSPLY.wh

  var mws = USR_IO_MWS
  var clij = msij_to_clij(mws)
  var msij = clij_to_msij(clij)
  var srij = clij_to_srij(clij)

  g.font = 'light 8px Courier New'
  g.fillStyle = mws.isDn ? 'red' : 'white'
  // pt.fillCircle(g, mws, 10)
  pt.fillSquare(g, msij, 10)
  g.fillStyle = 'white'
  g.fillText(srij, 20, 20)

  if (kydn['g']) {
    var fun_name = prompt('Go to Function',PREV_NAME)

    if (fun_name) PREV_NAME = fun_name

    var fx = FXS[fun_name]
    if (fx) {
      _FX = fx
      clearSel()
    }
    else alert(`no function for '${fun_name}'`)
  }
  else if (kydn['n']) {
    var name = prompt('New Function Name:',PREV_NAME)
    if (name) {
      PREV_NAME = name
      if (FXS[name]) alert(`used name: '${name}'`)
      else {
        var nal = parseInt(prompt('Bus size:',PREV_NAL))
        if (nal > 0) {
          PREV_NAL = nal
          var fx = newFun(nal)
          FXS[name] = fx
          TXT[fx] = name
          _FX = fx
          clearSel()
        }
        else alert(`invalid bus size: '${nal}'`)
      }
    }
    else alert('invalid name')
  }
  else if (kydn['s']) {
    var saveTxt = saveAll()
    HOST_MSG('save',[0],saveTxt)
  }
  else if (kydn['r']) {
    HOST_MSG('rqst_update',[0])
  }

  var h = 0
  g.textAlign = 'right'
  g.fillStyle = 'white'
  for (var txt in FXS) {
    g.fillText(txt,WH[0] - 10,h += 20)
  }

  if (!_FX) return

  var fx = SRC[_FX]
  var _cls = CLS[fx]

  if (kydn['q']) {
    clearSel()
    if (mws.isDn) {
      var _cl = _cls[srij]
      if (_cl) rmvCel(_cl)
    }
  }
  else if (kydn['l']) {
    var _cl = _cls[srij]
    if (_cl) {
      for (var _ck in LKS[_cl])
        rmvClk(_ck)
    }
    clearSel()
  }
  else if (kydn[' ']) {
    var _cl = _cls[srij]
    if (_cl) {
      if (allOn(_FX,_cl)) setOf(_FX,_cl,VALS)
      else setOn(_FX,_cl,VALS)
      VALS = doComp(VALS)
    }
  }
  else if (kydn['Enter']) {
    VALS = doComp(VALS)
  }
  else if (kydn['Shift']) {
    clearSel()

    var _cl = _cls[srij]
    if (_cl) {
      var _fns = FNS[_cl]
      if (FU.count(_fns) == 1) {
        var fx_fy = FU.first(_fns)
        var _fx_fy = newVfn(_FX,fx_fy)
        if (_fx_fy) {
          _FX = _fx_fy
          fx = SRC[_FX]
          _cls = CLS[fx]
        }
      }
    }
    else {
      _FX = SCP[_FX]
      fx = SRC[_FX]
      _cls = CLS[fx]
    }
  }
  else if (SEL_CL) {
    var cl = _cls[srij]
    var _srij = LOC[SEL_CL]
    var _clij = srij_to_clij(_srij)
    var _msij = clij_to_msij(_clij)
    g.fillStyle = g.strokeStyle = 'grey'
    if (cl) {
      drawArrowLine(g, _msij, msij, CEL_WDTH, CEL_WDTH)
    }
    else {
      PT.drawLine(g, _msij, msij)
    }
  }

  g.textAlign = 'left'
  g.fillStyle = 'white'
  g.fillText(TXT[fx], 20, 40)
  SEL_CL && g.fillText(`${SEL_CL}   ${NAL[SEL_CL]}`, 20, 60)

  if (_cls[srij]) {
    var _cl = _cls[srij]
    g.fillText(`${_cl}   ${NAL[_cls[srij]]}`, 20, 80)

    var nalij = NAL[_cl]
    var nali = nalij[0]
    var nalj = nalij[1]

    for (var j = 0; j < nalj; ++j) {
      for (var i = 0; i < nali; ++i) {
        g.fillStyle = calOn(_FX,_cl,j * nali + i) ? '#800000' : '#404040'
        PT.fillSquare(g, busBottomRight(WH,[i,j],nalij,10,10), 4)
      }
    }
  }

  g.textAlign = 'center'

  if (mws.hsDn) {
    var _cl = _cls[srij]
    if (_cl) {
      if (SEL_CL) {
        newClk(SEL_CL,_cl)
      }
      SEL_CL = _cl
    }
    else if (SEL_CL) {
      var _txt = prompt('Get indexing instructions:',PREV_IDX)
      var nalij_msk = getMsk(SEL_CL,_txt)
      if (nalij_msk) {
        PREV_IDX = _txt
        var _nalij = nalij_msk[0]
        var _msk = nalij_msk[1]
        SEL_CL = newCel(SEL_CL,_nalij,_msk,clij,_txt)
      }
      else alert(`Invalid index instructions: ${_txt}`)
    }
    else {
      var fun_name = prompt('Get Function Name for Cel', PREV_NAME)
      if (fun_name) PREV_NAME = fun_name
      var fy = FXS[fun_name]

      if (fy) {
        var nal = parseInt(prompt('Get Cel Bus Hight',PREV_NAL))
        if (nal > 0) {
          PREV_NAL = nal
          var fy_nal = NAL[fy]
          var txt = fun_name
          var _cf = newCfn(fx,fy,nal,clij,txt)
          SEL_CL = _cf
        }
        else alert(`invalid bus hight: '${nal}'`)
      }
      else alert(`No function named: '${fun_name}'`)
    }

    DN_CL = _cls[srij]
  }
  if (mws.isDn && DN_CL) {
    var _cl = _cls[srij]
    if (!_cl) {
      var _srij = LOC[DN_CL]
      delete _cls[_srij]
      _cls[srij] = DN_CL
      LOC[DN_CL] = srij
    }
  }
  if (mws.hsUp) {
    DN_CL = NUL
  }

  for (var _srij in _cls) {
    var _cl = _cls[_srij]
    var _txt = TXT[_cl]
    var _clij = srij_to_clij(_srij)
    var _msij = clij_to_msij(_clij)

    g.fillStyle = g.strokeStyle = isOn(_FX,_cl) ? 'red' : 'white'

    for (var _fy_cl in OTS[_cl]) {
      var _fy__srij = LOC[_fy_cl]
      var _fy__clij = srij_to_clij(_fy__srij)
      var _fy__msij = clij_to_msij(_fy__clij)

      // g.fillStyle = g.strokeStyle = 'grey'
      drawArrowLine(g, _msij, _fy__msij, CEL_WDTH, CEL_WDTH)
    }
    for (var _cl2 in CLS[_cl]) {
      var _cl2_srij = LOC[_cl2]
      var _cl2_clij = srij_to_clij(_cl2_srij)
      var _cl2_msij = clij_to_msij(_cl2_clij)

      // g.strokeStyle = 'white'
      PT.drawLine(g, _msij, _cl2_msij)
    }
  }
  for (var _srij in _cls) {
    var _cl = _cls[_srij]
    var _txt = TXT[_cl]
    var _clij = srij_to_clij(_srij)
    var _msij = clij_to_msij(_clij)

    g.fillStyle = isOn(_FX,_cl) ? '#800000' : '#404040'
    PT.fillCircle(g, _msij, CEL_WDTH)

    g.fillStyle = 'white'
    g.fillText(_txt, _msij[0], _msij[1]+3)
  }
}

function unitTest1() {
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
  // prtOBJS()
  var vals = {}
  vals[fx_al] = 1
  vals = doComp(vals)
  log(vals)
  vals = doComp(vals)
  log(vals)
  vals = doComp(vals)
  log(vals)
  // prtOBJS()
}
function unitTest2() {
  var fx = newFun(3)
  var fy = newFun(4)
  var fz = newFun(1)

  var _cfy = newCfn(fx,fy,3,[0,1],'cfy')
  var _cfz = newCfn(fx,fz,1,[1,0],'cfz')

  var _cl1 = newCel(_cfy,[1,2],[{5:1,10:1},{3:1,6:1}],[0,2],'cl1')
  var _cl2 = newCel(_cl1,[1,1],[{0:1,1:1}],[0,3],'cl2')

  newClk(_cfz,_cl2)

  rmvCel(_cfy)
  prtOBJS()
}
