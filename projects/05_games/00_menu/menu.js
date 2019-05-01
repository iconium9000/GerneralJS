log('init menu.js')

GAME_SRVR_INIT = () => {
  var phone_home = process.argv[4]
  var host_name = process.argv[5]
  var projects = []
  var project_table = {}

  function usr_srvr_io(project, tok, usr_name) {
    if (tok == 'connect') {
      project.usrs[usr_name] = true
    }
    else if (tok == 'disconnect') {
      delete project.usrs[usr_name]
    }

    log('usr_srvr_io', tok, usr_name)
    var clnts = []
    FU.forEach(SRVR_CLNTS, (clnt,id) => clnts.push(id))
    HOST_MSG('Update', clnts, projects)
  }

  if (process.on) {
    process.on('message', ([tok, ...msg]) => {
      if (tok == 'projects') {
        projects = []
        msg.forEach((project) => {
          projects.push(project)
          project_table[project.name] = project
        })
      }
      else {
        var project = project_table[tok]
        log('MENU', tok, ...msg)
        if (project) {
          usr_srvr_io(project, ...msg)
        }
      }
    })
  }

  GAME_MSG = (key, sndr, rcvr, msg) => {
    if (sndr == SRVR_CLNT_ID) {
      return
    }
    if (key == 'Rqst Update') {
      HOST_MSG('Update', [sndr], projects)
    }
  }
}

GAME_CLNT_INIT = () => {
  log('GAME_CLNT_INIT')

  HOST_MSG('Rqst Update', [SRVR_CLNT_ID])
  GAME_MSG = (key, sndr, rcvr, msg) => {
    if (sndr != SRVR_CLNT_ID) {
      return
    }

    if (key == 'Update') {
      var menu = ''
      msg.forEach((project,i) => {
        menu += `<p><a href="${project.href}">${project.title}</a>`
        var count = FU.count(project.usrs)
        if (count > 0) {
          menu += ' * '
          FU.forEach(project.usrs, (bool, name) => {
            menu += name + ' * '
          })
        }
        menu += '</p>\n'
      })
      document.getElementById('menu').innerHTML = menu
    }
  }
}

//

// if (process.on) {
//   // process.on('message', ([tok, ...msg]) => {
//   //   log('MENU', tok, ...msg)
//   // })
// }
