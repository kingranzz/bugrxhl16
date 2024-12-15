global.prefa = ['','!','.',',','🐤','🗿']
global.falown = "You are not an Owner"
global.falmurbug = "You are not premium"
global.inputnum = "Please Enter Number"
global.falgrup = "Only Group"
global.imagemenu = ["https://files.catbox.moe/09bo1w.jpeg"];

global.owner = [
  "628565394116", //should start with country code
  ""  //second number if available
]


let fs = require('fs')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})