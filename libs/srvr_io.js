log(`init srvr_io.js`)

__init_srvr_io()

function __init_srvr_io() {

  try {
    if (module) {
      try {
        init_srvr()
      }
      catch (e) {
        err(e)
      }
    }
  }
  catch (e) {
    init_clnt()
  }

  function init_clnt() {
    SRVR_CLNT_ID = 0
    CLNT_SKT = io()
    CLNT = {}
    CLNT_ID = null
    CLNT_KEY = null
    CLNT_NAME = FU.silly_name()

    HOST_MSG = (key, rcvr, msg) => {
      CLNT_SKT.emit('msg', key, rcvr, msg)
    }

    CLNT_SKT.on('info', info => {
      if (CLNT_KEY == info.key) return

      CLNT_SKT.emit('info', {name: CLNT_NAME})
      CLNT_KEY = info.key
      CLNT_ID = info.id
      log('info',CLNT_ID,CLNT_NAME,CLNT_KEY)
    })

    CLNT_SKT && CLNT_SKT.on('msg', (key, sndr, rcvr, msg) => {
      GAME_MSG(key, sndr, rcvr, msg)
    })

    CLNT_SKT && CLNT_SKT.emit('info', {name: CLNT_NAME})
  }

  function init_srvr() {
    SRVR_CLNT_ID = 0

    SRVR_CLNTS = {}
    SRVR_CLNTS = {}
    SRVR_CLNT_IDX = SRVR_CLNT_ID

    CLNT_NAME = 'SRVR'
    CLNT_ID = SRVR_CLNT_IDX
    CLNT_KEY = CLNT_NAME
    CLNT_SKT = null
    CLNT = {
      id: CLNT_ID,
      key: CLNT_KEY,
      skt: CLNT_SKT,
      name: CLNT_NAME
    }
    SRVR_CLNTS[CLNT_ID] = CLNT

    var fs = require('fs')

    SRVR_MSG = (key,sndr,rcvr,msg) => {
      var snd = srvr_clnt => {
        if (!srvr_clnt) return
        else if (srvr_clnt.skt) srvr_clnt.skt.emit('msg',key,sndr,rcvr,msg)
        else GAME_MSG(key,sndr,rcvr,msg)
      }
      if (rcvr) FU.forEach(rcvr, id => snd(SRVR_CLNTS[id]))
      else FU.forEach(SRVR_CLNTS, snd)
    }
    HOST_MSG = (key, rcvr, msg) => SRVR_MSG(key,CLNT_ID,rcvr,msg)

    function rcv_console_input(msg) {
      log('datastrema',msg)
      msg = msg.toString().trim().split(' ')
      GAME_MSG(msg[0], CLNT_ID, [0], msg)
    }
    process.openStdin().addListener('data', rcv_console_input)

    SRVR_WRITE_FILE_CALLBACK = ()=>{}
    SRVR_WRITE_FILE = (file_name,obj) => fs.writeFileSync(
      PROJ_PATH + file_name, JSON.stringify(obj),
      'utf8', SRVR_WRITE_FILE_CALLBACK)
    SRVR_READ_FILE = file_name =>
      JSON.parse(fs.readFileSync(PROJ_PATH + file_name))
    ON_SRVR_KILL = ()=>{}
  }
}
