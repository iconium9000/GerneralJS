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

ARG_PROB = 0.01
NBLOBS = 2e4
BLOCK_SIZE = 2e2
MAX_SIZE = 1e4
ARG_SPEED = 1

ARG_COUNT = 0

var cntr = PT.divs([MAX_SIZE,MAX_SIZE],2)

DIRS = function() {
  var dirs = []
  var dir = []
  for (dir[0] = -1; dir[0] <= 1; ++dir[0])
    for (dir[1] = -1; dir[1] <= 1; ++dir[1])
      dirs.push(PT.copy(dir))
  return dirs
}()

msij_to_srij = msij => `${msij[0] || 0},${msij[1] || 0}`
msij_to_blij = function() {
  var vcc = PT.vcc('vs', (i,z) => Math.floor(i/z), 2)
  return msij => vcc(msij,BLOCK_SIZE)
}()
rand_msij = PT.vcc('', Math.random)

BLKS = {}
ARGS = {}

function setBlobInfo(blob) {
  var blk = BLKS[blob.blij_srij]
  if (blk) delete blk[blob.msij_srij]

  blob.blij = msij_to_blij(blob.msij)
  blob.msij_srij = msij_to_srij(blob.msij)
  blob.blij_srij = msij_to_srij(blob.blij)

  blob.radius = 4

  var blk = BLKS[blob.blij_srij]
  if (!blk) blk = BLKS[blob.blij_srij] = {}
  blk[blob.msij_srij] = blob
}
function newBlob() {
  var blob = {}
  blob.msij = PT.muls(rand_msij(2), MAX_SIZE)
  blob.color = PT.color(PT.cat(rand_msij(3),1))

  setBlobInfo(blob)

  blob.arg = Math.random() < ARG_PROB
  if (blob.arg) {
    blob.arg_idx = ++ARG_COUNT
    ARGS[blob.arg_idx] = blob
    blob.score = 2
  }
  else {
    blob.score = 1
  }
  return blob
}
FU.forlen(NBLOBS, newBlob)
nearest_blob = super_blob => {
  var blij = super_blob.blij
  var msij = super_blob.msij

  var min_dist = Infinity
  var min_blob = null
  DIRS.forEach(d => {
    var blob_blk = BLKS[msij_to_srij(PT.sum(d,blij))]
    FU.forEach(blob_blk, blob => {
      if (blob == super_blob) return

      var dist = PT.dist(blob.msij, msij)
      if (dist < min_dist) {
        min_dist = dist
        min_blob = blob
      }
    })
  })
  return min_blob
}
getVect = super_blob => {
  var blij = super_blob.blij
  var msij = super_blob.msij

  var vect = []

  DIRS.forEach(d => {
    var blob_blk = BLKS[msij_to_srij(PT.sum(d,blij))]
    FU.forEach(blob_blk, blob => {
      if (blob == super_blob) return

      var sub = PT.sub(super_blob.msij,blob.msij)
      var dot = PT.dot(sub,sub)

      var sub_vect = PT.muls(sub, blob.score / dot)
      blob.score > super_blob.score ? PT.sume(vect, sub_vect) : PT.sube(vect, sub_vect)
    })
  })
  return PT.unit(vect)
}

function forEachBlk(vec,f) {
  var min_blk = msij_to_blij(PT.sub(cntr,vec))
  var max_blk = msij_to_blij(PT.sum(cntr,vec))

  var blk = []
  var count = 0
  for (blk[0] = min_blk[0]; blk[0] <= max_blk[0]; ++blk[0]) {
    for (blk[1] = min_blk[1]; blk[1] <= max_blk[1]; ++blk[1]) {
      f(blk,BLKS[msij_to_srij(blk)])
      ++count
    }
  }
  return count
}

var mws_prev = []
TICK = 0
GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var mws = USR_IO_MWS

  var cntr_vec = PT.divs(USR_IO_DSPLY.wh,2)
  var dif = PT.sub(cntr_vec,cntr)
  var speed = ARG_SPEED

  if (mws.isDn) {
    PT.sube(cntr, PT.sub(mws, mws_prev))
  }

  g.fillStyle = 'white'
  g.fillText( msij_to_blij(mws),20,20 )

  FU.forEach(ARGS, blob => {
    var close = nearest_blob(blob)
    if (!close) {
      if (!blob.randy) blob.randy = PT.circle(2 * Math.PI * Math.random())

      PT.sume(blob.msij, PT.muls(blob.randy, speed))
      setBlobInfo(blob)
    }
    else {
      blob.randy = null
      var sub = PT.sub(close.msij,blob.msij)
      var len = PT.length(sub)

      if (len < blob.radius + close.radius) {
        if (blob.score < close.score) {
          close.score += blob.score
          delete BLKS[blob.blij_srij][blob.msij_srij]
          delete ARGS[blob.arg_idx]
        }
        else {
          blob.score += close.score
          delete BLKS[close.blij_srij][close.msij_srij]
          delete ARGS[close.arg_idx]
        }
        newBlob()
      }
      else {
        var vect = getVect(blob)

        PT.sume(blob.msij, PT.muls(vect, speed))
        setBlobInfo(blob)
      }
    }

  })

  cntr = FU.first(ARGS)
  if (cntr) cntr = PT.copy(cntr.msij)
  else cntr = []

  var c = forEachBlk(cntr_vec,(blij,blk) => {
    if (!blk) return
    FU.forEach(blk, blob => PT.fillCircle(g, PT.sum(dif, blob.msij), blob.radius, blob.color))
  })
  g.fillStyle = 'white'
  g.fillText(c, 20, 40)

  PT.set(mws_prev, mws)
}
