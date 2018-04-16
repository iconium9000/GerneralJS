log('init jcc.js')

jcc = function() {
  function doall(rot,ary,fun) {
    var ret = [rot]
    for (var i=1;i<ary.length;++i) {
      var subret = fun(ary[i],i)
      subret && ret.push(subret)
    }
    return ret
  }
  function dosom(ary,fun) {
    for (var i=1;i<ary.length;++i) {
      var ret = fun(ary[i],i)
      if (ret) return ret
    }
  }
  function dolep(rot,ary,fun) {
    for (var i=1;i<ary.length;++i)
      rot = fun(ary[i],rot,i)
    return rot
  }
  function hshcvt(ary) {
    if (typeof ary == 'object')
      return doall(ary[0],ary,hshcvt)
    if (ary[0]=='#') return ary.slice(1).split(' ')
    return ary
  }
  function splitkey(ary,key,last) {
    var rot = ary[0]
    if (rot=='txt') ary = ['vtxt',['stxt',ary[1]]]
    else if (rot!='vtxt') return null

    if (last) {
      for (var i=1;i<ary.length;++i) {
        var stxt = ary[i]
        if (stxt[0]!='stxt') continue
        var txt = stxt[1]
        var idx = txt.indexOf(key)
        if (idx<0) continue

        var spltA = txt.slice(0,idx)
        var spltB = txt.slice(idx+key.length)
        retA = ary.slice(0,i)
        retA.push(['stxt',spltA])
        retB = ary.slice(i+1)
        retB.splice(0,0,'vtxt',['stxt',spltB])
        return [retA,retB,i+idx]
      }
    }
    else for (var i=ary.length-1;i>0;--i) {
      var stxt = ary[i]
      if (stxt[0]!='stxt') continue
      var txt = stxt[1]
      var idx = txt.lastIndexOf(key)
      if (idx<0) continue

      var spltA = txt.slice(0,idx)
      var spltB = txt.slice(idx+key.length)
      retA = ary.slice(0,i)
      retA.push(['stxt',spltA])
      retB = ary.slice(i+1)
      retB.splice(0,0,'vtxt',['stxt',spltB])
      return [retA,retB,i+idx]
    }
    return null
  }

  var frms = {
    '$txt$tok$dep': [true,'mid'],
    '$dep$tok$txt': [false,'mid'],
    '$txt$tok': [true,'pst'],
    '$dep$tok': [false,'pst'],
    '$tok$dep': [true,'pre'],
    '$tok$txt': [false,'pre'],
  }
  var adlm = hshcvt([
    'adlm',
    ['dlm','#frm $txt$tok$dep','#set ='],
    ['dlm','#frm $dep$tok$txt','#add +','#sub -'],
    ['dlm','#frm $dep$tok$txt','#mul *','#div /'],
    ['dlm','#frm $txt$tok$dep','#pow ^'],
  ])

  err('adlm',adlm)
  function fx(ary,s) {
    var rot = ary[0]
    if (rot=='#') return fx(hshcvt(ary))
    if (!fx.all[rot]) throw `bad fx rot '${rot}'`
    var ret = fx.all[rot](ary,s)
    if (!ret) throw `fx rot '${rot}' no ret`
    return ret
  }

  fx.all = {
    'txt': (mtxt,s) =>  {
      var mtxt = dolep(mtxt,adlm,fx)
      err('txt',mtxt)
      return mtxt
    },
    'stxt': txt => txt,
    'vtxt': (ary,s) => {
      var prev = null
      var ret = ['vtxt']
      for (var i=1;i<ary.length;++i) {
        var tmp = ary[i]
        var rot = tmp[0]
        if (rot == 'txt') tmp = ['stxt',tmp[1]]
        else if (rot != 'stxt') {
          ret.push(prev = fx(tmp))
          continue
        }
        if (prev&&prev[0]=='stxt') {
          prev[1]+=tmp[1]
        }
        else {
          ret.push(prev = tmp)
        }
      }
      if (ret.length==1) return ['void']
      if (ret.length==2) {
        if (ret[1][0]=='stxt') return fx(['txt',ret[1][1]])
        return ret[1]
      }
      return ret
    },
    'dlm': (dlm,ary) => {
      var frm = dlm[1][1]
      var last = frms[frm]

      var splt = null
      var key = null
      var mix = last ? Infinity : -Infinity
      for (var i=2;i<dlm.length;++i) {
        var tmpsplt = splitkey(ary,dlm[i][1],last[0])
        if (tmpsplt&&((last&&tmpsplt[2]<mix)||(!last&&tmpsplt[2]>mix))) {
            mix = tmpsplt[2]
            splt = tmpsplt
            key = dlm[i][0]
        }
      }
      err('dlm',dlm)
      err('splt',splt)
      if (splt) {
        if (last[1]=='mid') {
          return fx([key,splt[0],splt[1]])
        }
        throw `bad tok '${last[1]}'`
      }
      return ary
    },
    'set': (ary,s) => {
      var valA = fx(ary[1])
      var valB = fx(ary[2])

      throw `fx set TODO`
    },
    'add': (ary,s) => {
      var valA = fx(ary[1])
      var valB = fx(ary[2])

      throw `fx add TODO`
    }
  }

  return function(text) {
    var parse = fx(['txt',`{${text}}\n`])
    err('parse',parse)
    return text
  }
}()
