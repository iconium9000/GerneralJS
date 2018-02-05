log = console.log

PROJECT_NAME = 'Project Redstone'
log('init game.js', PROJECT_NAME)

var CEL_SIZE = 30
var CNTR_PT = []
var msij_to_clij = msij => PT.mat(msij, CNTR_PT, (i,j) => Math.round((i - j) / CEL_SIZE), 2)
var clij_to_msij = clij => PT.mat(clij, CNTR_PT, (i,j) => i * CEL_SIZE + j, 2)
var clij_to_str = clij => `${clij[0]},${clij[1]}`
var str_to_clij = str => PT.mats(string.split(','), 0, parseFloat, 2)

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
    log(key, sndr, rcvr, msg)
  }
}
GAME_SRVR_INIT = () => {
  log('init game srvr')
}
GAME_CLNT_INIT = () => {
  log('init game clnt')


}

/*
  fn
  al
  cl

  f space
    ffn
    fal
    fcl
  p space
    pfn
    pal
  v space
    vfn
    val
*/

ERR_DUPLICATE_NAME = 1
ERR_INVALID_LENGTH = 2
ERR_DUPLICATE_PFN = 3

FFNS = {}

class Ffn {
  constructor(name, bsI) {
    if (FFNS[name]) throw [ERR_DUPLICATE_NAME, name]
    if (bsI < 0) throw [ERR_INVALID_BUS_SIZE, bsI]

    this.name = name
    this.bsI = bsI

    this.fals = []
    this.fcls = {}

    this.pfns = {}
    this.pals = {}

    this.slf_pfn = null
    this.slf_vfn = null

    this.slf_pfns = {}
    this.slf_vfns = {}

    FU.forlen(bsI, bsi => new Fal(this,bsi))
  }
}
class Fal {
  constructor(ffn,bsi) {
    this.scp_ffn = ffn
    this.bsi = bsi
  }
}
class Fcl {
  constructor(ffn, pfn, clij, bsJ) {
    if (pfn.src_ffn == ffn)
      if (ffn.slf_pfn) throw [ERR_DUPLICATE_PFN, pfn]
      else if (bsJ != 1) throw [ERR_INVALID_BUS_SIZE, bsJ]
    if (bsJ < 0) throw [ERR_INVALID_BUS_SIZE, bsJ]

    this.scp_ffn = ffn
    this.src_pfn = pfn
    this.clij = clij
    this.bsJ = bsJ
  }
}

class Pfn {
  constructor() {

  }
}
class Pal {
  constructor() {

  }
}

class Vfn {
  constructor() {

  }
}
class Val {
  constructor() {

  }
}

GAME_TICK = () => {
  CNTR_PT = PT.divs(USR_IO_DSPLY.wh,2)
  var g = USR_IO_DSPLY.g
  var mws = USR_IO_MWS

  g.fillStyle = 'white'
  pt.fillCircle(g, mws, 10)
  pt.fillSquare(g, clij_to_msij(msij_to_clij(mws)), 10)
}
