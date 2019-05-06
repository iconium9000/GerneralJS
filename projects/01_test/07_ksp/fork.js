log = console.log
fs = require('fs')

var parts = {}

function push(obj, tok, val) {
  if (obj[tok]) {
    if (obj[tok].__flag) {
      obj[tok].push(val)
    }
    else {
      obj[tok] = [obj[tok], val]
      obj[tok].__flag = true
    }
  }
  else {
    obj[tok] = val
  }
}

function readdir(name) {
  var data = null, err = false
  try {
    data = fs.readdirSync(name)
  }
  catch (e) {
    err = true
  }

  if (err) {
    if (name.split('.').pop() == 'cfg') {
      var bin = fs.readFileSync(name)

      var pword = ''
      var word = ''
      var yol = {}
      var stack = []

      var split = () => {
        word = word.replace(/ /g, '')
        if (!word.length) {
          return
        }

        var idx = word.indexOf('=')
        if (idx < 0) {
          pword = word.replace(/ï»¿/g, '')
        }
        else {
          var tok = word.slice(0,idx)
          var val = word.slice(idx+1)
          push(yol, tok, val)
        }
        word = ''
      }

      var txt = ''
      for (var i in bin) {
        txt += String.fromCharCode(bin[i])
      }

      while ((idx = txt.indexOf('//')) > -1) {
        var nidx = txt.slice(idx).indexOf('\n')
        nidx = nidx < 0 ? txt.length : idx + nidx
        txt = txt.slice(0,idx) + txt.slice(nidx)
      }

      for (var i in txt) {
        var c = txt[i]

        if (c == '{') {
          split()
          stack.push(yol, pword)
          yol = {}
        }
        else if (c == '}') {
          split()
          tok = stack.pop()
          tyol = stack.pop()
          if (yol.name && tok != 'PART') {
            push(tyol, yol.name, yol)
          }
          else {
            push(tyol, tok, yol)
          }
          yol = tyol
        }
        else if (c == '\n' || c == '\t' || c == '\r') {
          split()
        }
        else {
          word += c
        }
      }
      split()

      log(yol)
      if (yol.PART) {
        push(parts, yol.PART.name, yol.PART)
      }
      else if (yol.name) {
        push(parts, yol.name, yol)
      }
      else if (!yol.Localization){
        push(parts, 'unnamed', yol)
      }
    }
  }
  else {
    data.forEach((sub_name) => readdir(name + '/' + sub_name))
  }
}
readdir(process.argv[2])

process.send(parts)
