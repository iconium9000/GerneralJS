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
    log('GAME_MSG','default',key, sndr, rcvr, msg)
  }
}
GAME_SRVR_INIT = () => {
  log('init game srvr')
}
GAME_CLNT_INIT = () => {
  log('init game clnt')


}



GAME_TICK = () => {
  CNTR_PT = PT.divs(USR_IO_DSPLY.wh,2)
  var g = USR_IO_DSPLY.g
  var mws = USR_IO_MWS

  g.fillStyle = 'white'
  pt.fillCircle(g, mws, 10)
  pt.fillSquare(g, clij_to_msij(msij_to_clij(mws)), 10)
  g.fillText(clij_to_str(msij_to_clij(mws)), 20, 20)

}
