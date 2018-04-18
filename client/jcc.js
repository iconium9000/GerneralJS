log('init jcc.js')

jcc = function() {
  function doall(rot,ary,fun) {
    var ret = [rot]
    for (var i=1;i<ary.length;++i) {
      var tmp = fun(ary[i],i)
      tmp && ret.push(tmp)
    }
    return ret
  }
  function doobj(ary,fun) {
    var ret = {}
    for (var i in ary) {
      var tmp = fun(ary[i],i)
      if (tmp) ret[i]=tmp
    }
    return ret
  }
  function docat(rot,ary,fun) {
    var ret = [rot]
    for (var i=1;i<ary.length;++i) {
      var tmp = fun(ary[i],i)
      if(tmp) ret = ret.concat(tmp)
    }
    return ret
  }
  function dosom(ary,fun) {
    for (var i=1;i<ary.length;++i) {
      var ret = fun(ary[i],i)
      if (ret) return ret
    }
    return null
  }
  function dobck(ary,fun) {
    for (var i=ary.length-1;i>0;--i) {
      var ret = fun(ary[i],i)
      if (ret) return ret
    }
    return null
  }
  function dolep(val,ary,fun) {
    for (var i=1;i<ary.length;++i){
      var tmp=fun(ary[i],val,i)
      if (!tmp) return val
      val = tmp
    }
    return val
  }
  function hsh(val) {
    if (typeof val=='string') {
      if (val[0]!='#')return val
      return val.slice(1).split(' ')
    }
    return doall(val[0],val,hsh)
  }
  function simp(vv) {
    var vrot = vv[0]
    var s = simp.all[vrot]
    if (!s) return vrot=='txt'&&!vv[1] ? ['void'] : vv
    var ret = docat(vrot,vv,v => {
      v = simp(v)
      var rot = v[0]
      if (rot==vrot) return v.slice(1)
      if (rot!='void') return [v]
    })
    if(ret.length==1)return['void']
    if(ret.length==2)return ret[1]
    return ret
  }
  simp.all = {
    'vtxt': 'txt',
    'vsat': 'sat'
  }
  simp.x = (val,vrot)=>val[0]==simp.all[vrot]?[vrot,val]:val
  simp.sx = (val,vrot)=>{
    val = simp(val)
    return val[0]==simp.all[vrot]?[vrot,val]:val
  }
  function split(dlm,vtxt,ftb,rot) {
    ftb=ftb=='ftb'
    return (ftb?dosom:dobck)(vtxt,(txt,i)=>{
      if (txt[0]!='txt')return
      txt = txt[1]
      var idx = ftb?txt.indexOf(dlm):txt.lastIndexOf(dlm)
      if (idx<0)return
      var txtA = ['txt',txt.slice(0,idx)]
      var retA = vtxt.slice(0,i)
      retA.push(txtA)
      var retB = vtxt.slice(i+1)
      var txtB = ['txt',txt.slice(idx+dlm.length)]
      retB.splice(0,0,'vtxt',txtB)
      return [i+idx,retA,retB,rot]
    })
  }

  var dfx = {
    'txt': '#vtxt', 'vtxt': '#vtxt',
    'sat': '#vsat', 'vsat': '#vsat',
    'scp': '#brk', 'tup': '#brk', 'vec':'#brk tup',
    'wrd': '#ret', 'void': '#ret',
    'com': ['ret',['void']], 'comln': ['ret',['txt','\n']],
    'cmp': '#tvv','pow': '#tvv','mul': '#tvv','div': '#tvv',
    'add': '#tvv','sub': '#tvv','set': '#tvv',
    'atm': '#atm',
  }
  var dlmld = [
    'adlm',
    ['TAT','#com /* */','#comln // \n'],
    ['TBT','#scp { }','#tup ( )','#vec [ ]'],
    ['ATB','#vsat ;','#vsat ,','#vsat \n'],
    ['ATB','#set ='],
    ['BTA','#add +','#sub -'],
    ['BTA','#mul *','#div /'],
    ['ATB','#pow ^'],
    ['ATB',['vtxt',' ']],
    '#AB cmp',
    '#A atm'
  ]

  function fx(val,s) {
    var rot = val[0]
    if (rot=='#')return fx(hsh(val),s)
    var sd = s&&s[0]=='stt'?'s':'d'
    var fun = fx[sd][rot]
    if (!fun) throw `bad fx rot '${rot}'`
    var ret = fun(val,s)
    if (!ret) throw `${sd}fx rot '${rot}' no ret`
    return ret
  }

  fx.d = function() {
    var adlm = function() {
      var ftf = (ftf,inf) => (dlm,vtxt)=>{
        var ret = dolep([inf],dlm,(d,r)=>{
          var s = split(d[1],vtxt,ftf,d[0])
          return s&&s[0]<r[0] ? s:r
        })
        if (ret[0]==inf) return
        return [ret[3],ret[1],ret[2]]
      }
      var dftb = ftf('ftb',Infinity)
      var dbtf = ftf('btf',-Infinity)
      var tabt = tok => (dlm,vtxt,f)=>{
        var ret = dftb(dlm,vtxt)
        if (!ret) return
        var rot = ret[0]
        var rdlm = dosom(dlm,d=>d[0]==rot&&d)
        var retA = ret[1]
        var retBC = ret[2]
        if (tok){
          var tmp = f(dlm,retBC,f)
          retBC = tmp ? simp.sx(tmp,'vtxt') : retBC
        }
        retBC = split(rdlm[2],retBC,'ftb',rot)
        if (!retBC) throw `no '${rdlm[2]}' after '${rdlm[1]}'`
        var retB = [rdlm[0],retBC[1]]
        if (!tok) retB = fx(retB)
        return ['vtxt',retA,retB,f(dlm,retBC[2],f)||retBC[2]]
      }
      var tdlm = {
        'A': (dlm,vtxt,f)=>[dlm[1],vtxt],
        'AB': (dlm,vtxt,f)=>{
          if(vtxt.length<3)return
          var retA = vtxt[1]
          var retB = vtxt.slice(2)
          retB.splice(0,0,'vtxt')
          retB = f(dlm,retB,f)||retB
          return [dlm[1],retA,retB]
        },
        'ATB': (dlm,vtxt,f)=>{
          var ret = dftb(dlm,vtxt)
          return ret && [ret[0],ret[1],f(dlm,ret[2],f)||ret[2]]
        },
        'BTA': (dlm,vtxt,f)=>{
          var ret = dbtf(dlm,vtxt)
          return ret && [ret[0],f(dlm,ret[1],f)||ret[1],ret[2]]
        },
        'TBT': tabt(true),
        'TAT': tabt(false)
      }
      return doall('adlm',dlmld,d=>{
        var dlm = hsh(d)
        var typ = tdlm[dlm[0]]
        if (!typ) throw `bad typ '${dlm[0]}'`
        return vtxt => {
          if (vtxt[0]!='vtxt')return
          var ret = typ(dlm,vtxt,typ)
          return ret ? simp.sx(ret,'vtxt') : vtxt
        }
      })
    }()
    var tfx = {
      'vtxt': d => val => {
        var ret = simp(dolep(simp.sx(val,'vtxt'),adlm,(dlm,vtxt)=>dlm(vtxt)))
        var rot = ret[0]
        if (rot=='txt'||rot=='vtxt') throw `bad rot '${rot}'`
        return fx(ret)
      },
      'vsat': d=> val => {
        var val = simp.sx(val,'vsat')
        var rot = val[0]
        if (rot!='vsat') return val
        return simp(doall('vsat',val,fx))
      },
      'brk': d => val => docat(val[0],val,v=>{
        v = fx(v)
        if (v[0]=='void')return
        if (v[0]=='vsat')return v.slice(1)
        return [v]
      }),
      'ret': d=>d[1]?(v=>d[1]):(v=>v),
      'tvv': d=> v =>[v[0],fx(v[1]),fx(v[2])],
      'atm': d=> v=>{
        v = simp(v[1])
        var rot = v[0]
        if (rot=='vtxt') throw `bad rot 'vtxt'`
        if (rot=='txt') return fx(['wrd',v[1]])
        return v
      }
    }
    return doobj(dfx,d=>{
      d = hsh(d)
      var k = tfx[d[0]]
      if (!k) throw `bad k '${d[0]}'`
      return k(d)
    })
  }()
  fx.s = {
    'scp': (val,s)=>{
      err(val)
    }
  }

  return function(text) {
    var stt = {
      0: 'stt',
      args: [],
      argS: {},
    }
    var parse = fx(fx(['txt',`{${text}}\n`]),stt)
    err('parse',parse)
    return text
  }
}()
