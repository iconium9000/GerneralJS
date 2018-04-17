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
  function split(str,key) {
    var ary = str.split(key)
    var ret = []
    for (var i = 0; i < ary.length; ++i)
      ary[i] && ret.push(ary[i])

    return ret
  }
  function hvt(ary) {
    if (typeof ary == 'object')
      return doall(ary[0],ary,hvt)

    if (ary[0]=='#') {
      var s = split(ary,'#')
      var r = null
      for (var i=s.length-1;i>=0;--i) {
        var t = split(s[i],' ')
        r && t.push(r)
        r = t
      }

      err('r',r)
      return ary.slice(1).split(' ')
    }
    return ary
  }
  function splitkey(ary,key,last) {
    var rot = ary[0]
    if (rot=='txt') ary = ['vtxt',['stxt',ary[1]]]
    else if (rot!='vtxt') return null

    function dosplit(txt,idx,i) {
      var spltA = txt.slice(0,idx)
      var spltB = txt.slice(idx+key.length)
      retA = ary.slice(0,i)
      retA.push(['stxt',spltA])
      retB = ary.slice(i+1)
      retB.splice(0,0,'vtxt',['stxt',spltB])
      return [retA,retB,i+idx]
    }
    if (last) {
      for (var i=1;i<ary.length;++i) {
        var stxt = ary[i]
        if (stxt[0]!='stxt') continue
        var txt = stxt[1]
        var idx = txt.indexOf(key)
        if (idx<0) continue
        return dosplit(txt,idx,i)
      }
    }
    else for (var i=ary.length-1;i>0;--i) {
      var stxt = ary[i]
      if (stxt[0]!='stxt') continue
      var txt = stxt[1]
      var idx = txt.lastIndexOf(key)
      if (idx<0) continue
      return dosplit(txt,idx,i)
    }
    return null
  }

  var ATB = hvt(['frm','#S X T AB','#? !S #Z X','#Z R SA SB'])
  var BTA = hvt(['frm','#S X T BA','#? !S #Z X','#Z R SA SB'])
  var TAT = hvt([
    'frm',
    '#S X T AB','#? !S #Z X',
    '#S2 SB T2 AB','#? !S2 #E N T2',
    ['Z','V','SA','#F R S2A','S2B']
  ])
  var TBT = hvt([
    'frm',
    '#S X T AB','#? !S #Z X',
    '#F SB','#S F T2 AB','? !S2 #E N T2',
    '#Z V SA F S2B'
  ])
  var AT = hvt([
    'frm',
    '#S X T AB','? !S #Z X',
    ['Z','V','#F R SA','SB']
  ])
  var BT = hvt([
    'frm',
    'S(X,T,BA)','!S ? Z(X)',
    'Z(V,F(R,F(SA)),SB)'
  ])
  var TA = hvt([
    'frm',
  ])
  var TB = hvt([
    'frm',
  ])
  var ATCTB = hvt([
    'frm',
  ])

  var adlm = hvt([
    'adlm',
    ['dlm',ATB,'#set ='],
    ['dlm',BTA,'#add +','#sub -'],
    ['dlm',BTA,'#mul *','#div /'],
    ['dlm',ATB,'#pow ^'],
  ])

  err('adlm',adlm)
  function fx(ary,s) {
    var rot = ary[0]
    if (rot=='#') return fx(hvt(ary))
    if (!fx.all[rot]) throw `bad fx rot '${rot}'`
    var ret = fx.all[rot](ary,s)
    if (!ret) throw `fx rot '${rot}' no ret`
    return ret
  }

  fx.all = {
    'txt': ary => fx(['vtxt',['stxt',ary[1]]]),
    'vtxt': ary => dolep(ary,adlm,(dlm,ary)=>{
      err(dlm,ary)
      return ary
    })
  }

  return function(text) {
    var parse = fx(['txt',`{${text}}\n`])
    err('parse',parse)
    return text
  }
}()
