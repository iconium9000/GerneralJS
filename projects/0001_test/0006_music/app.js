log = console.log

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

var C = Math.pow(2,1/12)
up_hertz = 440
dn_hertz = 400
var int = 2e2
// setInterval(()=>playNote(up_hertz *= C,int),int)
// setInterval(()=>playNote(dn_hertz /= C,int),int)
//
