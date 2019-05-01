// index2D init
log('init clientMenu.init')

module.exports = {
  client: 'clientMenu',
  port: 2000,
  libs: ['fu'],
  project: ['menu'],
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
