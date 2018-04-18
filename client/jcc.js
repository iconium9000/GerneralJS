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

  function dodlm(dlm,vtxt) {
    if (vtxt[0]!='vtxt')return
    var typ = dodlm.typ[dlm[0]]
    if (!typ) throw `bad typ '${dlm[0]}'`
    var ret = typ(dlm,vtxt,typ)
    return ret ? simp.x(ret,'vtxt') : vtxt
  }
  {
    dodlm.vtxt = val => {
      var ret = simp(dolep(simp.sx(val,'vtxt'),dodlm.mdl,dodlm))
      var rot = ret[0]
      if (rot=='txt'||rot=='vtxt') throw `bad rot '${rot}'`
      return fx(ret)
    }
    dodlm.vsat = val => {
      var val = simp.sx(val,'vsat')
      var rot = val[0]
      if (rot!='vsat') return val
      return simp(doall('vsat',val,fx))
    }
    dodlm.brk = val => docat(val[0],val,v=>{
      v = fx(v)
      if (v[0]=='void')return
      if (v[0]=='vsat')return v.slice(1)
      return [v]
    })
    dodlm.ftb = (dlm,vtxt)=>{
      var ret = dolep([Infinity],dlm,(d,r)=>{
        var s = split(d[1],vtxt,'ftb',d[0])
        return s&&s[0]<r[0] ? s:r
      })
      if (ret[0]==Infinity) return
      return [ret[3],ret[1],ret[2]]
    }
    dodlm.btf = (dlm,vtxt)=>{
      var ret = dolep([-Infinity],dlm,(d,r)=>{
        var s = split(d[1],vtxt,'btf',d[0])
        return s&&s[0]>r[0] ? s:r
      })
      if (ret[0]==-Infinity) return
      return [ret[3],ret[1],ret[2]]
    }
    dodlm.typ = {
      'A': (dlm,vtxt,f)=>[dlm[1],vtxt],
      'AB': (dlm,vtxt,f)=>{
        if(vtxt.length<3)return
        var retA = vtxt[1]
        var retB = vtxt.slice(2)
        retB.splice(0,0,'vtxt')
        retB = f(dlm,retB,f)||retB
        // err(retA,retB)
        return [dlm[1],retA,retB]
      },
      'ATB': (dlm,vtxt,f)=>{
        var ret = dodlm.ftb(dlm,vtxt)
        return ret && [ret[0],ret[1],f(dlm,ret[2],f)||ret[2]]
      },
      'BTA': (dlm,vtxt,f)=>{
        var ret = dodlm.btf(dlm,vtxt)
        return ret && [ret[0],f(dlm,ret[1],f)||ret[1],ret[2]]
      },
      'TBT': (dlm,vtxt,f)=>{
        var ret = dodlm.ftb(dlm,vtxt)
        if (!ret) return
        var rot = ret[0]
        var rdlm = dosom(dlm,d=>d[0]==rot&&d)
        var retA = ret[1]
        var retBC = ret[2]
        var tmp = f(dlm,retBC,f)
        retBC = tmp ? simp.sx(tmp,'vtxt') : retBC
        retBC = split(rdlm[2],retBC,'ftb',rot)
        if (!retBC) throw `no '${rdlm[2]}' after '${rdlm[1]}'`
        var retB = retBC[1]
        var retC = retBC[2]
        return ['vtxt',retA,[rdlm[0],retB],f(dlm,retC,f)||retC]
      }
    }
    dodlm.mdl = hsh([
      'adlm',
      ['TBT','#scp { }','#tup ( )','#vec [ ]'],
      ['ATB','#vsat ;','#vsat ,','#vsat \n'],
      ['ATB','#set ='],
      ['BTA','#add +','#sub -'],
      ['ATB',['vtxt',' ']],
      '#AB cmp',
      '#A atm'
    ])
  }
  function fx(val) {
    var rot = val[0]
    // err(val)
    if (rot=='#')return fx(hsh(val))
    var fun = fx.all[rot]
    if (!fun) throw `bad fx rot '${rot}'`
    var ret = fun(val)
    if (!ret) throw `fx rot '${rot}' no ret`
    return ret
  }
  fx.all = {
    'txt': dodlm.vtxt, 'vtxt': dodlm.vtxt,
    'sat': dodlm.vsat, 'vsat': dodlm.vsat,
    'scp': dodlm.brk, 'tup': dodlm.brk, 'vec': dodlm.brk,
    'wrd': val => val,
    'void': val => val,
    'cmp': val => {
      var valA=fx(val[1]),valB=fx(val[2])
      if (valA[0]=='void')return valB
      if (valB[0]=='void')return valA
      return['cmp',valA,valB]
    },
    'add': val => ['add',fx(val[1]),fx(val[2])],
    'sub': val => ['sub',fx(val[1]),fx(val[2])],
    'set': val => ['set',fx(val[1]),fx(val[2])],
    'atm': val => {
      val = simp(val[1])
      var rot = val[0]
      if (rot=='vtxt') throw `bad rot 'vtxt'`
      if (rot=='txt') return fx(['wrd',val[1]])
      return val
    }
  }

  return function(text) {
    var parse = fx(['txt',`{${text}}\n`])
    err('parse',parse)
    return text
  }
}()
