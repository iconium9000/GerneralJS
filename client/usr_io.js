// requires: INDEX_CANVAS
// requires: FU
// requires: PT

log = console.log
log('init io.js')

function USR_IO_KYS() {
  USR_IO_KYS.isDn = USR_IO_KYS.isDn || {}
  USR_IO_KYS.hsDn = {}
  USR_IO_KYS.hsUp = {}
}

function USR_IO_EVNTS() {
  var e = USR_IO_EVNTS
  e.nw = (new Date()).getTime()
  e.dt = e.nw - e.lst
  e.lst = e.nw
  e.tk = e.tk ? e.tk + 1 : 1
}

function USR_IO_DSPLY() {
  var d = USR_IO_DSPLY
  d.cnvs = d.cnvs || INDEX_CANVAS
  d.g = d.g || d.cnvs.getContext('2d')
  d.w = d.cnvs.width = window.innerWidth - 20
  d.h = d.cnvs.height = window.innerHeight - 22
  d.d = [d.w,d.h]
}

USR_IO_MWS = []
function USR_IO_SET_MWS() {
  USR_IO_MWS.hsDn = USR_IO_MWS.hsDrgd = USR_IO_MWS.hsUp = false
  USR_IO_MWS.prv = PT.copy(USR_IO_MWS)
  USR_IO_MWS.prv.isDn = USR_IO_MWS.isDn
}

// non-global functions
{
  function setMouse(e) {
    USR_IO_MWS[0] = e.clientX - 7
    USR_IO_MWS[1] = e.clientY - 7
  }

  $(document).mousemove(e => {
    setMouse(e)
    USR_IO_MWS.hsDrgd = USR_IO_MWS.isDn
    USR_IO_MWS.shftDn = e.shiftKey
  })
  $(document).mousedown(e => {
    setMouse(e)
    USR_IO_MWS.hsDrgd = false
    USR_IO_MWS.isDn = true
    USR_IO_MWS.hsDn = true
    USR_IO_MWS.shftDn = e.shiftKey
  })
  $(document).mouseup(e => {
    setMouse(e)
    USR_IO_MWS.isDn = false
    USR_IO_MWS.hsUp = true
    USR_IO_MWS.shftDn = e.shiftKey
  })

  $(document).keypress(e => {
    var c = FU.etochar(e)
    USR_IO_KYS.isDn[c] = true
    USR_IO_KYS.hsDn[c] = true
    USR_IO_MWS.shftDn = e.shiftKey
  })
  $(document).keyup(e => {
    var c = FU.etochar(e)
    USR_IO_KYS.isDn[c] = false
    USR_IO_KYS.hsUp[c] = true
    USR_IO_MWS.shftDn = e.shiftKey
  })
  document.onkeydown = e => {
    USR_IO_KYS.hsDn[e.key] = true
    USR_IO_MWS.shftDn = e.shiftKey
  }
}
