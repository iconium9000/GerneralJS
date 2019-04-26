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

  srvr_init: () => {},
  clnt_init: () => {},
}
