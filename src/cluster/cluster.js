let os = require('os')
let fs = require('fs')
let cluster = require('cluster')
let Worker = require('./cluster-worker')
let type = 'cluster'

class Cluster {
  constructor () {
    if (cluster.isMaster) {
      process.title = 'node '+ type +' master'
      setInterval(this.write, 5000)
      this.fork()
    }
    else {
      new Worker()
    }
  }

  write () {
    fs.writeFile('./data/'+ type +'-master.mem', Date.now()
      +' '+ JSON.stringify(process.memoryUsage()) +'\n', { flag: 'a' })

    fs.writeFile('./data/'+ type +'-master.cpu', Date.now()
      +' '+ JSON.stringify(os.loadavg()) +'\n', { flag: 'a' })
  }

  fork () {
    let cpus = os.cpus().length

    for (let i = 0; i < cpus; i++) {
      cluster.fork({id: i})
    }
  }
}

new Cluster()
