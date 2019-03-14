var fs = require('fs')
var log = console.log
var err = console.error

var shell = require('shelljs')

log(`init ${__dirname}screens/assemble_scripts.js`)

var projects = {
  3000:{
    name: 'menu_3000',
    proj: '05_games/00_menu'
  },
  3001: {
    name: 'blockade_3001',
    proj: '05_games/01_blockade',
  },
  3005: {
    name: 'knifeline_3005',
    proj: '05_games/05_knifeline',
  },
}

function write_file(file_name, txt) {
  try {
    fs.writeFileSync(__dirname + file_name, txt, 'utf8', ()=>{})
    return true
  }
  catch (e) {
    // err(e)
    return false
  }
}

var bash_start = '#!/bin/bash -e\n'

for (var port in projects) {
  var name = projects[port].name
  var proj = projects[port].proj

  var bash_file = `projects/${proj}/init.sh`
  shell.exec(`mkdir ${__dirname}projects/${proj}`)
  shell.exec(`screen -X -S ${name} quit`)

  var project_txt = `${bash_start}\n#${name} init
    echo starting ${name} on port ${port}
    cd ${__dirname}
    node app ${proj} ${port}`

  write_file(bash_file, project_txt)
  shell.exec(`chmod +x ${__dirname}${bash_file}`)
  shell.exec(`screen -d -m -S ${name} ${__dirname}${bash_file}`)
  shell.exec(`screen -ls`)
}
