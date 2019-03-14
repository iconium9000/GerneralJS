log = console.log
err = console.error
log('init fu.js')

fu = FU = new Object

FU.reqFrame = () => window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  ((callback) => window.setTimeout(callback, 30))

FU.setCookie = (cname, cvalue, exdays) => {
  var d = new Date()
  d.setTime(d.getTime() + (exdays*24*60*60*1000))
  document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`
}
FU.safe = (f,r) => {
  try {
    return f()
  }
  catch(e) {
    err(e)
    return r
  }
}

FU.write_file = (fs, file_name, txt) => {
  try {
    fs.writeFileSync(file_name, txt, 'utf8', ()=>{})
    return true
  }
  catch (e) {
    // err(e)
    return false
  }
}

FU.now = () => (new Date()).getTime()
FU.error = (experimental_value, accepted_value) =>
  Math.abs((experimental_value - accepted_value) / accepted_value)
FU.round_over = (value, base, period) => {
  var base_floor = period * Math.floor(base / period)
  var value_floor = period * Math.floor(value / period)
  var base_offset = base - base_floor
  var value_offset = value - value_floor
  if (value_offset < base_offset) {
    value_offset += period
  }
  return value_offset + base_floor
}
FU.period_dist = (value1, value2, period) => {
  var v12 = value1 - value2
  return Math.abs(v12 - period * Math.floor(v12 / period + 0.5))
}

FU.silly_name = () => {
  var silly_name = document.cookie.length ?
    document.cookie.split('=')[1] : 'Wisely'

  var wisely_idx = 0
  var wisely_txt = [
  	[`Choose a name for the game.
  Choose wisely, as it can't be changed later.`,`Wisely`],
  	[`Ha-ha. Very funny`],
  	[`Please Choose a name for the game.
  Choose wisely, as it can't be changed later.`,`Changed Later`,],
  	[`It can't be changed later.
  Please type another name.`,`Another Name`,],
  	[`I'm getting sick of you.`]
  ]
  while (true) {

  	var ary = wisely_txt[wisely_idx % wisely_txt.length]
  	var txt = ary[0]


  	if (ary.length == 1) {
  		alert(txt)
  		++wisely_idx
  		continue
  	}

  	var name = ary[1]

  	silly_name = prompt(txt, silly_name || name)
  	if (!silly_name) continue


  	if (silly_name.toLowerCase() == name.toLowerCase()) {
  		++wisely_idx
  		silly_name = null
  	}
  	else break
  }

  FU.setCookie('NAME', silly_name, 2)

  return silly_name
}

FU.sqr = x => x*x
FU.cub = x => x*x*x
FU.mod = (x,y) => x < 0 ? y + (x%y) : x%y
FU.flr = (x,y) => y * Math.floor(x / y)
FU.rand = (min,max) => (max-min) * Math.random() + min
FU.prand = ([min,max]) => (max-min) * Math.random() + min
FU.max_length = ary_ary => {
  var max = 0
  for (var i in ary_ary) {
    var len = ary_ary[i].length
    if (len > max) max = len
  }
  return max
}
FU.trueif = (l,f) => {
  for (var i = 0; i < l; ++i) if (f(i,l)) return true
  return false
}
FU.findif = (a,o) => {
  for (var i in a) if (a[i] == o) return true
  return false
}
FU.etochar = e => String.fromCharCode(e.which | 0x20)
FU.first = o => {
  for (var i in o) return o[i]
}
FU.isEmpty = o => {
  for (var i in o) return false
  return true
}
FU.count = o => {
  var c = 0
  for (var i in o) ++c
  return c
}
FU.lookup = (a,o) => {
  for (var i in a) if (a[i] == o) return i
  return null
}
FU.forlen = (l,f) => {
  for (var i = 0; i < l; ++i) {
    f(i,l)
  }
}
FU.forEach = (l,f) => {
  var p = {}
  for (var i in l) p[i] = f(l[i],i,l)
  return p
}
FU.rand_char = () => {

}
FU.cat = (a,b) => {
  var c = {}
  for (var i in a) c[i] = a[i]
  for (var i in b) c[i] = b[i]
  return c
}
FU.cmb = (a,b) => {
  for (var i in b) c[i] = b[i]
  return a
}
FU.shuffle = a => {
  var j, t, i
  for (i = a.length - 1; i > 0; --i) {
    j = Math.floor(Math.random() * (i + 1))
    t = a[i]
    a[i] = a[j]
    a[j] = t
  }
}

FU.hexFF = c => {
  c = c > 1 ? 1 : c < 0 ? 0 : c
  c = Math.floor(c * 255).toString(16)
  return ('0' + c).slice(-2)
}

FU.clamp = c => c > 1 ? 1 : c < 0 ? 0 : c

/**
  @param  Number  i     number in set from [0, 1]
*/
FU.color = i => {
  var h = i * 5
  var r = Math.abs(h - 3) - 1
  var g = 2 - Math.abs(h - 2)
  var b = 2 - Math.abs(h - 4)
  return [r,g,b,1]
}

// -----------------------------------------------------------------------------
// https://gist.github.com/mjackson/5311256
// -----------------------------------------------------------------------------

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
FU.rgbToHsl = (r, g, b) => {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
FU.hslToRgb = (h, s, l) => {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}
// FU.forlen(128,i=>log(FU.color(i/127),FU.hslToRgb(i/127,1,0.5)))


/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
FU.rgbToHsv = (r, g, b) => {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
FU.hsvToRgb = (h, s, v) => {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}
