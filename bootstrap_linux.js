var fs = require('fs')
var log = console.log
var err = console.error

var shell = require('shelljs')
require('./libs/fu.js')

log(`init ${__dirname}/assemble_scripts.js`)

var projects = [
  {
    title: 'Menu',
    name: 'menu_3000',
    proj: '05_games/00_menu',
    port: 3000,
  },
  {
    title: 'Blockade (hard)',
    name: 'blockade_3001',
    proj: '05_games/01_blockade',
    port: 3001,
  },
  {
    title: 'Tanks',
    name: 'tanks_3003',
    proj: '05_games/03_tanks',
    port: 3003,
  },
  {
    title: 'KnifeLine',
    name: 'knifeline_3005',
    proj: '05_games/05_knifeline',
    port: 3005,
  },
]

var bash_start = '#!/bin/bash -e\n'

function setup_server(project) {

  var title = project.title
  var name = project.name
  var proj = project.proj
  var port = project.port

  var bash_file = `${__dirname}/projects/${proj}/init.sh`
  // shell.exec(`mkdir ${__dirname}/projects/${proj}`)

  log('setup', title)

  log('kill screen session')
  shell.exec(`sudo screen -X -S ${name} quit`)

  var project_txt = `${bash_start}\n#${name} init
    echo starting ${name} on port ${port}
    cd ${__dirname}
    node app ${proj} ${port}`

  log('write file', bash_file)
  FU.write_file(fs, bash_file, project_txt)
  log('enable', bash_file)
  shell.exec(`chmod +x ${bash_file}`)
  log('open screen and start server')
  shell.exec(`sudo screen -d -m -S ${name} ${bash_file}`)
  log('rm', bash_file)
  shell.exec(`rm ${bash_file}`)
  log('check active screen')
  shell.exec(`sudo screen -ls`)
}

projects.forEach(setup_server)
