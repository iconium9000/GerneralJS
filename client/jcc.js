log('init jcc.js')

jcc = function() {
  function forall(ary,fun) {
    for (var i=1;i<ary.length;++i)fun(ary[i],i)
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
  function donon(ary,fun) {
    for (var i=1;i<ary.length;++i) {
      var ret = fun(ary[i],i)
      if (!ret) return false
    }
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
  function isallnum(typ) {
    if (typ[0]=='num')return true
    if (typ[0]=='vec')return isallnum(typ[1])
    if (typ[0]=='tup')return donon(typ,isallnum)
    return false
  }
  function isallbol(typ) {
    if (typ[0]=='bol')return true
    if (typ[0]=='vec')return isallbol(typ[1])
    if (typ[0]=='tup')return donon(typ,isallbol)
    return false
  }

  var mdlm = doobj('mdlm',{
    'txt': '#vtxt', 'vtxt': '#vtxt',
    'sat': '#vsat', 'vsat': '#vsat',
    'scp': '#brk', 'tup': '#brk', 'vec':'#brk tup',
    'wrd': '#@', 'void': '#@',
    'com': ['@',['void']], 'comln': ['@',['txt','\n']],
    'cmp': '#tvv','pow': '#tvv','mul': '#tvv','div': '#tvv',
    'add': '#tvv','sub': '#tvv','set': '#tvv',
    'atm': '#atm',
  },hsh)
  var adlm = hsh([
    'fdlm',
    ['TAT','#com /* */','#comln // \n'],
    '#bad */',
    ['TBT','#scp { }','#tup ( )','#vec [ ]'],
    '#bad } ) ]',
    ['ATB','#vsat ;','#vsat ,','#vsat \n'],
    ['ATB','#set ='],
    ['BTA','#add +','#sub -'],
    ['BTA','#mul *','#div /'],
    ['ATB','#pow ^'],
    ['ATB',['vtxt',' ']],
    '#AB cmp',
    '#A atm'
  ])
  var nats = doobj('nats',{
    'void': ['nat','#@'],
    'scp': ['nat','#scp ..'],
    'tup': ['nat','#@',
      '#vec $typ $typ',
      '#tup $typA $typB ..',
      '#vec $val $val ..',
      '#tup $valA $valB ..',
      '#vec $def $def ..',
      '#tup $defA $defB ..',
    ],
    'vec': ['nat','#@',
      '#vec $typ $typ',
      '#vec $val $val ..',
      '#vec $def $def ..',
    ],
    'set': ['nat','#set $var $val','#set $def $val'],
    'add': ['nat','#addA $allnum $allnum','#orA $allbol $allbol'],
    'sub': ['nat','#subA $allnum $allnum','#ornotA $allbol $allbol'],
    'mul': ['nat','#mulC $cmplxA $cmplxB'],
    'div': ['nat','#divC $cmplxA $cmplxB'],
    'pow': ['nat','#powC $cmplxA $cmplxB'],
    'conop': ['nat','#conop $bol $val $val'],
    'wrd': ['nat',
      '#typ @bol','#typ @num','#typ @vec1','#typ @vec2','#typ @vec3', '#nat @typ',
      '#nat @return', '#nat @if', '#nat @while', '#nat @for',
      '#nat @break', '#nat @continue', '#nat @goto',
      '#bol @true', '#bol @false',
      '#num $flt','#var $str'
    ],
    'cmp': ['nat',
      '#donat $nat @',
      ['dolam','#lam $typA $typB','$valA'],
      '#def $typ $var',
      '#ltyp $typA $typB', '#vtyp $typ $int',
      '#nlam $def $val', '#nlam $par $val',
      '#mulS $allnumA $allnumB','#mulB $allbolA $allbolB',
    ]
  },hsh)
  var styps = ['styps',
    ['$nat',v=>v[0]=='nat'],
    ['$void',v=>true],
    ['$bol',v=>true],
    ['$val',v=>true],
    ['$def',v=>v[0]=='def'],
    ['$par',v=>v[0]=='par'],
    ['$var',v=>v[0]=='var'],
    ['$varV',v=>v[0]=='var'&&v[1][0]=='void'],
    ['$int',v=>true],
    ['$typ',v=>v[0]=='typ'],
    ['$allnum',v=>{
      if (v[0]!='val'&&v[0]!='var')return false
      return isallnum(v[1])
    }],
    ['$allbol',v=>{
      if (v[0]!='val'&&v[0]!='var')return false
      return isallbol(v[1])
    }],
    ['$cmplx',v=>{
      err('$cmplx',v)
      if (v[0]!='val'&&v[0]!='var')return false
      var t = v[1]
      var ret = t[0]=='num'||(t[0]=='vec'&&t[1][0]=='num'&&t[2]==2)
      return ret
    }],
    ['lam',(m,v)=>{
      if (v[0]!='lam')return false
      err('lam',v)
      return true
    }]
  ]
  err(nats)
  err(styps)

  function fx(fxm,val,valB) {
    var rot = val[0]
    if (rot=='#')return fx(fxm,hsh(val))
    if (!fxm) throw `bad fxm`
    var fun = fxm[rot]
    if (!fun) throw `bad ${fxm[0]}fx rot '${rot}'`
    var ret = fun(val,valB)
    if (!ret) throw `${fxm[0]}fx rot '${rot}' no ret`
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
        if (tok){
          var tmp = f(dlm,retBC,f)
          retBC = tmp ? simp.sx(tmp,'vtxt') : retBC
        }
        retBC = split(rdlm[2],retBC,'ftb',rot)
        if (!retBC) throw `no '${rdlm[2]}' after '${rdlm[1]}'`
        var retB = [rdlm[0],retBC[1]]
        if (!tok) retB = fx(fxd,retB)
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
        'TAT': tabt(false),
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
      var k = tfx[d[0]]
      if (!k) throw `bad k '${d[0]}'`
      return k(d)
    })
  }()
  var fxs = function() {
    var sfx = {
      0: 'sfx',
      'typ': v=>v,
      'var': (v,s)=>{
        var a = v[1]
        var b = v[2]
        if (a[0]=='@') {
          v = s.scp[a] || dosom(s.scpS,s=>s[a])
          if (v) return v
          b = a
          a = ['void']
        }
        return s.scp[b] = ['var',a,b]
      },
      'num': v=>['val',['num'],v],
      'def': (v,s)=>{
        var a = v[1][1]
        var b = v[2][2]
        return ['def',a,s.scp[b] = fx(sfx,['var',a,b],s)]
      },
      'set': (v,s)=> {
        var a = v[1]
        var ar = a[0]
        if (ar=='def') return ['val',['void'],v]
        else return v
        var b = v[2]
        throw ['set',a,b]
      },
      'scp': (v,s)=>{
        err('scp',v,s)
        var ret = s.scp[0] || ['typ',['void']]
        s.scp = s.scpS.pop()||s.scp
        return ret
      },
      'nlam': (v,s)=>{
        err('nlam',v,s)
      },
      'powC': (v,s)=>{
        return ['val',['vec',['num'],2],v]
      }
    }
    var typmch = function() {
      function tmch(m,t,v,i) {
        err('tmch',t,i,v)
        return true // TODO
      }
      var nvmch = {'@': (m,v)=>true}
      forall(styps,n=>{
        var t = n[0]
        if (t[0]!='$') return nvmch[t]=n[1]
        nvmch[t]=(m,v)=>n[1](v)&&tmch(m,t,v,0)
        nvmch[t+'A']=(m,v)=>n[1](v)&&tmch(m,t,v,1)
        nvmch[t+'B']=(m,v)=>n[1](v)&&tmch(m,t,v,2)
      })
      return (m,n,v) => {
        var nr = n[0]
        var ns = nr=='$'||nr=='@'?n:nr
        var f = nvmch[ns]
        if (!f) throw `bad nat '${ns}'`
        return f(m,v)
      }
    }()
    function wrdnat(nat) {
      return (v,s)=>dosom(nat,n=>{
        var w = v[1]
        var rot = n[0]
        var nw = n[1]
        if (nw[0]=='@') {
          nw = nw.slice(1)
          return nw==w&&fx(sfx,[rot,[nw]],s)
        }
        if (nw=='$flt') return isflt(w)&&fx(sfx,[rot,parseFloat(w)],s)
        if (nw=='$str') return fx(sfx,[rot,'@'+w],s)
        throw `bad nat '${nw}'`
      })
    }
    function valnat(nat,key){
      return (v,s)=>{
        if(v[0]=='scp'){
          s.scp && s.scpS.push(s.scp)
          s.scp=[]
        }
        if (v[0]=='set'){
          var b = fx(fxs,v[2],s)
          var a = fx(fxs,v[1],s)
          v = [v[0],a,b]
        }
        else {
          v=doall(v[0],v,t=>fx(fxs,t,s))
        }
        var vlen = v.length-1
        return dosom(nat,n=>{
          var rot = n[0]
          var len = n.length-1
          err('valnat',n,nat)
          if (len==0) return fx(sfx,rot=='@'?v[1]:[rot],s)
          var lst = n[len]
          var m = []
          if (lst=='..') {
            if (len==1)return fx(sfx,doall(rot,v,t=>t),s)
            if (len!=3)throw `bad nat len '${len}'`
            throw `TODO ..`
          }
          else if (len!=vlen)return
          if (dosom(v,(t,i)=>!typmch(m,n[i],t))) {
             err('fail',v,n)
             return
          }
          return fx(sfx,doall(n[0],v),s)
        })
      }
    }
    return doobj('stt',nats,(nat,key)=>(key=='wrd'?wrdnat:valnat)(nat,key))
  }()
  err(fxs)

  return function(text) {
    var stt = {
      0: 'stt',
      scp: null,
      scpS: []
    }
    var parse = fx(fxs,fx(fxd,['txt',`{${text}}\n`]),stt)
    err('parse',parse)
    return text
  }
}()
