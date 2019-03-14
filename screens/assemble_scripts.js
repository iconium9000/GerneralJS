var fs = require('fs')
var log = console.log

var directory = process.argv[2]

log(`init ${directory}screens/assemble_scripts.js`)

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
  fs.writeFileSync(directory + file_name, txt, 'utf8', ()=>{})
}

var bash_start = '#!/bin/bash -e\n'

var clear_all_txt = `${bash_start}#clear_all.sh\necho clear_all.sh\n`
var startup_txt = `${bash_start}#startup_txt\necho startup.sh\n`

for (var port in projects) {
  var project = projects[port]

  clear_all_txt += `\t{ #try
    screen -X -S ${project.name} quit &&
    echo closed ${project.name} screen
  } || { #catch
    echo ${project.name} screen already closed
  }\n\n`
}

write_file('screens/clear_all.sh', clear_all_txt)
