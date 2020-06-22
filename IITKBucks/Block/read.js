const fs = require('fs');
const prompt = require('prompt-sync')({sigint: true});
const axios = require('axios');

const Block_Body = require('./Read_Block_Classes/Block_Body');

var file = '../Blocks/Block1.dat'
var Byte = fs.readFileSync(file);
console.log(Byte);
var url = prompt('url: ')
axios.get(url+'/add/1').then(function(res){
    console.log(Buffer.from(res.data,'utf8'));
    // var Block = new Block_Body(Buffer.from(res.data,'binary'));
    // Block.Display;
})
