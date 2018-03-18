log = console.log

PROJECT_NAME = 'Music Project'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playNote(frequency, duration) {
  // create Oscillator node
  var oscillator = audioCtx.createOscillator();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency; // value in hertz
  oscillator.connect(audioCtx.destination);
  oscillator.start();

  setTimeout(()=>oscillator.stop(),duration)
}

var note = []
var active = []
var toggle = []
var point = []
var proj = []

function getToggle(i) {
  return () => {
    var o1 = audioCtx.createOscillator();
    o1.type = 'sine'
    o1.frequency.value = note[i]
    o1.connect(audioCtx.destination)
    o1.start()

    // var o2 = audioCtx.createOscillator();
    // o2.type = 'square'
    // o2.frequency.value = note[i] * 2
    // o2.connect(audioCtx.destination)
    // o2.start()

    active[i] = true

    toggle[i] = () => {
      active[i] = false
      o1.stop()
      // o2.stop()
      toggle[i] = getToggle(i)
    }
  }
}

FU.forlen(12, i => point.push([Math.sin(i * 2 * π / 12),-Math.cos(i * 2 * π / 12)]))
FU.forlen(12, i => note[i] = 220 * Math.pow(2,(i)/12))
FU.forlen(12, i => toggle[i] = getToggle(i))

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  default:
    log(key, sndr, rcvr, msg)
  }
}

GAME_SRVR_INIT = () => {
  log('init game srvr')
}

GAME_CLNT_INIT = () => {
  log('init game clnt')
}

GAME_TICK = () => {
  var g = USR_IO_DSPLY.g
  var cntr = PT.divs(USR_IO_DSPLY.wh,2)
  var mws = USR_IO_MWS

  g.fillStyle = 'white'
  PT.fillCircle(g,cntr,10)

  var rad = 20
  var time = 3e3

  FU.forlen(12, i => proj[i] = PT.sum(cntr, PT.muls(point[i], 100)))
  FU.forlen(12, i => {
    g.fillStyle = active[i] ? 'red' : 'grey'
    PT.fillCircle(g, proj[i], rad)
  })

  if (mws.hsDn) {
    FU.forlen(12, i => PT.length(PT.sub(mws, proj[i])) < rad && toggle[i]())
  }
}
