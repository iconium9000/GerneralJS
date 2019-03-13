log = console.log
err = console.error
function safe(f,a,r) {
  try {
    return f.apply(a)
  }
  catch(e) {
    return r
  }
}

// input: node app <game path> <port>


// setup server
{
  var input_proj = process.argv[2]
  var input_port = parseInt(process.argv[3])
  var default_proj = '00_template'
  var default_port = 2000
  var default_clnt = 'client2D'
  var srvr_proj = `./projects/${input_proj || default_proj}`

  SRVR = {
    proj: srvr_proj,
    default_init: require(`./clients/${default_clnt}/init.js`),
    init: safe(require, [null, `${srvr_proj}/init.js`], null),
  }
  SRVR.ports = [
    input_port,
    SRVR.init && SRVR.init.port,
    SRVR.default_port.port,
    default_port,
  ]




}



// project folder
