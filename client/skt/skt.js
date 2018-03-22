log('init skt.js')

CLNT_SKT = io()

var reqFrame = FU.reqFrame()

CLNT = {}
CLNT_ID = null
CLNT_KEY = null
CLNT_NAME = document.cookie.length ?
  document.cookie.split('=')[1] :
  'Johnny Appleseed'
CLNT_NAME = prompt('What is your name?', CLNT_NAME)
FU.setCookie('NAME', CLNT_NAME, 2)

function HOST_MSG(key, rcvr, msg) {
  CLNT_SKT.emit('msg', key, rcvr, msg)
}

CLNT_SKT.on('info', info => {
  if (CLNT_KEY == info.key) return

  CLNT_SKT.emit('info', {name: CLNT_NAME})
  CLNT_KEY = info.key
  CLNT_ID = info.id
  log('info',CLNT_ID,CLNT_NAME,CLNT_KEY)
})
