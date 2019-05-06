fs = require('fs');
log = console.log
var path = process.argv[2]

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}


var files = {}
function do_split(array) {
  var prev = ''
  var obj = {}
  for (var i in array) {
    var txt = array[i]
    if (typeof txt == 'string') {
      var idx = txt.indexOf('=')
      if (idx > -1) {
        var tok = txt.slice(0,idx).replace(/ /g, '')
        var val = txt.slice(idx+1).replace(/ /g, '')
        obj[tok] = val
      }
      else {
        prev = txt
      }
    }
    else {
      // log(prev)
      obj[prev] = do_split(txt)
      prev = ''
    }
  }
  return obj
}
function readcfg(name) {
  var file = []
  var txt = bin2String(fs.readFileSync(name))

  // remove comments
  while ((idx = txt.indexOf('//')) > -1) {
    var i = idx
    while (i < txt.length && txt[i] != '\n') ++i
    txt = txt.slice(0,idx) + txt.slice(i)
  }


  // split
  var pword = ''
  var word = ''
  var yol = {}
  var stack = []
  for (var i in txt) {
    var c = txt[c]

    if (c == '{') {

    }
  }

  // split brkts
  // var pword = ''
  // var word = ''
  // var yol = []
  // var stack = []
  // for (var i = 0; i < txt.length; ++i) {
  //   var c = txt[i]
  //   if (c == '{') {
  //     word && yol.push(word)
  //     word = ''
  //     yol.length && stack.push(yol)
  //     yol = []
  //   }
  //   else if (c == '}') {
  //     word && yol.push(word)
  //     word = ''
  //     tyol = stack.pop()
  //     yol.length && tyol.push(yol)
  //     yol = tyol
  //   }
  //   else if (c == '\n') {
  //     word && yol.push(word)
  //     word = ''
  //   }
  //   else if (c != '\t' && c != '\r') {
  //     word += c
  //   }
  // }
  // word && yol.push(word)
  // word = ''
  log(yol)
}

function readdir(name) {
  fs.readdir(name, function (err, files) {
    if (err) {
      var ext = name.split('.').pop()
      if (ext == 'cfg') {
        readcfg(name)
      }
    }
    else {
      files.forEach(sub_name => readdir(name + '/' + sub_name))
    }
  });
}

readdir(path)
