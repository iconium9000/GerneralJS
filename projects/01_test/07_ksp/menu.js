log('init 01_test/07_ksp menu.js')

PROJECT_NAME = 'ksp'
KSP_PATH = `/home/john/.local/share/Steam/steamapps/\
common/Kerbal\ Space\ Program/GameData`

GAME_SRVR_INIT = () => {

  log('GAME_SRVR_INIT')
  var cp = require('child_process')


  GAME_MSG = (key, sndr, rcvr, ...msg) => {
    // log('GAME_MSG', key, sndr, rcvr, ...msg)
    if (key == 'Rqst Update') {
      // log('do update')
      var parts = null
      var path = 'projects/01_test/07_ksp'
      var child = cp.fork(path + '/fork.js', [KSP_PATH])
      child.on('message', parts => {
        HOST_MSG('Update', [sndr], parts)
      })
    }
  }
}

function GOUP() {
  log('GOTO stack', GOTO.stack)
  var up = GOTO.stack.pop()
  up && setmenu(up)
}
function GOTO(idx) {
  GOTO.stack = GOTO.stack || (GOTO.stack = [])
  GOTO.stack.push(GOTO.array)
  setmenu(GOTO.array[idx])
}
function setmenu(array) {

  var menu = `<p><a href="javascript:GOUP()">${array[0]}</a></p>`
  //   <a href="javascript:GOTO(0)">link0</a>
  // `

  for (var i = 1; i < array.length; ++i) {
    var sub = array[i]
    if (typeof sub == 'string') {
      menu += `<p>${sub}</p>`
    }
    else if (sub) {
      menu += `<p><a href="javascript:GOTO(${i})">${sub[0]}</a> `
      if (sub.length == 2) {
        menu += sub[1]
      }
      else {

      }

      menu += `</p>`
    }
  }
  GOTO.array = array
  document.getElementById('menu').innerHTML = menu
}

function cleanup(array) {
  if (typeof array == 'object') {
    if (array.length == 1) {
      return cleanup(array[0])
    }
    else {
      var a = []
      for (var i in array) {
        a.push(cleanup(array[i]))
      }
      return a
    }
  }
  else {
    return array
  }
}

function push(obj, tok, val) {
  if (obj[tok]) {
    if (obj[tok].__flag) {
      obj[tok].push(val)
    }
    else {
      obj[tok] = [obj[tok], val]
      obj[tok].__flag = true
    }
  }
  else {
    obj[tok] = val
  }
}

GAME_CLNT_INIT = () => {
  log('GAME_CLNT_INIT')



  GAME_MSG = (key, sndr, rcvr, ...msg) => {
    // log('GAME_MSG', key, sndr, rcvr, ...msg)

    if (key == 'Update') {
      PARTS = msg[0]
      // for (var i = 0; i < PARTS.length; ++i) {
      //   if (PARTS[i] && PARTS[i][0] != 'PART') {
      //     delete PARTS[i--]
      //   }
      // }
      // PARTS = ['PARTS'].concat(PARTS)

      CATS = {}
      for (var i in PARTS) {
        var part = PARTS[i]

        push(CATS, part.category, part)
      }

      // setmenu(PARTS)
      log(CATS)
    }
  }

  GAME_TICK = () => {}

  HOST_MSG('Rqst Update', [SRVR_CLNT_ID])
}
