log = console.log

PROJECT_NAME = 'Galcon'
GAME_HIDE_CURSER = false
log('init game.js', PROJECT_NAME)

// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------

GAME_SRVR_INIT = () => {
  log('init game srvr')
}

GAME_CLNT_INIT = () => {
  log('init game clnt')
}


var reps = 1e2
var correct_answer = 0.25
var knows_correct_answer = 0.6
var questions = 4
var scores = 0
for (var i = 0; i < reps; ++i) {
  for (var j = 0; j < questions; ++j) {
    var r = Math.random()
    if (r < knows_correct_answer) {
      scores += 1
    }
    else {
      r = Math.floor((r - knows_correct_answer) / (1 - knows_correct_answer))
      if (r < correct_answer) scores += 1
    }
  }
  log(scores/i)
}
log(100 * scores / reps)

// -----------------------------------------------------------------------------
// GAME
// -----------------------------------------------------------------------------



// -----------------------------------------------------------------------------
// TICK
// -----------------------------------------------------------------------------

GAME_TICK = () => {

}

// -----------------------------------------------------------------------------
// IO
// -----------------------------------------------------------------------------

GAME_MSG = (key, sndr, rcvr, msg) => {
  switch (key) {
  default:
    log(key, sndr, rcvr, msg)
  }
}
