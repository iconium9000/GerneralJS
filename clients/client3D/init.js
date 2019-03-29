// index2D init
log('init index3D.init')

module.exports = {
  client: 'client3D',
  port: 2000,
  libs: ['fu', 'pt'],
  // project: ['game'],
  modules: ['three/build/three.min'],
  dirs: {
    '/libs': '/libs',
    '/jq': '/node_modules/jquery/dist',
    '/three': '/node_modules/three/build',
  },

  srvr_init: () => {
    // log(THREE)
    // GAME_SRVR_INIT()
  },
  clnt_init: () => {
    // GAME_CLNT_INIT()
  },
}
