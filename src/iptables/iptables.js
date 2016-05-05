let os = require('os')
let fs = require('fs')
let cp = require('child_process')
let type = 'iptables'

class Iptables {
  constructor () {
    process.title = 'node '+ type +' master'
    setInterval(this.write, 5000)
    this.fork()
  }

  write () {
    fs.writeFile('./data/'+ type +'-master.mem', Date.now()
      +' '+ JSON.stringify(process.memoryUsage()) +'\n', { flag: 'a' })

    fs.writeFile('./data/'+ type +'-master.cpu', Date.now()
      +' '+ JSON.stringify(os.loadavg()) +'\n', { flag: 'a' })
  }

  fork (id) {
    let cpus = os.cpus().length

    for (let i = 0; i < cpus; i++) {
      cp.fork('./'+ type +'-worker', {env: {id: i}})
    }
  }
}

new Iptables()
