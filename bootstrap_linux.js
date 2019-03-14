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

projects.forEach(({title, name, proj, port}) => {

  var bash_file = `${__dirname}/projects/${proj}/init.sh`
  shell.exec(`mkdir ${__dirname}/projects/${proj}`)
  shell.exec(`screen -X -S ${name} quit`)

  var project_txt = `${bash_start}\n#${name} init
    echo starting ${name} on port ${port}
    cd ${__dirname}
    node app ${proj} ${port}`

  log('write file', bash_file, project_txt)
  FU.write_file(fs, bash_file, project_txt)
  shell.exec(`chmod +x ${bash_file}`)
  shell.exec(`screen -d -m -S ${name} ${bash_file}`)
  shell.exec(`rm ${bash_file}`)
  shell.exec(`screen -ls`)
})
