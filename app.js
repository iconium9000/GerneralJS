// input: node app <game path> <port>

log = console.log
err = console.error

/**
  This server is a modular method for enabling communicatoin between
    a server and several clients

  Within the structure of the GeneralJS architecture are 4 primary directories
    @root
      contains other directories
      contains node.js server information
      contains git setup
      contains README
    @clients
      store client information for use by a variaty of projects
      contains folders (of any name) which MUST include
        @index  index.html    the html file sent each of the clients
        @init   init.js       the init file read by the server
    @libs

    @projects


*/
//

(function() {

  log('init app')

  // init
  {
    require('./libs/fu.js')
  }

  // setup server
  {
    var input_proj = process.argv[2]
    var input_port = process.argv[3]
    var default_proj = '00_template'
    var default_port = 2000
    var default_clnt = 'client2D'
    PROJ_PATH = `projects/${input_proj || default_proj}/`
    var srvr_proj = `/${PROJ_PATH}`

    var default_init = require('./clients/' + default_clnt + `/init.js`)
    var proj_init = FU.safe(() => require(`.${srvr_proj}init.js`), null)

    var proj_clnt = proj_init && proj_init.client
    CLNT_PATH = `clients/${proj_clnt || default_clnt}`
    var clnt_path = `/${CLNT_PATH}`
    var clnt_init = FU.safe(() => require(`.${clnt_path}/init.js`), null)


    var ports = [
      input_port,
      proj_init && proj_init.port,
      clnt_init && clnt_init.port,
      default_init.port,
      default_port,
    ]
    // express/socket setup
    {
      var express = require('express')
      var app = express()
      var http = require('http')
      var serv = http.Server(app)


      var index_path = __dirname + clnt_path + '/index.html'
      app.get('/', (req, res) => res.sendFile(index_path))
      app.use('/client', express.static(__dirname + clnt_path))
      app.use('/project', express.static(__dirname + srvr_proj))

      function add_dir(clnt_dir, srvr_dir) {
        app.use(clnt_dir, express.static(__dirname + srvr_dir))
      }

      var port = null
      for (var i in ports) {
        try {
          serv.listen(port = parseInt(ports[i]))
          break
        }
        catch (e) {
          continue
        }
      }

      log(`listening on port ${port}`)

      var socket_io = require('socket.io')(serv, {})
      socket_io.on('connection', on_connection)
    }

    function on_connection(clnt_skt) {
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
        SRVR_IO_DISCONNECT(clnt)

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

        SRVR_IO_CONNECTION(clnt)
      })

      clnt_skt.emit('info',{ id:clnt_id, key:clnt_key })
    }

    function do_imports(init, dirs) {
      if (init) {
        for (var dir_name in init.dirs) {
          log('dir_name', dir_name)
          if (dirs[dir_name]) {
            continue
          }
          else {
            dirs[dir_name] = true
            add_dir(dir_name, init.dirs[dir_name])
          }
        }

        var imports = {
          libs: {},
          project: {},
          modules: {},
        }
        for (var i in init.libs) {
          var lib_name = init.libs[i]
          imports.libs[lib_name] = require(`./libs/${lib_name}.js`)
        }
        for (var i in init.project) {
          var lib_name = init.project[i]
          imports.project[lib_name] = require(`.${srvr_proj}/${lib_name}.js`)
        }
        for (var i in init.modules) {
          var lib_name = init.modules[i]
          imports.modules[lib_name] = require(`./node_modules/${lib_name}.js`)
        }
        return imports
      }
    }

  }

  // srvr/clnt io setup
  {
    require('./libs/srvr_io.js')

    // collect imports
    var dirs = {}
    var proj_imports = do_imports(proj_init, dirs)
    var clnt_imports = do_imports(clnt_init, dirs)
    if (!proj_imports && !clnt_imports) {
      var default_imports = do_imports(default_init, dirs)
    }
    var proj_imports = do_imports(proj_init)

    process.on('SIGINT', () => {
      ON_SRVR_KILL()
      log('Killing server...')
      process.exit()
    })

    if (proj_init && proj_init.srvr_init) {
      proj_init.srvr_init()
    }
    else if (clnt_init && clnt_init.srvr_init) {
      clnt_init.srvr_init()
    }
    else if (default_clnt && default_clnt.srvr_init) {
      default_clnt.srvr_init()
    }
    else {
      throw `srvr_init not found in proj_init, clnt_init, or default_init`
    }
  }

  // project folder


  return 'Started Server Successfully!'
}());
