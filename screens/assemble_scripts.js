var fs = require('fs')
var log = console.log

log(__dirname)


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

function write_file(file_name, obj) {
  fs.writeFileSync(file_name, JSON.stringify(obj), 'utf8', ()=>{})
}

fs.writeFileSync()

log(process.argv)
