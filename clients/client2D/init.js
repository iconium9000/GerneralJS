// index2D init
log('init index2D.init')

module.exports = {
  client: 'client2D',
  port: 2000,
  libs: ['fu', 'pt'],
  project: ['game'],
  modules: [],
  dirs: {
    '/libs': '/libs',
    '/jq': '/node_modules/jquery/dist',
  },

  srvr_init: () => {
    GAME_SRVR_INIT()
  },
  clnt_init: () => {
    GAME_CLNT_INIT()
  },
}
