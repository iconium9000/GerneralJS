log = console.log
err = console.error
SRVR_CLNT_ID = 0

var default_port = 2000
var port = parseInt(process.argv[3]) || default_port
var project = process.argv[2] || '0000_template'

var flags = {}
for (var i = 3; i < process.argv.length; ++i) {
  var txt = process.argv[i]
  flags[txt] = flags[txt] || 0
  ++flags[txt]
}

var do_socket = !flags['nosock']
var fake_client = flags['fake_client']
location = null

log('do', do_socket ? 'skt' : 'no_skt')

if (fake_client) {
  var express = require('express')
  var app = express()
  var serv = require('http').Server(app)
  var fake_dirname = __dirname + '/client/fake_client/'
  app.get('/',(req, res) => res.sendFile(fake_dirname + 'index.html'))

  try {
    serv.listen(port)
  } catch (e) {
    serv.listen(port = default_port)
  }
}
else {
  var express = require('express')
  var app = express()
  var serv = require('http').Server(app)
  app.get('/', (req, res) => res.sendFile(__dirname + '/client/index.html'))
  app.use('/client', express.static(__dirname + '/client'))
  do_socket || app.use('/skt', express.static(__dirname + '/client/no_skt'))
  app.use('/game', express.static(__dirname + '/projects/' + project))

  PROJ_PATH = `projects/${project}/`
  CLNT_PATH = `client/`

  require(`./client/fu.js`)
  require(`./client/pt.js`)
  var fs = FS = require('fs')

  try {
    serv.listen(port)
  } catch (e) {
    serv.listen(port = default_port)
  }

  var socket_io = require('socket.io')(serv, {})

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
  log('info',CLNT_ID,CLNT_NAME,CLNT_KEY)

  var SRVR_MSG = (key,sndr,rcvr,msg) => {
    // log('SRVR_MSG', key, sndr, rcvr, msg)
    // log(SRVR_CLNTS)

    // log(rcvr)

    var snd = srvr_clnt => {
      // log('snd_msg',srvr_clnt)
      if (!srvr_clnt) return
      else if (srvr_clnt.skt) srvr_clnt.skt.emit('msg',key,sndr,rcvr,msg)
      else GAME_MSG(key,sndr,rcvr,msg)
    }
    if (rcvr) FU.forEach(rcvr, id => snd(SRVR_CLNTS[id]))
    else FU.forEach(SRVR_CLNTS, snd)
  }
  HOST_MSG = (key, rcvr, msg) => SRVR_MSG(key,CLNT_ID,rcvr,msg)

  // PROJECT_NAME : name of project
  // GAME_MSG(key, sndr, rcvr, msg) : msg frm host -> clnt
  // GAME_SRVR_INIT() : set up srvr
  require(`./projects/${project}/game.js`)
  log('init app.js', PROJECT_NAME, `port:${port}`)

  process.openStdin().addListener('data', msg => {
    log('datastrema',msg)
    msg = msg.toString().trim().split(' ')
    GAME_MSG(msg[0], CLNT_ID, [0], msg)
  })

  SRVR_WRITE_FILE_CALLBACK = ()=>{}
  SRVR_WRITE_FILE = (file_name,obj) => fs.writeFileSync(PROJ_PATH+file_name,
    JSON.stringify(obj), 'utf8',SRVR_WRITE_FILE_CALLBACK)
  SRVR_READ_FILE = file_name => JSON.parse(fs.readFileSync(PROJ_PATH+file_name))
  ON_SRVR_KILL = ()=>{}
  GAME_SRVR_INIT()
  process.on('SIGINT', () => {
    ON_SRVR_KILL()
    log('Killing server...')
    process.exit()
  })

  socket_io.on('connection', clnt_skt => {
    var clnt_id = ++SRVR_CLNT_IDX
    var clnt_key = clnt_skt.id
    var clnt_name = null
    var clnt = SRVR_CLNTS[clnt_id] = {
      id: clnt_id,
      key: clnt_key,
      name: clnt_name,
      skt: clnt_skt
    }

    log('connection', clnt_id, clnt_key)

    clnt_skt.on('disconnect', msg => {
      delete SRVR_CLNTS[clnt_id]
      log('disconnect', clnt_id, clnt_name, clnt_skt.id)
    })
    clnt_skt.on('msg', (key,rcvr,msg) => {
      try {
        SRVR_MSG(key,clnt_id,rcvr,msg)
      }
      catch (e) {
        err(e)
      }
    })
    clnt_skt.on('info', info => {
      if (clnt_name == info.name) return

      clnt_skt.emit('info',{ id:clnt_id, key:clnt_key })
      clnt.name = clnt_name = info.name
      log('info',clnt_id,clnt_name,clnt_key)
    })

    clnt_skt.emit('info',{ id:clnt_id, key:clnt_key })
  })
  // process.exit(-1)
}
