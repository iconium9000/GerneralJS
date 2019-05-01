var fs = require('fs')
var log = console.log
var err = console.error

var shell = require('shelljs')
var child_process = require('child_process')
require('./libs/fu.js')

log(`* init ${__dirname}/assemble_scripts.js`)

// log(process.argv)

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
var project_table = {}
var project_list = []
var phone_home = projects[0].name
var host_name = process.argv[2] || 'http://technofuzz.iconium9000.com'

projects.forEach(({title, name, port},i) => {
  project_list.push({
    title: title,
    name: name,
    port: port,
    usrs: {},
    href: `${host_name}:${port}`
  })
})

// log(project_list)

projects.forEach((project,i) => {
  project_table[project.name] = project
  var fork = [project.proj, project.port, phone_home, host_name]
  project.child = child_process.fork('app.js', fork)
})
projects.forEach((project1) => {
  project1.child.on('message', ([tok, ...msg]) => {
    var project2 = project_table[tok]
    if (project2) {
      project2.child.send([project1.name, ...msg])
    }
  })
})

project_table[phone_home].child.send(['projects'].concat(project_list))
