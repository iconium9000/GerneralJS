var fs = require('fs')
var log = console.log

var directory = process.argv[2]

log(`init ${directory}/screens/assemble_scripts.js`)

var games = {
  3000: [
    'menu_3000',
    '05_games/00_menu',
    3000
  ],
  3001: [
    'blockade_3001',
    '05_games/01_blockade',
    3001
  ],
  3005: [
    'knifeline',
    '05_games/05_knifeline',
    3005
  ],
}

function write_file(file_name, txt) {
  fs.writeFileSync(directory + file_name, txt, 'utf8', ()=>{})
}

var bash_start = '#!/bin/bash -e\n'

var clear_all_txt = `${bash_start}#clear_all.sh`
write_file('screen/clear_all.sh', clear_all_txt)
