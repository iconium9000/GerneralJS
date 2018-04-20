log('init jcc.js')

jcc = function() {
  // helpers
  {
    function forall(ary,fun) {
      for (var i=1;i<ary.length;++i)fun(ary[i],i)
    }
    function forobj(ary,fun) {
      for (var i in ary) fun(ary[i],i)
    }
    function setrot(rot,ary) {
      var ret = [rot]
      for (var i=1;i<ary.length;++i) ret.push(ary[i])
      return ret
    }
    function doall(rot,ary,fun) {
      var ret = [rot]
      for (var i=1;i<ary.length;++i) {
        var tmp = fun?fun(ary[i],i):ary[i]
        tmp && ret.push(tmp)
      }
      return ret
    }
    function doobj(rot,ary,fun) {
      var ret = {0:rot}
      for (var i in ary) {
        if (i=='0')continue
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
    function isall(ary,fun) {
      for (var i=1;i<ary.length;++i) {
        var ret = fun(ary[i],i)
        if (!ret) return false
      }
      return true
    }
    function mchall(a,b,fun) {
      if (a[0]!=b[0]||a.length!=b.length) return false
      for (var i=1;i<a.length;++i)
        if (!fun(a[i],b[i],i)) return false
      return true
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
    function isflt(i) { return !isNaN(parseFloat(i))}
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
    function findkey(dlm,vtxt) {
      return dosom(vtxt,txt=>txt[0]=='txt'&&txt[1].indexOf(dlm)>=0)
    }
  }
  var mdlm = doobj('mdlm',help_mdlm,hsh)
  var adlm = hsh(help_adlm)
  var nats = doobj('nats',help_nats,hsh)

  function fx(fxm,val,valB) {
    var rot = val[0]
    if (rot=='#')return fx(fxm,hsh(val))
    if (!fxm) throw `bad fxm`
    var fun = fxm[rot]
    if (!fun) throw `bad ${fxm[0]}fx rot '${rot}'`
    var ret = fun(val,valB)
    if (!ret) throw err('fxerr',val)||`${fxm[0]}fx rot '${rot}' no ret`
    return ret
  }

  var fxd = function() {
    var fdlm = function() {
      var ftf = (ftf,inf) => (dlm,vtxt)=>{
        var ret = dolep([inf],dlm,(d,r)=>{
          var s = split(d[1],vtxt,ftf,d[0])
          return s&&(ftf=='ftb'?s[0]<r[0]:s[0]>r[0]) ? s:r
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

        if (tok=='TBT'||tok=='ATBTB'){
          var tmp = f(dlm,retBC,f)
          retBC = tmp ? simp.sx(tmp,'vtxt') : retBC
        }
        retBC = split(rdlm[2],retBC,'ftb',rot)
        if (!retBC) throw `no '${rdlm[2]}' after '${rdlm[1]}'`
        var retB = retBC[1]
        var retC = retBC[2]
        if (tok=='ATBTB') return [rdlm[0],retA,retB,f(dlm,retC,f)||retC]
        retB = [rdlm[0],retB]
        if (tok=='TAT') retB = fx(fxd,retB)
        return ['vtxt',retA,retB,f(dlm,retC,f)||retC]
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
        'ASB': (dlm,vtxt,f)=>{
          var ret = dftb(dlm,vtxt)
          return ret && [ret[0],ret[1],f(dlm,ret[2],f)||ret[2]]
        },
        'ATB': (dlm,vtxt,f)=>{
          var ret = dftb(dlm,vtxt)
          return ret && [ret[0],f(dlm,ret[2],f)||ret[2],ret[1]]
        },
        'BTA': (dlm,vtxt,f)=>{
          var ret = dbtf(dlm,vtxt)
          return ret && [ret[0],f(dlm,ret[1],f)||ret[1],ret[2]]
        },
        'ATBTB': tabt('ATBTB'),
        'TBT': tabt('TBT'),
        'TAT': tabt('TAT'),
        'bad': (dlm,vtxt,f)=>dosom(dlm,d=>{if (findkey(d,vtxt)) throw `bad dlm '${d}'`})
      }
      return doall('fdlm',adlm,dlm=>{
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
        var ret = simp(dolep(simp.sx(val,'vtxt'),fdlm,(dlm,vtxt)=>dlm(vtxt)))
        var rot = ret[0]
        if (rot=='txt'||rot=='vtxt') throw `bad rot '${rot}'`
        return fx(fxd,ret)
      },
      'vsat': d=> val => {
        var val = simp.sx(val,'vsat')
        var rot = val[0]
        if (rot!='vsat') return val
        return simp(doall('vsat',val,v=>fx(fxd,v)))
      },
      'brk': d => val => docat(val[0],val,v=>{
        v = fx(fxd,v)
        if (v[0]=='void')return
        if (v[0]=='vsat')return v.slice(1)
        return [v]
      }),
      'conop': d=> val => doall('conop',val,v=>fx(fxd,v)),
      '@': d=>d[1]?(v=>d[1]):(v=>v),
      'tvv': d=> v =>[v[0],fx(fxd,v[1]),fx(fxd,v[2])],
      'atm': d=> v=>{
        v = simp(v[1])
        var rot = v[0]
        if (rot=='vtxt') throw `bad rot 'vtxt'`
        if (rot=='txt') return fx(fxd,['wrd',v[1]])
        return v
      }
    }
    return doobj('dlm',mdlm,d=>{
      var dlm = tfx[d[0]]
      if (!dlm) throw `bad dlm '${d[0]}'`
      return dlm(d)
    })
  }()
  var fxs = function() {
    function hastyp(val) {
      var r = val[0]
      // err('hastyp',val)
      return r&&r!='nat'
    }
    function alltyp(tok) {
      var tokA = '$'+tok
      var tokB = '$all'+tok
      return t=>{
        // err('alltyp',tok)
        if (equtyp(tokA,t)) return true
        if (t[0]=='vec')return equtyp(tokB,t[1])
        if (t[0]=='tup')return isall(t,ti=>equtyp(tokB,ti))
        return false
      }
    }
    var typs= {
      '$typ': t=>t[0]=='typ',
      '$void': t=>t[0]=='void',
      '$num': t=>t[0]=='num',
      '$bol': t=>t[0]=='bol',
      '$true': t=>t==true,
      '$allnum': alltyp('num'),
      '$allbol': alltyp('bol'),
      '$cmplx': t=>equtyp('$num',t)||equtyp('$vec2',t),
      '$vec2': t=>equtyp(['vec','$num',2],t),
      '$vec3': t=>equtyp(['vec','$num',3],t)
    }
    function equtyp(a,b){
      // err('equtyp',a,b)
      if (b[0]=='$'&&a[0]!='$')return equtyp(b,a)
      if (a[0]=='$') {
        if (typs[a]) return a==b||typs[a](b)
        if (b[0]=='$') return a==b
        throw `bad typ '${a}'`
      }
      return a.length ? mchall(a,b,equtyp) : a==b
    }
    var styps = {
      0:'styps',
      '$nat':v=>v[0]=='nat',
      '$flt':isflt,'$str':v=>true,
      '$val':v=>hastyp(v)&&!equtyp('$void',v[1])&&!equtyp('$typ',v[1]),
      '$def':v=>v[0]=='def',
      '$par':v=>v[0]=='par',
      '$var':v=>v[0]=='var',
      '$varV':v=>v[0]=='var'&&v[1][0]=='void',
      '$int':v=>v[0]=='num'
    };forobj(typs,(s,i)=>styps[i]=i=='$typ'?typs[i]:v=>hastyp(v)&&equtyp(i,v[1]))

    function gettidx(t) {
      var len = t.length-1
      var lst = t[len]
      return lst=='A'||lst=='B'?[t.slice(0,len),lst=='A'?2:3]:[t,1]
    }
    var natfx = {
      0: 'donat',
      'bol':(v,s)=>['bol','$bol',equtyp('$true',v[2])],
      'num':(v,s)=>['num','$num',parseFloat(v[1])],
      'typ':(v,s)=>err('typ',v)||v,
      'var':(v,s)=>{
        v = '@'+v[1]
        var ret = s.scp[v] || dosom(s.scpS,ss=>s[v])
        if (ret) return ret
        var svar = s.scp[v] = ['var','$void',v,s.vars.length]
        s.vars.push(svar)
        // err('var',svar)
        return svar
      },
      'def':(v,s)=>{
        var svar = s.scp[v[2][2]] = ['var',v[1][1],v[2][2],s.vars.length]
        s.vars.push(svar)
        return ['def',v[1][1],svar]
      },
      'conop':(v,s)=>['conop',v[2][1],v[1],v[2],v[3]],
      'addA':(v,s)=>['addA',v[1][1],v[1],v[2]],
      'powC':(v,s)=>['powC',equtyp(v[1][1],v[2][1])?v[1][1]:'$vec2',v[1],v[2]],
      'setV':(v,s)=>['set',v[1][1],v[1],v[2]],
      'setD':(v,s)=>['set','$void',v[1],v[2]],
      'ret':(v,s)=>{
        if (!s.scp.ret) s.scp.ret = v[1][1]
        else if (!equtyp(s.scp.ret,v[1][1])) throw `ret typ err`
        return ['ret','$void',v[1]]
      },
      'voidvec':(v,s)=>['voidvec','$void'],
      'voidtup':(v,s)=>['voidtup','$void'],
      'vtyp':(v,s)=>['typ',['vec',v[1][1],v[2][2]]],
      'typvec':(v,s)=>v.length==2?v[1]:['typ',v[1][1],v.length-1],
      'typtup':(v,s)=>v.length==2?v[1]:['typ',doall('tup',v,v=>v[1])],
      'vec':(v,s)=>['vec',v.length==2?v[1][1]:['vec',v[1][1],v.length-1]].concat(v.slice(1)),
      'tup':(v,s)=>['tup',v.length==2?v[1][1]:doall('tup',v,v=>v[1])].concat(v.slice(1)),
      'scp':(v,s)=>{
        var ret = s.scp.ret || '$void'
        s.scp = s.scpS.pop() || s.scp
        return ['scp',ret].concat(v.slice(1))
      },
      'donat':(v,s)=>mchnats(v[1],['vnat',v[2]],s)
    }
    function mchtyp(m,n,v) {
      // err('mchtyp',m,n,v)
      if (n[0]=='$') {
        var tidx = gettidx(n)
        var styp = styps[tidx[0]]
        if (!styp) throw `bad styp '${tidx[0]}'`
        // err(m,tidx[0],v,styp(v))
        if (!styp(v)) return false
        if (m[0]||!hastyp(v)) return true
        tidx = tidx[1]
        // err('tidx',m[tidx],v[1],m[tidx]&&equtyp(m[tidx],v[1]))
        if (m[tidx]) return equtyp(m[tidx],v[1])
        m[tidx] = v[1]
        return true
      }
      if (n[0]=='@') return true
      if (!hastyp(v)) return false
      return mchall(n,v[1],(a,b)=>mchtyp(m,a,b))
    }
    function mchnat(nat,val,s) {
      err('mchnat',nat,val,s)
      var len = nat.length-1
      var lst = nat[len]
      if (lst=='..') {
        if (len==1) return fx(natfx,setrot(nat[0],val),s)
        if (len!=2) throw `bad nat '${nat}'`
        var tidx = gettidx(nat[1])
        var m = [tidx[1]!=1]
        if (!isall(val,v=>mchtyp(m,tidx[0],v))) return false
        return fx(natfx,setrot(nat[0],val),s)
      }
      var vlen = val.length-1
      if (len!=vlen) return false
      var m = []
      // err('mn',nat,val)
      if (!isall(nat,(n,i)=>mchtyp(m,n,val[i]))) return false
      return fx(natfx,setrot(nat[0],val),s)
    }
    function mchnats(nat,v,s){
      // err('mchnats',nat,v)
      return dosom(nat,n=>mchnat(n,v,s))
    }
    var prenats = {
      'scp':n=> (v,s)=>{
        s.scp&&s.scpS.push(s.scp)
        s.scp=['scpS']
        return mchnats(n,doall('scp',v,t=>fx(fxs,t,s)),s)
      },
      'wrd':n=> (v,s)=>nats[v[1]]?fx(natfx,nats[v[1]],s):mchnats(n,v,s)
    }
    function prenat(nat,nrot) {
      if (prenats[nrot]) return prenats[nrot](nat)
      return (v,s)=>mchnats(nat,doall(v[0],v,t=>fx(fxs,t,s)),s)
    }
    return doobj('mch',nats,prenat)
  }()
  // err(fxs)

  return function(text) {
    var parse = fx(fxd,['txt',`{${text}}\n`])
    // err('fxd parse',parse)
    // throw 'stop'
    var stt = {
      0: 'stt',
      scp: null,
      scpS: [],
      vars: []
    }
    var parse = fx(fxs,parse,stt)
    err('parse',parse,stt)
    return text
  }
}()
