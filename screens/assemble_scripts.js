var fs = require('fs')
var log = console.log
var err = console.error

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
  try {
    fs.writeFileSync(directory + file_name, txt, 'utf8', ()=>{})
    return true
  }
  catch (e) {
    err(e)
    return false
  }
}

var bash_start = '#!/bin/bash -e\n'

var clear_all_txt = `${bash_start}#clear_all.sh\necho init clear_all.sh\n`
var startup_txt = `${bash_start}#startup_txt\necho init startup.sh\n`

for (var port in projects) {
  var project = projects[port]

  var bash_file = `projects/${project.proj}/init.sh`

  var project_txt = `${bash_start}\n#${project.name} init
  echo starting ${project.name} on port ${port}

  cd ${directory}
  node app ${project.proj} ${port}`

  if (write_file(bash_file, project_txt)) {
    clear_all_txt += `{ #try
      screen -X -S ${project.name} quit &&
      echo closed ${project.name} screen
    } || { #catch
      echo ${project.name} screen already closed
    }\n\n`

    startup_txt += `{
      chmod +x ${directory}${bash_file}
      screen -d -m -S ${project.name} ${directory}${bash_file}
    }\n\n`
  }
}

startup_txt += 'screen -ls'

log(`writting clear_all.sh`)
write_file('screens/clear_all.sh', clear_all_txt)
log(`writting startup.sh`)
write_file('screens/startup.sh', startup_txt)
