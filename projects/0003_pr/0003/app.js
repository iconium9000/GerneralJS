log = console.log
err = console.error

DEF_TIME_ZONE_OFFSET = -8
DATE = new Date('7/30/18 13:00')
START_TIME = 5.5
MAX_END_TIME = 19
MAX_DTIME = 11.5

STOPS = {
  "West Springfield": 94,
  "Victor": 24,
  "Boston": 4,
  "Houston-North": 4,
  "Childress": 4
}

function round(num,pow) {
  return parseFloat(num.toFixed(pow))
}

function addtime(date,duration) {
  var h = Math.floor(duration)
  var m = (duration - h) * 60
  date.setHours(date.getHours() + h)
  date.setMinutes(date.getMinutes() + m)
  return new Date(date)
}
function gettime(date) {
  return date.getHours() + date.getMinutes() / 60
}
function hourdif(dateA,dateB) {
  return (dateB.getTime() - dateA.getTime()) / 3600000
}

{
  log(ZONES)
  STATES = STATES.replace(/\)/g,'(')
  STATES = STATES.replace(/\t/g,'')
  var temp = STATES.split('\n')

  STATES = {}
  for (var i in temp) {
    var k = temp[i].split('(')
    var z = ZONES[k[3]]
    if (k.length == 5 && z) {
      STATES[k[1]] = [k[0],k[3],z[1]]
    }
  }
  log(STATES)
}

{
  INWORD = 0
  INQUOTE = 1

  var word = ''
  var line = []
  var lines = []
  var flag = INWORD

  for (var i in DATA) {
    var c = DATA[i]
    if (flag == INWORD) {
      if (c == '"') {
        flag = INQUOTE
      }
      else if (c == ',') {
        // if (word) line.push(word)
        line.push(word)
        word = ''
      }
      else if (c == '\n') {
        // if (word) line.push(word)
        // if (line.length) lines.push(line)

        line.push(word)
        lines.push(line)
        word = ''
        line = []
      }
      else word += c
    }
    else if (flag == INQUOTE) {
      if (c == '"') flag = INWORD
      else word += c
    }
  }

  // if (word) line.push(word)
  // if (line.length) lines.push(line)
  line.push(word)
  lines.push(line)


  var prev = null
  var text = []//pline('',lines[0],true)
  var stop_code = ['name','state','TimeZone','dTime','cTime','speed',
    'dist','dist','rdist','kwh','wh/mi','upft','dnft']
  var stop_int = [false,false,false,false,false,true,
    false,true,true,true,true,true,true,true,true]

  PREV_STATE = null
  DAY = null
  PREV_NAME = null
  function printday(day) {
    log(day.depart.name)
    log(day.arrive.name)
    log(day.depart)
    log('strt',day.start.toLocaleString())
    log('end ',day.arrive.arrive.toLocaleString())

    var departTZ = day.depart.TimeZone - DEF_TIME_ZONE_OFFSET
    var depart = addtime(new Date(day.start),departTZ)
    err('strt',depart.toLocaleString())
    var arriveTZ = day.arrive.TimeZone - DEF_TIME_ZONE_OFFSET
    var arrive = addtime(new Date(day.end),arriveTZ)
    err('end ',arrive.toLocaleString())

    log('dTime',day.dTime)
    log('cTime',day.cTime)
    log('dist ',day.dist)
    log('speed',day.speed/day.dist)
    log('\n')
  }
  function getdate(date,stop) {
    var ans = null

    DAY = DAY || {
      depart: stop,
      arrive: stop,
      stop: null,
      start: new Date(date),
      end: null,
      dTime: 0,
      cTime: 0,
      speed: 0,
      dist: 0,
    }

    var fakedate = new Date(date)
    var arrive = addtime(fakedate,stop.dTime)
    var dtime = DAY.dTime + stop.dTime
    var end_time = gettime(fakedate)
    var prev_stop = DAY.arrive

    DAY.end = new Date(date)
    if (dtime > MAX_DTIME || end_time > MAX_END_TIME) {
      // DAY.stop = PREV_NAME
      ans = DAY
      addtime(date,24 - gettime(date) + START_TIME)

      log('next',fakedate.toLocaleString())
      log('nDtm',dtime)
      printday(DAY)
      DAY = {
        stop: null,
        start: new Date(date),
        arrive: prev_stop,
        depart: prev_stop,
        end: null,
        dTime: 0,
        cTime: 0,
        speed: 0,
        dist: 0,
      }
    }

    return ans
  }
  function pline(date,line,flag) {
    var ans = []
    var text = []

    var stop_flag = 0
    for (var j in line) {
      var linej = line[j]
      var word = linej
      if (j == '0' && !flag) {
        var temp = word.replace('Charge at ','').split(' Supercharger')[0]
        temp = temp.split(',')[0]
        temp = temp.slice(0,20)
        var len = word.length
        text.push(temp)
        word = word.slice(len-2)
        if (STATES[word]) {
          PREV_STATE = word
        }
        else word = PREV_STATE
        text.push(word)
        word = STATES[word][2]
      } else if (j == '1'){
        word = word.replace('  driving ','').split('   charging* ')
        text.push(word[0])
        word = word[1]
      }
      text.push(word)
      for (var s in STOPS) if (linej.indexOf(s) > -1) stop_flag = STOPS[s]
    }

    var stop = {}
    for (var i in text) {
      var val = text[i]
      var int = parseInt(val)
      var dur = val.split && val.split(':')
      if (dur && dur.length == 2) {
        var h = parseInt(dur[0]) || 0
        var m = parseInt(dur[1]) || 0
        val = h + m / 60
      }
      else if (!isNaN(int)) val = int
      stop[stop_code[i]] = val
    }

    var day = getdate(date,stop)
    day && ans.push(day)
    DAY.stop = stop.name
    DAY.arrive = stop
    DAY.dTime += stop.dTime
    DAY.cTime += stop.cTime
    DAY.dist += stop.dist
    DAY.speed += stop.speed * stop.dist
    stop.arrive = addtime(date,stop.dTime)
    stop.depart = addtime(date,stop.cTime)

    ans.push(stop)

    if (stop_flag > 0) {
      err(stop)
      // ans.push({
      //   'Visit': stop.name,
      //   start: stop.depart,
      //   end: addtime(date,stop_flag)
      // })
    }


    return ans
  }

  var movingdate = new Date(DATE)
  for (var i in lines) {
    var next = lines[i]
    if (next.length == 1) {
      var charge = prev[0].indexOf('Charge at ')
      if (charge == 0)
        text = text.concat(pline(movingdate,prev))
      // else log(prev)
    }
    prev = next
  }
  printday(DAY)
  log(text)
}
