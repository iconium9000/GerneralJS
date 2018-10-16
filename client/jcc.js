log('init jcc.js')

jcc = text => jcc_fx(['main',['txt',`@{${text}}\n`]])

jcc_h = [
  ['frep','#main $argA','#rep $argA $funA $funB']
]
jcc_f = {
  // [rep $arg $funA $funB ..]
  rep: v => {
    var ret = v[1]
    for (var i=2;i<v.length;++i) ret = jcc_fy(v[i],ret)
    return ret
  },
  // [doall [rot] $arg $fun]
  doall: v => {
    var rot = v[1][0], ret = [rot], arg = v[2], fun = v[3]
    for (var i=1;i<arg.length;++i) ret.push(fcc_fy(fun,arg[i]))
    return ret
  }
}

jcc_fx = v => {
  err(v)
}
jcc_fy = (f,v) => {

}
