log = console.log

var default_port = 2000
var port = parseInt(process.argv[3]) || default_port

var project = process.argv[2] || '0000_template'

var express = require('express')
var app = express()
var serv = require('http').Server(app)
app.get('/', (req, res) => res.sendFile(__dirname + '/client/index.html'))
app.use('/client', express.static(__dirname + '/client'))
app.use('/game', express.static(__dirname + '/projects/' + project))

try {
  serv.listen(port)
} catch (e) {
  serv.listen(port = default_port)
}

var socket_io = require('socket.io')(serv, {})

function HOST_MSG(key, sndr, rcvr, msg) {

}

require(`./client/fu.js`)
require(`./client/pt.js`)

// PROJECT_NAME : name of project
// GAME_MSG(key, sndr, rcvr, msg) : msg frm host -> clnt
// GAME_SRVR_INIT() : set up srvr
require(`./projects/${project}/game.js`)
log('init app.js', PROJECT_NAME, `port:${port}`)

process.openStdin().addListener('data', msg => {
  msg = msg.toString().trim().split(' ')
  GAME_MSG(msg[0], 'HOST', 'GAME', msg)
})

GAME_SRVR_INIT()


socket_io.sockets.on('connection', skt => {
  skt.on('msg', GAME_MSG)
})
// process.exit(-1)
