var fs = require('fs')
var log = console.log
var err = console.error

var shell = require('shelljs')
var child_process = require('child_process')
require('./libs/fu.js')

log(`* init ${__dirname}/assemble_scripts.js`)

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
var mu = projects[0].name

projects.forEach((project,i) => {
  project_table[project.name] = project
  project.child = child_process.fork('app.js', [project.proj, project.port, mu])
})
projects.forEach((project1) => {
  project1.child.on('message', (tok, ...msg) => {
    var project2 = project_table[tok]
    if (!project2) {
      return
    }
    project2.child.send('message', [project1.name, ...msg])
  })
})
