PROJECT_NAME = 'Graph Theory'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

GAME_MSG = (key, sndr, rcvr, msg) => {

}
GAME_SRVR_INIT = () => {
  log('init game srvr')
}
GAME_CLNT_INIT = () => {
  log('init game clnt')
}

var angle_to_ptij = a => [Math.cos(a),Math.sin(a)]

var n_vrts = 30
var vrts = []
var proj = []
var lnks = []
var kill = []
var len = []
var vrtlks = []
var crxs = []
var lnkcrx = []


function newLnk(i,j) {
  lnks.push(i < j ? [i,j] : [j,i])
  return lnks.length - 1
}
function getCrx(i,j) {
  var i0 = lnks[i][0]
  var i1 = lnks[i][1]
  var j0 = lnks[j][0]
  var j1 = lnks[j][1]

  if (
    (i0 < j0 && j0 < i1 && i1 < j1) ||
    (j0 < i0 && i0 < j1 && j1 < i1)
  ) {
    crxs.push(i < j ? [i,j] : [j,i])
    return crxs.length - 1
  }
  return null
}

FU.forlen(n_vrts, i => vrts.push(angle_to_ptij(i * 2 * π / n_vrts)))
FU.forlen(n_vrts, i => vrtlks.push([]))
FU.forlen(n_vrts, i => FU.forlen(n_vrts, j => vrtlks[i][j] = vrtlks[j][i] || newLnk(i,j)))
FU.forlen(lnks.length, i => {
  var l0 = vrts[lnks[i][0]]
  var l1 = vrts[lnks[i][1]]
  lnkcrx.push([])
  len[i] = PT.length(PT.sub(l0,l1))
})
FU.forlen(lnks.length, i => FU.forlen(lnks.length,
  j => lnkcrx[i][j] = lnkcrx[j][i] == null ? getCrx(i,j) : lnkcrx[j][i]))

var crx_idx = []
FU.forlen(crxs.length, i => crx_idx.push(i))

FU.shuffle(crx_idx)

FU.forlen(crxs.length, i => {
  i = crx_idx[i]
  var l0 = crxs[i][0]
  var l1 = crxs[i][1]

  if (kill[l0] || kill[l1]) return
  kill[Math.random() < 0.5 ? l0 : l1] = true
})

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var cntr = PT.divs(USR_IO_DSPLY.wh,2)

  g.fillStyle = g.strokeStyle = 'white'
  PT.fillCircle(g,cntr,2)

  for (var i = 0; i < n_vrts; ++i) {
    proj[i] = PT.sum(cntr, PT.muls(vrts[i], 300))
    PT.fillCircle(g,proj[i],4)
  }

  for (var i = 0; i < lnks.length; ++i) {
    var lnk = lnks[i]
    if (kill[i]) continue

    var vrt_0 = proj[lnk[0]]
    var vrt_1 = proj[lnk[1]]
    PT.drawLine(g,vrt_0,vrt_1)
  }

}
