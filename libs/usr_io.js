/**
@required
  @FU
  @PT
  @INDEX_CANVAS

@USR_IO

  @USR_IO_KYS       function
    @isDn   []
    @hsDn   []
    @hsUp   []

  @USR_IO_EVNTS     function
    @nw
    @dt
    @lst
    @tk

  @USR_IO_DSPLY     function
    @cnvs
    @g
    @w
    @h
    @wh

  @USR_IO_MWS       []
    @prv
      @isDn
    @hsDrgd
    @isDn
    @hsUp
    @hsDn
      @Shift
    @shftDn
    @hsWl
    @wlPt
    @isRt
    @hsRt
    @rtUp
*/

err = console.error
log = console.log
log('init usr_io.js')

function USR_IO_TICK(f) {
  USR_IO_DSPLY()
  try {
    f()
  }
  catch (e) {
    err(e)
  }
  USR_IO_KYS()
  USR_IO_EVNTS()
  USR_IO_SET_MWS()
}

function USR_IO_INIT() {
  USR_IO_MWS = []
  USR_IO_KYS()
  USR_IO_EVNTS()
  USR_IO_SET_MWS()
	USR_IO_DSPLY()
}

function USR_IO_KYS() {
  USR_IO_KYS.isDn = USR_IO_KYS.isDn || {}
  USR_IO_KYS.hsDn = {}
  USR_IO_KYS.hsUp = {}
}

function USR_IO_NOW() {
  return (new Date()).getTime()
}

function USR_IO_EVNTS() {
  var e = USR_IO_EVNTS
  e.nw = USR_IO_NOW()
  e.dt = e.nw - e.lst
  e.lst = e.nw
  e.tk = e.tk ? e.tk + 1 : 1
}

function USR_IO_DSPLY() {
  var d = USR_IO_DSPLY
  d.cnvs = d.cnvs || INDEX_CANVAS
  d.g = d.g || (d.cnvs.getContext && d.cnvs.getContext('2d'))
  d.w = d.cnvs.width = window.innerWidth - 20
  d.h = d.cnvs.height = window.innerHeight - 22
  d.wh = [d.w,d.h]
}

function USR_IO_SET_MWS() {
  USR_IO_MWS.hsDn = USR_IO_MWS.hsDrgd = USR_IO_MWS.hsUp = false
  USR_IO_MWS.prv = PT.copy(USR_IO_MWS)
  USR_IO_MWS.prv.isDn = USR_IO_MWS.isDn
  USR_IO_MWS.rtUp = USR_IO_MWS.hsRt = false
  USR_IO_MWS.hsWl = false
  USR_IO_MWS.wlPt = []
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
    USR_IO_KYS.isDn.Shift = USR_IO_MWS.shftDn = e.shiftKey
  })
  $(document).mousedown(e => {
    setMouse(e)
    USR_IO_MWS.hsDrgd = false
    USR_IO_MWS.isDn = USR_IO_MWS.hsDn = e.button != 2
    USR_IO_MWS.isRt = USR_IO_MWS.hsRt = e.button == 2
    USR_IO_KYS.isDn.Shift = USR_IO_MWS.shftDn = e.shiftKey
  })
  $(document).mouseup(e => {
    setMouse(e)
    USR_IO_MWS.isRt = USR_IO_MWS.isDn = false
    USR_IO_MWS.hsUp = e.button != 2
    USR_IO_MWS.rtUp = e.button == 2
    USR_IO_KYS.isDn.Shift = USR_IO_MWS.shftDn = e.shiftKey
  })
  document.addEventListener('touchstart',e => {
    setMouse(e)
    USR_IO_MWS.hsDrgd = false
    USR_IO_MWS.isDn = true
    USR_IO_MWS.hsDn = true
    USR_IO_KYS.isDn.Shift = USR_IO_MWS.shftDn = e.shiftKey
  }, false)
  document.addEventListener('touchend',e => {
    setMouse(e)
    USR_IO_MWS.isDn = false
    USR_IO_MWS.hsUp = true
    USR_IO_KYS.isDn.Shift = USR_IO_MWS.shftDn = e.shiftKey
  }, false)

  INDEX_CANVAS.addEventListener('mousewheel', e => {
    PT.sume(USR_IO_MWS.wlPt,[e.wheelDeltaX,e.wheelDeltaY])
    USR_IO_MWS.hsWl = true
  }, false);
  INDEX_CANVAS.addEventListener('contextmenu', e => {
    if (e.button == 2) {
      e.preventDefault();
    }
  })

  $(document).keypress(e => {
    var c = FU.etochar(e)
    USR_IO_KYS.isDn[c] = true
    USR_IO_KYS.hsDn[c] = true
    USR_IO_KYS.isDn.Shift = USR_IO_MWS.shftDn = e.shiftKey
  })
  $(document).keyup(e => {
    var c = FU.etochar(e)
    USR_IO_KYS.isDn[c] = false
    USR_IO_KYS.hsUp[c] = true
    USR_IO_KYS.isDn.Shift = USR_IO_MWS.shftDn = e.shiftKey
  })
  document.onkeydown = e => {
    USR_IO_KYS.hsDn[e.key] = true
    USR_IO_KYS.isDn.Shift = USR_IO_MWS.shftDn = e.shiftKey
  }
}
