const fs = require('fs');
const prompt = require('prompt-sync')({sigint: true});
const axios = require('axios');

const Block_Body = require('./Read_Block_Classes/Block_Body');

var url = prompt('url: ')
axios.get(url+'/add/1').then(function(res){
    //var Byte = Buffer.from(res.data);
    console.log(Buffer.from(res.data));
    var Block = new Block_Body(Buffer.from(res.data));
    Block.Display;
})
