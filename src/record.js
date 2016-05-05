let fs = require('fs')
let exec = require('child_process').exec
let cmd = 'ps aux | grep node'
let file = cmd.replace(/[^a-z]/gi, '-')

try {
  fs.truncateSync('./'+ file +'.txt')
}
catch (e) {

}

function save (text) {
  let endtext = text.split('\n')
    .filter(n => n !== '')
    .map(n => Date.now() +' '+ n)

  fs.writeFile('./'+ file +'.txt', endtext.join('\n') + '\n', { flag: 'a' })
}

setInterval(function () {
  exec(cmd, (error, stdout, stderr) => {
    if (error) throw error
    save(stdout)
  })
}, 5000)
