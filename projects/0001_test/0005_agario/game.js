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

var cntr = []

NBLOBS = 1e3
BLOCK_SIZE = 1e2
MAX_SIZE = 1e3

DIRS = [[0,0],[1,0],[-1,0],[0,1],[0,-1]]

msij_to_srij = msij => `${msij[0] || 0},${msij[1] || 0}`
msij_to_blij = function() {
  var vcc = PT.vcc('vs', (i,z) => Math.floor(i/z), 2)
  return msij => vcc(msij,BLOCK_SIZE)
}()
rand_msij = PT.vcc('', Math.random)

BLOB_BLKS = {}

function newBlob() {
  var blob = {}
  blob.msij = PT.muls(rand_msij(2), MAX_SIZE)
  blob.blij = msij_to_blij(blob.msij)
  blob.msij_srij = msij_to_srij(blob.msij)
  blob.blij_srij = msij_to_srij(blob.blij)
  blob.color = PT.color(PT.cat(rand_msij(3),1))

  var blk = BLOB_BLKS[blob.blij_srij]
  if (!blk) blk = BLOB_BLKS[blob.blij_srij] = {}
  blk[blob.msij_srij] = blob

  return blob
}
FU.forlen(NBLOBS, newBlob)
nearest_blob = (msij,blij) => {
  if (!blij) blij = msij_to_blij(msij)

  var min_dist = Infinity
  var min_blob = null
  DIRS.forEach(d => {
    var blob_blk = BLOB_BLKS[msij_to_srij(PT.sum(d,blij))]
    FU.forEach(blob_blk, blob => {
      var dist = PT.dist(blob.msij, msij)
      if (dist < min_dist) {
        min_dist = dist
        min_blob = blob
      }
    })
  })
  return min_blob
}

function forEachBlk(vec,f) {
  var min_blk = msij_to_blij(PT.sub(cntr,vec))
  var max_blk = msij_to_blij(PT.sum(cntr,vec))

  var blk = []
  for (blk[0] = min_blk[0]; blk[0] <= max_blk[0]; ++blk[0]) {
    for (blk[1] = min_blk[1]; blk[1] <= max_blk[1]; ++blk[1]) {
      f(blk,BLOB_BLKS[msij_to_srij(blk)])
    }
  }
}

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var mws = USR_IO_MWS

  var cntr_vec = PT.divs(USR_IO_DSPLY.wh,2)
  var dif = PT.sub(cntr_vec,cntr)

  g.fillStyle = 'white'
  g.fillText( msij_to_blij(mws),20,20 )

  forEachBlk(cntr_vec,(blij,blk) => {
    PT.fillCircle(g, PT.sum(dif,PT.muls(blij,BLOCK_SIZE)), 4)
    if (!blk) return
    FU.forEach(blk, blob => PT.fillCircle(g, PT.sum(dif, blob.msij), 4, blob.color))
  })

}
