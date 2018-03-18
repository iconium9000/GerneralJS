log = console.log

PROJECT_NAME = 'Agar.io Project'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)
GAME_MSG = (key, sndr, rcvr, msg) => {}
GAME_SRVR_INIT = () => {
  log('init game srvr')
}
GAME_CLNT_INIT = () => {
  log('init game clnt')
}


LINES = []
prev = null
GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var mws = USR_IO_MWS

  var cntr_vec = PT.divs(USR_IO_DSPLY.wh,2)

  if (mws.hsDn) {
    if (prev == null) {
      prev = PT.copy(mws)
    }
    else {
      var l = {}
      l.a = PT.copy(mws)
      l.b = prev
      LINES.push(l)
      prev = null
    }
  }



  g.strokeStyle = 'white'
  prev && PT.drawCircle(g,prev,30)
  prev && PT.drawLine(g,prev,mws)
  LINES.forEach(l => PT.drawLine(g,l.a,l.b))

}
