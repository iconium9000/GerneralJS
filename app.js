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

try {
  require(`./client/fu.js`)
  require(`./client/pt.js`)
  require(`./projects/${project}/game.js`)
  log(PROJECT_NAME)
} catch (e) {
  log(e)
}

log(port)
log(process.argv)

// process.exit(-1)
