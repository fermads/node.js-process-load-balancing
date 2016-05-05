let fs = require('fs')
let http = require('http')
let type = 'iptables'
let hit = 0, id

class Worker {
  constructor () {
    id = Number(process.env.id)
    process.title = 'node '+ type +' worker '+ id
    this.webserver()
    setInterval(this.write, 5000)
  }

  write () {
    fs.writeFile('./data/'+ type +'-worker'+ id +'.hit', hit)
    fs.writeFile('./data/'+ type +'-worker'+ id +'.mem', Date.now()
      +' '+ JSON.stringify(process.memoryUsage())
      +'\n', { flag: 'a' })
  }

  webserver () {
    let server = http.createServer((req, res) => {
      if (hit++ % 100 === 0) {
        console.log('Worker', id, 'received', hit, 'requests')
      }

      res.writeHead(200)
      res.end('ok')
    }).listen(8080 + id, () => {
      console.log('Worker', id, 'listening on port', server.address().port)
    })
  }
}

new Worker()
